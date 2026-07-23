-- 신규 멤버 추가 (이시정, 이관용)
-- 회원가입(로그인) 승인을 위해 iota_seoul_pilot_members 테이블에 정보를 추가합니다.

INSERT INTO public.iota_seoul_pilot_members (staff_name, email, org_name, workspace_code, role_code)
VALUES 
('이시정', 'sjlee@igisam.com', '기획추진', 'WS_MASTER', 'director'),
('이관용', 'kylee@igisam.com', '기획추진', 'WS_MASTER', 'manager')
ON CONFLICT (email) DO NOTHING;
