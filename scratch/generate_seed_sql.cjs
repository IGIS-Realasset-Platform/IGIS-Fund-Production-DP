const fs = require('fs');
const path = require('path');

// 1. Read PmoTaskBoardStaging.jsx
const filePath = path.join(__dirname, '../src/components/system/pmo/PmoTaskBoardStaging.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// 2. Extract FALLBACK_BOARD_TASKS array definition
const startIdx = content.indexOf('export const FALLBACK_BOARD_TASKS = [');
if (startIdx === -1) {
    console.error('Could not find FALLBACK_BOARD_TASKS start');
    process.exit(1);
}

// Find matching ending bracket
let bracketCount = 1;
let currentIdx = startIdx + 'export const FALLBACK_BOARD_TASKS = ['.length;
let arrayText = '[';

while (bracketCount > 0 && currentIdx < content.length) {
    const char = content[currentIdx];
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    arrayText += char;
    currentIdx++;
}

// Evaluate the array text using eval (safe since it's local static array)
const tasks = eval(arrayText);
console.log(`Successfully extracted ${tasks.length} tasks.`);

// 3. Helper functions for DB mapping
function resolveProjectCode(projectName) {
    if (!projectName) return 'IOTA_SEOUL';
    let searchCode = projectName.toUpperCase();
    if (projectName === '공통' || projectName === 'IOTA 공통') searchCode = 'IOTA_SEOUL';
    if (projectName === '427PFV' || projectName === '427 PFV') searchCode = 'PFV_427';
    if (projectName === '816PFV' || projectName === '816 PFV') searchCode = 'PFV_816';
    if (projectName === '421펀드' || projectName === '421FUND' || projectName === '421Fund') searchCode = 'FUND_421';
    if (projectName === '외부') searchCode = 'EXTERNAL';
    return searchCode;
}

function resolveDeptCode(deptName) {
    if (!deptName) return 'DEPT_PM2';
    const clean = deptName.trim();
    if (clean.includes('LFC') || clean.includes('lfc') || clean.includes('금융')) return 'DEPT_LFC';
    if (clean.includes('사업관리1') || clean.includes('사업1') || clean.includes('관리1')) return 'DEPT_PM2'; // Map 사업1 to PM2 or PM2 fallback
    if (clean.includes('사업관리2') || clean.includes('사업2') || clean.includes('관리2')) return 'DEPT_PM2';
    if (clean.includes('개발') || clean.includes('DSC') || clean.includes('솔루션')) return 'DEPT_DEV';
    if (clean.includes('설계') || clean.includes('SSC') || clean.includes('디자인') || clean.includes('도면') || clean.includes('공간')) return 'DEPT_DESIGN';
    if (clean.includes('마케팅') || clean.includes('EMC') || clean.includes('기업')) return 'DEPT_MKT';
    return 'DEPT_PM2';
}

function resolveStakeholderCode(name) {
    if (!name) return 'EXTERNAL';
    const clean = name.trim();
    if (clean === '외부' || clean === '내부 전체' || clean === '내부') return 'EXTERNAL';
    // Generate simple alphanumeric key
    return 'STAKE_' + clean.replace(/[^a-zA-Z0-9가-힣]/g, '').slice(0, 10).toUpperCase();
}

// 4. Collect unique entities to seed dependencies first
const projects = new Map();
const subsectors = new Set();
const stakeholders = new Map();

tasks.forEach(t => {
    const projCode = resolveProjectCode(t.project);
    projects.set(projCode, t.project || '공통');

    if (t.sector_detail) subsectors.add(t.sector_detail.trim());

    if (t.external_party) {
        const code = resolveStakeholderCode(t.external_party);
        stakeholders.set(code, t.external_party.trim());
    }
});

// 5. Build SQL statements
let sql = `-- FALLBACK_BOARD_TASKS 데이터베이스 시드 스크립트\n`;
sql += `BEGIN;\n\n`;

sql += `-- A) 프로젝트 데이터 추가\n`;
projects.forEach((name, code) => {
    sql += `INSERT INTO iota_v2.iota_projects (project_code, project_name) VALUES ('${code}', '${name}') ON CONFLICT (project_code) DO NOTHING;\n`;
});
sql += `\n`;

sql += `-- B) 세부 섹터 데이터 추가\n`;
subsectors.forEach(name => {
    sql += `INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('${name}') ON CONFLICT (subsector_name) DO NOTHING;\n`;
});
sql += `\n`;

sql += `-- C) 외부 관계자 데이터 추가\n`;
stakeholders.forEach((name, code) => {
    sql += `INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('${code}', '${name}', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;\n`;
});
sql += `\n`;

sql += `-- D) 테스크 데이터 추가\n`;
tasks.forEach(t => {
    const projCode = resolveProjectCode(t.project);
    const leadDeptCode = resolveDeptCode(t.lead_dept);
    const stakeCode = t.external_party ? resolveStakeholderCode(t.external_party) : null;
    
    const category = t.category_main || '공통 PMO';
    const taskName = t.task_name.replace(/'/g, "''");
    const purpose = t.task_purpose ? t.task_purpose.replace(/'/g, "''") : null;
    const deliverables = t.deliverables ? t.deliverables.replace(/'/g, "''") : null;
    const notes = t.notes ? t.notes.replace(/'/g, "''") : null;
    const nextAction = t.next_action ? t.next_action.replace(/'/g, "''") : null;
    const agendaReason = t.agenda_reason ? t.agenda_reason.replace(/'/g, "''") : null;
    
    const isBlocker = t.is_blocker === 'Y' || t.is_blocker === true;
    const needsDecision = t.needs_decision === 'Y' || t.needs_decision === true;
    
    const status = ['미착수', '진행중', '검토중', '대기', '지연', '완료', '보류', '중단'].includes(t.status) ? t.status : '미착수';
    const importance = ['PF필수', '준공필수', '높음', '중간', '낮음'].includes(t.importance_level) ? t.importance_level : '중간';
    const meetingGrade = t.meeting_grade && t.meeting_grade.startsWith('A') ? 'A' : 'B';
    const taskType = t.task_type || '정규';
    const score = parseInt(t.priority_score) || 0;

    sql += `INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        target_axis, pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        '${projCode}', '${category}', ${t.sector_detail ? `'${t.sector_detail}'` : 'NULL'}, '${taskName}',
        ${purpose ? `'${purpose}'` : 'NULL'}, ${deliverables ? `'${deliverables}'` : 'NULL'},
        '${t.target_axis || '공통 PMO'}', '${t.pmo_manager || '사업2파트'}', '${leadDeptCode}',
        ${t.coop_depts ? `'${t.coop_depts}'` : 'NULL'}, '${t.assignee || '미정'}', ${stakeCode ? `'${stakeCode}'` : 'NULL'},
        ${isBlocker}, ${needsDecision}, ${t.due_date ? `'${t.due_date}'` : 'NULL'}, '${status}', '${importance}', '${taskType}',
        ${score}, '${meetingGrade}', ${agendaReason ? `'${agendaReason}'` : 'NULL'},
        ${notes ? `'${notes}'` : 'NULL'}, ${nextAction ? `'${nextAction}'` : 'NULL'}
    ) ON CONFLICT DO NOTHING;\n`;
});

sql += `\nCOMMIT;\n`;

fs.writeFileSync(path.join(__dirname, '../seed_fallback_tasks.sql'), sql, 'utf8');
console.log('Seed SQL file successfully generated at seed_fallback_tasks.sql');
