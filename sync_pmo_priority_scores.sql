BEGIN;

ALTER TABLE iota_v2.iota_pmo_tasks
ADD COLUMN IF NOT EXISTS priority_score_updated_at TIMESTAMPTZ;

DO $$
DECLARE
    constraint_row RECORD;
BEGIN
    FOR constraint_row IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'iota_v2.iota_pmo_tasks'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%meeting_grade%'
    LOOP
        EXECUTE format(
            'ALTER TABLE iota_v2.iota_pmo_tasks DROP CONSTRAINT %I',
            constraint_row.conname
        );
    END LOOP;
END;
$$;

ALTER TABLE iota_v2.iota_pmo_tasks
ADD CONSTRAINT iota_pmo_tasks_meeting_grade_check
CHECK (meeting_grade IN ('A', 'B', 'C', 'D'));

CREATE OR REPLACE FUNCTION iota_v2.normalize_pmo_due_date(p_due_date DATE)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
SET search_path = iota_v2, public
AS $$
    SELECT CASE
        WHEN p_due_date < DATE '2026-07-20' THEN DATE '2026-07-27'
        ELSE p_due_date
    END;
$$;

CREATE OR REPLACE FUNCTION iota_v2.normalize_pmo_status(
    p_due_date DATE,
    p_status TEXT
)
RETURNS TEXT
LANGUAGE SQL
STABLE
SET search_path = iota_v2, public
AS $$
    WITH normalized AS (
        SELECT
            iota_v2.normalize_pmo_due_date(p_due_date) AS due_date,
            CASE
                WHEN p_due_date < DATE '2026-07-20' AND COALESCE(p_status, '진행중') = '지연'
                    THEN '진행중'
                ELSE COALESCE(p_status, '진행중')
            END AS status
    )
    SELECT CASE
        WHEN due_date < CURRENT_DATE AND status NOT IN ('완료', '지연') THEN '지연'
        ELSE status
    END
    FROM normalized;
$$;

CREATE OR REPLACE FUNCTION iota_v2.calculate_pmo_priority_score(
    p_importance_level TEXT,
    p_is_blocker BOOLEAN,
    p_needs_decision BOOLEAN,
    p_support_needed TEXT,
    p_due_date DATE,
    p_status TEXT,
    p_task_type TEXT
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SET search_path = iota_v2, public
AS $$
    WITH normalized AS (
        SELECT
            iota_v2.normalize_pmo_due_date(p_due_date) AS due_date,
            iota_v2.normalize_pmo_status(p_due_date, p_status) AS status
    )
    SELECT
        CASE COALESCE(p_importance_level, '중간')
            WHEN '준공필수' THEN 30
            WHEN 'PF필수' THEN 25
            ELSE 0
        END
        + CASE WHEN COALESCE(p_is_blocker, FALSE) THEN 20 ELSE 0 END
        + CASE WHEN COALESCE(p_needs_decision, FALSE) THEN 15 ELSE 0 END
        + CASE
            WHEN LOWER(TRIM(COALESCE(p_support_needed, ''))) NOT IN (
                '', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'
            ) THEN 15
            ELSE 0
        END
        + CASE
            WHEN status = '지연' THEN 15
            WHEN due_date IS NOT NULL
                 AND status <> '완료'
                 AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN 10
            ELSE 0
        END
        + CASE WHEN COALESCE(p_task_type, '정규') = '팝업' THEN 5 ELSE 0 END
    FROM normalized;
$$;

CREATE OR REPLACE FUNCTION iota_v2.pmo_meeting_grade(p_priority_score INTEGER)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
SET search_path = iota_v2, public
AS $$
    SELECT CASE
        WHEN p_priority_score >= 70 THEN 'A'
        WHEN p_priority_score >= 50 THEN 'B'
        WHEN p_priority_score >= 30 THEN 'C'
        ELSE 'D'
    END;
$$;

CREATE OR REPLACE FUNCTION iota_v2.set_pmo_priority_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = iota_v2, public
AS $$
DECLARE
    original_due_date DATE;
BEGIN
    original_due_date := NEW.due_date;
    NEW.due_date := iota_v2.normalize_pmo_due_date(original_due_date);
    NEW.status := iota_v2.normalize_pmo_status(original_due_date, NEW.status);
    NEW.priority_score := iota_v2.calculate_pmo_priority_score(
        NEW.importance_level,
        NEW.is_blocker,
        NEW.needs_decision,
        NEW.support_needed,
        NEW.due_date,
        NEW.status,
        NEW.task_type
    );
    NEW.meeting_grade := iota_v2.pmo_meeting_grade(NEW.priority_score);
    NEW.priority_score_updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_pmo_priority_fields_trigger
ON iota_v2.iota_pmo_tasks;

CREATE TRIGGER set_pmo_priority_fields_trigger
BEFORE INSERT OR UPDATE ON iota_v2.iota_pmo_tasks
FOR EACH ROW
EXECUTE FUNCTION iota_v2.set_pmo_priority_fields();

CREATE OR REPLACE FUNCTION iota_v2.sync_pmo_priority_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = iota_v2, public
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    WITH expected AS (
        SELECT
            task.id,
            iota_v2.normalize_pmo_due_date(task.due_date) AS due_date,
            iota_v2.normalize_pmo_status(task.due_date, task.status) AS status,
            iota_v2.calculate_pmo_priority_score(
                task.importance_level,
                task.is_blocker,
                task.needs_decision,
                task.support_needed,
                task.due_date,
                task.status,
                task.task_type
            ) AS priority_score
        FROM iota_v2.iota_pmo_tasks AS task
    ), scored AS (
        SELECT
            expected.*,
            iota_v2.pmo_meeting_grade(expected.priority_score) AS meeting_grade
        FROM expected
    )
    UPDATE iota_v2.iota_pmo_tasks AS task
    SET
        due_date = scored.due_date,
        status = scored.status,
        priority_score = scored.priority_score,
        meeting_grade = scored.meeting_grade,
        priority_score_updated_at = NOW()
    FROM scored
    WHERE task.id = scored.id
      AND (
          task.due_date IS DISTINCT FROM scored.due_date
          OR task.status IS DISTINCT FROM scored.status
          OR task.priority_score IS DISTINCT FROM scored.priority_score
          OR task.meeting_grade IS DISTINCT FROM scored.meeting_grade
      );

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION iota_v2.sync_pmo_priority_scores() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION iota_v2.sync_pmo_priority_scores() TO authenticated;

DROP POLICY IF EXISTS "Allow PM2 and admin full access to pmo_tasks"
ON iota_v2.iota_pmo_tasks;
DROP POLICY IF EXISTS "Allow PM2 planning and admin full access to pmo_tasks"
ON iota_v2.iota_pmo_tasks;

CREATE POLICY "Allow PM2 planning and admin full access to pmo_tasks"
ON iota_v2.iota_pmo_tasks
FOR ALL TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code = 'WS_PM'
           OR role_code IN ('master', 'director')
           OR role_code ILIKE '%PO%'
           OR org_name ILIKE '%사업2파트%'
           OR org_name ILIKE '%사업관리2파트%'
           OR org_name ILIKE '%기획추진%'
           OR org_name ILIKE '%시스템 관리자%'
    )
)
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code = 'WS_PM'
           OR role_code IN ('master', 'director')
           OR role_code ILIKE '%PO%'
           OR org_name ILIKE '%사업2파트%'
           OR org_name ILIKE '%사업관리2파트%'
           OR org_name ILIKE '%기획추진%'
           OR org_name ILIKE '%시스템 관리자%'
    )
);

SELECT iota_v2.sync_pmo_priority_scores();

NOTIFY pgrst, 'reload schema';

COMMIT;
