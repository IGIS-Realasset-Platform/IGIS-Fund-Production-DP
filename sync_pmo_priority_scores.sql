CREATE EXTENSION IF NOT EXISTS pg_cron;

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
        WHEN due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date
             AND status NOT IN ('완료', '지연') THEN '지연'
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
                 AND due_date BETWEEN
                     (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date
                     AND (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date + 7
                 THEN 10
            ELSE 0
        END
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

CREATE OR REPLACE FUNCTION iota_v2.log_pmo_priority_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = iota_v2, public
AS $$
DECLARE
    change_source TEXT;
    editor_name TEXT;
    score_change_text TEXT;
    grade_change_text TEXT;
BEGIN
    IF OLD.priority_score IS NOT DISTINCT FROM NEW.priority_score THEN
        RETURN NEW;
    END IF;

    IF current_setting('iota_v2.suppress_priority_change_log', TRUE) = 'on' THEN
        RETURN NEW;
    END IF;

    change_source := NULLIF(
        current_setting('iota_v2.priority_change_source', TRUE),
        ''
    );

    IF change_source IS NULL THEN
        change_source := '사용자 항목 변경';
    END IF;

    IF change_source = '시간 경과 자동 재계산' THEN
        editor_name := '시스템 자동계산';
    ELSE
        SELECT COALESCE(member.staff_name, member.email)
        INTO editor_name
        FROM public.iota_seoul_pilot_members AS member
        WHERE member.email = auth.jwt() ->> 'email'
        LIMIT 1;

        editor_name := COALESCE(editor_name, auth.jwt() ->> 'email', '시스템');
    END IF;

    score_change_text := format(
        '우선순위 점수가 "%s점"에서 "%s점"(으)로 변경되었습니다.',
        COALESCE(OLD.priority_score, 0),
        COALESCE(NEW.priority_score, 0)
    );

    grade_change_text := CASE
        WHEN OLD.meeting_grade IS DISTINCT FROM NEW.meeting_grade THEN format(
            E'\n회의 상정 등급이 "%s"에서 "%s"(으)로 변경되었습니다.',
            CASE COALESCE(OLD.meeting_grade, 'D')
                WHEN 'A' THEN '즉시상정'
                WHEN 'B' THEN '회의점검'
                WHEN 'C' THEN '주간관리'
                ELSE '대기'
            END,
            CASE COALESCE(NEW.meeting_grade, 'D')
                WHEN 'A' THEN '즉시상정'
                WHEN 'B' THEN '회의점검'
                WHEN 'C' THEN '주간관리'
                ELSE '대기'
            END
        )
        ELSE ''
    END;

    INSERT INTO public.iota_seoul_logs (
        log_id,
        writer_name,
        writer_staff_id,
        work_date,
        summary,
        raw_text,
        input_status,
        source_system,
        metadata
    ) VALUES (
        'pmo_priority_' || REPLACE(NEW.id::text, '-', '') || '_' ||
            FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000000)::bigint,
        '시스템',
        'system',
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date,
        '업무 변경 이력',
        score_change_text || grade_change_text,
        'submitted',
        'task_board',
        jsonb_build_object(
            'is_task_board', TRUE,
            'task_id', NEW.id::text,
            'task_project', COALESCE(NEW.project_code, 'IOTA_SEOUL'),
            'workspace_code', 'WS_PMO',
            'workspace_label', '통합업무보드',
            'editor_name', editor_name,
            'change_source', change_source,
            'structured_changes', jsonb_build_array(
                jsonb_build_object(
                    'field', '우선순위 점수',
                    'from', COALESCE(OLD.priority_score, 0)::text || '점',
                    'to', COALESCE(NEW.priority_score, 0)::text || '점'
                )
            ) || CASE
                WHEN OLD.meeting_grade IS DISTINCT FROM NEW.meeting_grade THEN
                    jsonb_build_array(
                        jsonb_build_object(
                            'field', '상정 등급',
                            'from', CASE COALESCE(OLD.meeting_grade, 'D')
                                WHEN 'A' THEN '즉시상정'
                                WHEN 'B' THEN '회의점검'
                                WHEN 'C' THEN '주간관리'
                                ELSE '대기'
                            END,
                            'to', CASE COALESCE(NEW.meeting_grade, 'D')
                                WHEN 'A' THEN '즉시상정'
                                WHEN 'B' THEN '회의점검'
                                WHEN 'C' THEN '주간관리'
                                ELSE '대기'
                            END
                        )
                    )
                ELSE '[]'::jsonb
            END
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_pmo_priority_change_trigger
ON iota_v2.iota_pmo_tasks;

CREATE TRIGGER log_pmo_priority_change_trigger
AFTER UPDATE OF importance_level, is_blocker, needs_decision, support_needed,
    due_date, status, task_type, priority_score
ON iota_v2.iota_pmo_tasks
FOR EACH ROW
EXECUTE FUNCTION iota_v2.log_pmo_priority_change();

CREATE OR REPLACE FUNCTION iota_v2.sync_pmo_priority_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = iota_v2, public
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    PERFORM set_config(
        'iota_v2.priority_change_source',
        '시간 경과 자동 재계산',
        TRUE
    );

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
        WHERE task.task_type <> '팝업'
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

DO $$
DECLARE
    existing_job_id BIGINT;
BEGIN
    FOR existing_job_id IN
        SELECT jobid
        FROM cron.job
        WHERE jobname = 'sync-pmo-priority-scores-hourly'
    LOOP
        PERFORM cron.unschedule(existing_job_id);
    END LOOP;

    PERFORM cron.schedule(
        'sync-pmo-priority-scores-hourly',
        '5 * * * *',
        'SELECT iota_v2.sync_pmo_priority_scores();'
    );
END;
$$;

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

SELECT set_config('iota_v2.suppress_priority_change_log', 'on', TRUE);
SELECT iota_v2.sync_pmo_priority_scores();
SELECT set_config('iota_v2.suppress_priority_change_log', 'off', TRUE);

NOTIFY pgrst, 'reload schema';

COMMIT;
