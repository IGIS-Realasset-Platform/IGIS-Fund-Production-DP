const fs = require('fs');
const groups = require('./temp_groups.cjs');

let output_sql = `-- IOTA Seoul Pilot Members Table Setup
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
('전기영', 'jk.jeon@igisam.com', '기획추진', 'WS_MASTER', 'manager')`;

const uniqueEmails = new Set();
uniqueEmails.add('jk.jeon@igisam.com');

const values = [];
const pm2Members = new Set(['강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정']);

groups.forEach(group => {
    let workspace_code = "WS_OTHER";
    if (group.groupTitle === 'CFT 총괄') workspace_code = 'WS_MASTER';
    else if (group.groupTitle === '사업PM') workspace_code = 'WS_PM1';
    else if (['파이낸싱', 'LFC'].includes(group.groupTitle)) workspace_code = 'WS_LFC';
    else if (['개발관리', '개발솔루션'].includes(group.groupTitle)) workspace_code = 'WS_DSC';
    else if (group.groupTitle === '기업마케팅') workspace_code = 'WS_EMC';
    else if (['상품·디지털', '공간솔루션'].includes(group.groupTitle)) workspace_code = 'WS_SSC';
    else if (['펀드운용', 'KAM'].includes(group.groupTitle)) workspace_code = 'WS_KAM';
    else if (group.groupTitle === 'IPR') workspace_code = 'WS_IPR';
    else if (group.groupTitle === '기획추진') workspace_code = 'WS_MASTER';

    group.members.forEach(member => {
        if (!member.email || uniqueEmails.has(member.email)) return;
        uniqueEmails.add(member.email);

        const organizationMap = {
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
        };
        let orgName = organizationMap[group.groupTitle] || group.groupTitle;
        let memberWorkspaceCode = workspace_code;
        if (group.groupTitle === '사업PM') {
            orgName = pm2Members.has(member.name) ? '사업2파트' : '사업1파트';
            memberWorkspaceCode = pm2Members.has(member.name) ? 'WS_PM2' : 'WS_PM1';
        }

        let role_code = 'manager';
        if (group.groupTitle === 'CFT 총괄') {
            role_code = 'master';
        } else if (member.responsibility && member.responsibility.includes('책임인력')) {
            role_code = 'director';
        }

        values.push(`('${member.name}', '${member.email}', '${orgName}', '${memberWorkspaceCode}', '${role_code}')`);
    });
});

if (values.length > 0) {
    output_sql += ",\n" + values.join(",\n") + ";\n";
} else {
    output_sql += ";\n";
}

fs.writeFileSync('setup.sql', output_sql);
console.log('setup.sql successfully generated with ' + values.length + ' members.');
