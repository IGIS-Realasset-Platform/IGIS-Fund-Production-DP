import re
import json

with open("src/components/system/stakeholder/StakeInternal.jsx", "r", encoding="utf-8") as f:
    content = f.read()

start_idx = content.find("const stakeholderGroups = [")
end_idx = content.find("];\n\nexport default function StakeInternal()") + 1

groups_text = content[start_idx:end_idx]

unique_emails = set()
group_matches = re.finditer(r"groupTitle:\s*'([^']+)'(.*?)\]", groups_text, re.DOTALL)

output_sql = """-- IOTA Seoul Pilot Members Table Setup
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
"""

values = []
unique_emails.add('jk.jeon@igisam.com')
pm2_members = {'강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정'}

for match in group_matches:
    group_name = match.group(1)
    block = match.group(2)
    
    workspace_code = "WS_OTHER"
    if group_name == 'CFT 총괄': workspace_code = 'WS_MASTER'
    elif group_name == '사업PM': workspace_code = 'WS_PM1'
    elif group_name in ('파이낸싱', 'LFC'): workspace_code = 'WS_LFC'
    elif group_name in ('개발관리', '개발솔루션'): workspace_code = 'WS_DSC'
    elif group_name == '기업마케팅': workspace_code = 'WS_EMC'
    elif group_name in ('상품·디지털', '공간솔루션'): workspace_code = 'WS_SSC'
    elif group_name in ('펀드운용', 'KAM'): workspace_code = 'WS_KAM'
    elif group_name == 'IPR': workspace_code = 'WS_IPR'
    elif group_name == '기획추진': workspace_code = 'WS_MASTER'

    m_iter = re.finditer(r"name:\s*'([^']+)'(?:.*?responsibility:\s*'([^']+)')?.*?email:\s*'([^']+)'", block, re.DOTALL)
    for m in m_iter:
        name = m.group(1)
        resp = m.group(2)
        email = m.group(3)
        
        if email in unique_emails: continue
        unique_emails.add(email)

        org_name = {
            'CFT 총괄': 'CFT 총괄',
            '파이낸싱': 'LFC',
            'LFC': 'LFC',
            '개발관리': '개발솔루션',
            '개발솔루션': '개발솔루션',
            '기업마케팅': '기업마케팅',
            '상품·디지털': '공간솔루션',
            '공간솔루션': '공간솔루션',
            '펀드운용': 'KAM',
            'KAM': 'KAM',
            'IPR': 'IPR',
            '기획추진': '기획추진',
        }.get(group_name, group_name)
        if group_name == '사업PM':
            org_name = '사업2파트' if name in pm2_members else '사업1파트'
            workspace_code = 'WS_PM2' if name in pm2_members else 'WS_PM1'
        
        role_code = 'manager'
        if group_name == 'CFT 총괄':
            role_code = 'master'
        elif resp and '책임인력' in resp:
            role_code = 'director'
            
        values.append(f"('{name}', '{email}', '{org_name}', '{workspace_code}', '{role_code}')")

output_sql += ",\n".join(values) + ";"

with open("setup.sql", "w", encoding="utf-8") as f:
    f.write(output_sql)

print("Generated setup.sql")
