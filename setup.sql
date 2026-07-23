-- IOTA Seoul Pilot Members Table Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.iota_seoul_pilot_members;

CREATE TABLE public.iota_seoul_pilot_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID,
    staff_id VARCHAR,
    staff_name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    org_name VARCHAR,
    workspace_code VARCHAR,
    role_code VARCHAR CHECK (role_code IN ('master', 'director', 'manager')),
    allowed_project_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.iota_seoul_pilot_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_seoul_pilot_members FOR SELECT USING (true);
CREATE POLICY "Allow individual update" ON public.iota_seoul_pilot_members FOR UPDATE USING (true);

INSERT INTO public.iota_seoul_pilot_members (staff_name, email, org_name, workspace_code, role_code) VALUES
('전기영', 'jk.jeon@igisam.com', '기획추진', 'WS_MASTER', 'manager'),
('이철승', 'ethan.lee@igisam.com', 'CFT 총괄', 'WS_MASTER', 'director'),
('윤관식', 'gwansik.yoon@igisam.com', 'CFT 총괄', 'WS_MASTER', 'director'),
('정조민', 'jmjung@igisam.com', 'CFT 총괄', 'WS_MASTER', 'director'),
('우형석', 'hyungsuk.woo@igisam.com', 'CFT 총괄', 'WS_MASTER', 'director'),
('권순일', 'ksoonil@igisam.com', '사업1파트', 'WS_PM1', 'director'),
('강순용', 'sykang@igisam.com', '사업2파트', 'WS_PM2', 'director'),
('윤주형', 'jh.yoon@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('김제익', 'jake.kim@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('류홍', 'ryuhong0526@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('박만진', 'jacob.park@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('박일훈', 'ilhoon.park@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('이정원', 'garden.lee@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('전무경', 'mooj@igisam.com', '사업1파트', 'WS_PM1', 'manager'),
('한찬호', 'chanho.han@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('박석제', 'seokje.park@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('박채현', 'p.chhyn@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('소현준', 'hyunjoon.so@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('이수정', 'sjl1747@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('조영비', 'youngbi@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('한수정', 'soojeong.han@igisam.com', '사업2파트', 'WS_PM2', 'manager'),
('박준호', 'junhopark@igisam.com', 'LFC', 'WS_LFC', 'director'),
('강석민', 'sm.kang@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('정리훈', 'jlh@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('손유정', 'yujung.son@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('김지우', 'jiwoo@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('박현승', 'hyunpark@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('이성민A', 'stealth@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('한승환', 'seunghwanhan@igisam.com', 'LFC', 'WS_LFC', 'manager'),
('홍장군', 'jghong@igisam.com', '개발솔루션', 'WS_DSC', 'director'),
('채원', 'won.chae@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('김보성', 'kbs1208@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('전승희', 'shjeon@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('김대익', 'dikim@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('장성진', 'jang.sj@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('이정훈', '2019jhlee@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('박봉서', 'okbong21@igisam.com', '개발솔루션', 'WS_DSC', 'manager'),
('김민지', 'minjik@igisam.com', '기업마케팅', 'WS_EMC', 'director'),
('고아라', 'argoh@igisam.com', '기업마케팅', 'WS_EMC', 'manager'),
('이가현', 'ghlee@igisam.com', '공간솔루션', 'WS_SSC', 'manager'),
('정수명', 'smchung@igisam.com', '공간솔루션', 'WS_SSC', 'manager'),
('김현수', 'hyunsoo.kim@igisam.com', '공간솔루션', 'WS_SSC', 'director'),
('현철호', 'chyun@igisam.com', '공간솔루션', 'WS_SSC', 'director'),
('신민호', 'rossshin@igisam.com', '공간솔루션', 'WS_SSC', 'manager'),
('김행단', 'hkim@igisam.com', 'KAM', 'WS_KAM', 'director'),
('윤용택', 'yongtek.yoon@igisam.com', 'IPR', 'WS_IPR', 'director');
