-- 기업마케팅 주요 테스크 관리를 위한 테이블 생성
CREATE TABLE iota_marketing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name TEXT NOT NULL,
    company_name TEXT,
    related_asset TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    next_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) 설정
ALTER TABLE iota_marketing_tasks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기 권한 부여
CREATE POLICY "Enable read access for all users" ON iota_marketing_tasks FOR SELECT USING (true);

-- 모든 사용자에게 쓰기 권한 부여 (실제 권한 제어는 프론트엔드에서 담당)
CREATE POLICY "Enable insert access for all users" ON iota_marketing_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON iota_marketing_tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON iota_marketing_tasks FOR DELETE USING (true);
