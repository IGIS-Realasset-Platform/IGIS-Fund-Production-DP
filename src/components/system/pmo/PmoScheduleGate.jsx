import React from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

const COLUMNS = [
    { key: 'm06', labelTop: '~2026', labelBottom: '06' },
    { key: 'm07', labelTop: '2026', labelBottom: '07' },
    { key: 'm08', labelTop: '2026', labelBottom: '08' },
    { key: 'm09', labelTop: '2026', labelBottom: '09' },
    { key: 'm10', labelTop: '2026', labelBottom: '10' },
    { key: 'm11', labelTop: '2026.11', labelBottom: 'PF 1차', highlight: true },
    { key: 'm03', labelTop: '2027.03', labelBottom: 'PF 2차', highlight: true },
    { key: 'const_start', labelTop: '2027~', labelBottom: '착공' },
    { key: 'const_mid', labelTop: '공사~준공', labelBottom: '', highlight: true },
    { key: 'take_out', labelTop: 'Take-out', labelBottom: '운영', highlight: true }
];

const TIMELINE_DATA = [
    // Gates
    { category: 'Gate', name: 'G0 현황정리', desc: '업무원장·카테고리·우선순위 기준 확정', lead: '사업관리2파트', coop: '전 부서', schedule: { m06: '●', m07: '●' } },
    { category: 'Gate', name: 'G1 방향결정', desc: '단독/통합 PF 방향, 호텔 브랜드, 시공사 조건', lead: '사업관리2파트', coop: 'LFC;기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●' } },
    { category: 'Gate', name: 'G2 PF준비도', desc: '인허가·도면·임차·금융·법무 CP 준비', lead: '사업관리2파트', coop: '전 부서', schedule: { m07: '●', m08: '●', m09: '●', m10: '●' } },
    { category: 'Gate', name: 'G3 PF실행', desc: '427/816 단독 또는 통합 PF 실행', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m09: '●', m10: '●', m11: '◆', m03: '◆' } },
    { category: 'Gate', name: 'G4 착공/공사', desc: '착공조건, 책임착공, 공정관리 체계 전환', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { m03: '●', const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G5 준공/사용승인', desc: '준공 CP, 사용승인, 리스크 증빙자료 관리', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G6 담보대출/운영', desc: 'Take-out, 운영전환, 임대 안정화, 자산관리', lead: '사업관리2파트', coop: '공간솔루션실;기업마케팅실', schedule: { const_mid: '●', take_out: '◆' } },
    // Functions
    { category: 'Task', name: '인허가', desc: '현금기부채납·소공원로·변경인가·사용승인', lead: '개발관리실', coop: '사업관리2파트;', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '호텔', desc: '브랜드·운영계약·운영수지·FF&E', lead: '사업관리2파트', coop: '기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', const_mid: '●' } },
    { category: 'Task', name: '시공/원가', desc: '현대/삼성 도급조건·공사비·신용공여', lead: '사업관리2파트', coop: '개발관리실;LFC', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '도면/설계', desc: 'PF 기준도면·면적표·실사자료', lead: '개발관리실', coop: '기업마케팅실;공간솔루션실', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '임차/마케팅', desc: '광장·KB·삼성/이지스·선임차', lead: '사업관리2파트', coop: '기업마케팅실; 공간솔루션실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: 'PF/금융', desc: 'Term Sheet·대주단·재무모델·CP', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', take_out: '◆' } },
    { category: 'Task', name: '법무/세무/구조', desc: '리츠·Asset/Share·합병·주주승인', lead: '법무/세무자문', coop: '사업관리2파트;LFC', schedule: { m06: '●', m07: '●', m08: '●', m09: '●' } },
    { category: 'Task', name: '팝업업무', desc: '단발 요청 접수/위임/보류/반려', lead: '사업관리2파트', coop: '요청부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '●', m03: '●', const_start: '●', const_mid: '●', take_out: '●' } }
];

const CATEGORY_MAP_DATA = [
  {
    category: "인허가",
    subsector: "현금기부채납",
    task: "현금기부채납 규모·시기·조건 협의",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "관청 협의결과",
    partner: "서울시/중구청",
    point: "사업비 및 PF 조건에 직접 반영"
  },
  {
    category: "인허가",
    subsector: "소공원로",
    task: "소공원로 지하화/통합개발 인허가",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "인허가 지원",
    partner: "서울시/중구청",
    point: "인허가 마감 및 대주 조건"
  },
  {
    category: "인허가",
    subsector: "변경인가",
    task: "사업계획/건축 변경인가 완료",
    pf: false,
    const: true,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "설계 변경",
    partner: "중구청/서울시",
    point: "착공 일정의 선결 요건"
  },
  {
    category: "인허가",
    subsector: "사용승인",
    task: "준공 후 사용승인 및 등기/보존",
    pf: false,
    const: false,
    op: true,
    lead: "개발관리실",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "행정 지원",
    partner: "중구청",
    point: "운영전환 및 담보대출 전제"
  },
  {
    category: "호텔/운영",
    subsector: "브랜드",
    task: "호텔 브랜드 협의 및 HMA 체결",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["기업마케팅실", "LFC", "법무/세무자문"],
    need: "자문 의견",
    partner: "Marriott/소노 등",
    point: "PF 실행의 필수 전제조건"
  },
  {
    category: "호텔/운영",
    subsector: "계약구조",
    task: "HMA / 위탁 / 임대차 구조 확정",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "법무/세무자문"],
    need: "계약 리스크",
    partner: "브랜드사",
    point: "Owner control과 termination"
  },
  {
    category: "호텔/운영",
    subsector: "운영수지/FF&E",
    task: "운영수지·FF&E·CAPEX 모델 반영",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "사업관리1파트"],
    need: "운영자료",
    partner: "브랜드사",
    point: "사업비와 상환가능성 영향"
  },
  {
    category: "시공/원가",
    subsector: "현대건설",
    task: "427 도급조건·신용공여",
    pf: true,
    const: true,
    op: false,
    lead: "사업관리2파트",
    coop: ["사업관리1파트", "개발관리실"],
    need: "현대 Term",
    partner: "현대건설",
    point: "427 PF 실행조건"
  },
  {
    category: "시공/원가",
    subsector: "삼성물산",
    task: "816 도급조건·책임임차·LOC",
    pf: true,
    const: true,
    op: false,
    lead: "사업관리2파트",
    coop: ["사업관리1파트", "개발관리실"],
    need: "삼성 Term",
    partner: "삼성물산",
    point: "816 단독/통합 PF 핵심"
  },
  {
    category: "시공/원가",
    subsector: "공사비/VE",
    task: "공사비 검증·VE·공기단축",
    pf: true,
    const: true,
    op: true,
    lead: "개발관리실",
    coop: ["사업관리2파트"],
    need: "공사비 상세",
    partner: "시공사/CM",
    point: "원가 부담 완화"
  },
  {
    category: "도면/설계",
    subsector: "PF 기준도면",
    task: "대주단 제출용 기준도면",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "도면기준",
    partner: "설계사/CM",
    point: "모든 자료의 기준"
  },
  {
    category: "도면/설계",
    subsector: "면적표",
    task: "GFA/NLA/전용률/임대면적 기준",
    pf: true,
    const: false,
    op: false,
    lead: "공간솔루션실",
    coop: ["기업마케팅실", "LFC", "개발관리실"],
    need: "면적자료",
    partner: "설계사/CM",
    point: "임차/모델 불일치 방지"
  },
  {
    category: "인테리어/TI",
    subsector: "오피스 TI",
    task: "표준 TI·Fit-out 비용 기준",
    pf: true,
    const: false,
    op: false,
    lead: "공간솔루션실",
    coop: ["기업마케팅실", "LFC"],
    need: "시장자료",
    partner: "임차인",
    point: "임차조건 및 모델 반영"
  },
  {
    category: "인테리어/TI",
    subsector: "호텔 인테리어",
    task: "호텔 인테리어·FF&E 범위",
    pf: false,
    const: true,
    op: true,
    lead: "공간솔루션실",
    coop: ["사업관리2파트", "LFC"],
    need: "브랜드 기준",
    partner: "브랜드사",
    point: "CAPEX 리스크"
  },
  {
    category: "임차/마케팅",
    subsector: "광장",
    task: "광장 임차 조건·면적·Term",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "공간솔루션실", "LFC"],
    need: "임차조건",
    partner: "광장",
    point: "PF 스토리 핵심"
  },
  {
    category: "임차/마케팅",
    subsector: "KB/금융권",
    task: "금융권 임차 후보 협의",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "공간솔루션실", "LFC"],
    need: "후보 접촉",
    partner: "KB 등",
    point: "선임차 확보"
  },
  {
    category: "임차/마케팅",
    subsector: "삼성/이지스",
    task: "816 선임차·책임임차·이전 가능성",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "LFC"],
    need: "내부/삼성 협의",
    partner: "삼성물산;이지스",
    point: "단독/통합 구조와 연결"
  },
  {
    category: "PF/금융",
    subsector: "단독 PF",
    task: "427/816 단독 PF Term",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "대주단 Term",
    partner: "대주단",
    point: "단독 가능성 기준"
  },
  {
    category: "PF/금융",
    subsector: "통합 PF",
    task: "대주단 일치화·통합담보 구조",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["사업관리2파트", "법무/세무자문"],
    need: "금융/법무 검토",
    partner: "대주단",
    point: "구조 전환 의사결정"
  },
  {
    category: "PF/금융",
    subsector: "재무모델",
    task: "원가·임차·호텔·신용공여 모델 반영",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["전 부서"],
    need: "입력값 취합",
    partner: "회계법인",
    point: "모든 조건의 숫자화"
  },
  {
    category: "구조/법무/세무",
    subsector: "리츠 전환",
    task: "427 리츠 전환+816 편입 검토",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "법무/세무자문", "사업관리1파트"],
    need: "자문결과",
    partner: "법무/세무법인",
    point: "기본 구조 재정의"
  },
  {
    category: "구조/법무/세무",
    subsector: "Asset/Share/합병",
    task: "구조별 절차·세금·주주동의 비교",
    pf: true,
    const: false,
    op: false,
    lead: "법무/세무자문",
    coop: ["사업관리2파트", "LFC"],
    need: "자문결과",
    partner: "법무/세무법인",
    point: "실행가능성 중심"
  },
  {
    category: "주주/보고",
    subsector: "의사결정",
    task: "6~7월 내부 의사결정 회의",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["전 부서"],
    need: "부서별 산출물",
    partner: "대표/본부장",
    point: "자료작업 반복 차단"
  },
  {
    category: "준공/담보대출",
    subsector: "Take-out",
    task: "준공 후 담보대출/운영전환 전략",
pf: false,
    const: false,
    op: true,
    lead: "LFC",
    coop: ["사업관리2파트", "기업마케팅실", "개발관리실"],
    need: "장기 금융전략",
    partner: "금융기관",
    point: "PF 조건과 연결"
  }
];

const R_R_CATEGORIES = [
  '전체보기', 'PF/금융', '인허가', '호텔/운영', '시공/원가', '도면/설계',
  '인테리어/TI', '임차/마케팅', '구조/법무/세무', '주주/보고', '준공/담보대출', '팝업/단발'
];

export default function PmoScheduleGate() {
    const { memberInfo } = useAuth();
    const [filterCategory, setFilterCategory] = React.useState('All'); // All, Gate, Task
    const [selectedRrCategory, setSelectedRrCategory] = React.useState('전체보기');
    const [selectedRrLead, setSelectedRrLead] = React.useState('전체보기');
    const [selectedRrCoop, setSelectedRrCoop] = React.useState('전체보기');

    const [rrData, setRrData] = React.useState([]);
    const [isDbMode, setIsDbMode] = React.useState(false);
    const [departments, setDepartments] = React.useState([]);
    const [stakeholders, setStakeholders] = React.useState([]);

    // Existing schemas & autocomplete states
    const [masterStakeholders, setMasterStakeholders] = React.useState([]);
    const [pilotDepartments, setPilotDepartments] = React.useState([]);
    const [showStakeholderSuggestions, setShowStakeholderSuggestions] = React.useState(false);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);

    const [formCategory, setFormCategory] = React.useState('');
    const [formSubsector, setFormSubsector] = React.useState('');
    const [formTask, setFormTask] = React.useState('');
    const [formPf, setFormPf] = React.useState(false);
    const [formConst, setFormConst] = React.useState(false);
    const [formOp, setFormOp] = React.useState(false);
    const [formLead, setFormLead] = React.useState('');
    const [formCoop, setFormCoop] = React.useState([]);
    const [formNeed, setFormNeed] = React.useState('');
    const [formPartner, setFormPartner] = React.useState('');
    const [formPoint, setFormPoint] = React.useState('');

    const isAuthorized = React.useMemo(() => {
        if (!memberInfo) return false;
        const org = memberInfo.org_name || '';
        const workspace = memberInfo.workspace_code || '';
        const role = memberInfo.role_code || '';
        return (
            org.includes('사업관리2파트') || 
            org.includes('기획추진') ||
            workspace === 'WS_PM' ||
            role === 'master' ||
            role === 'director'
        );
    }, [memberInfo]);

    React.useEffect(() => {
        async function loadData() {
            try {
                // Fetch pilot members' organizations for existing department schema
                const { data: memberData } = await supabase
                    .from('iota_seoul_pilot_members')
                    .select('org_name');
                if (memberData) {
                    const uniqueOrgs = Array.from(new Set(memberData.map(m => m.org_name).filter(Boolean)));
                    setPilotDepartments(uniqueOrgs);
                }
            } catch (err) {
                console.warn("Failed to fetch pilot departments:", err);
            }

            try {
                // Fetch master stakeholders (existing logic used in meeting logs & board posting)
                const { data: shData } = await supabase
                    .from('iota_stakeholder_master')
                    .select('*');
                if (shData) setMasterStakeholders(shData);
            } catch (err) {
                console.warn("Failed to fetch master stakeholders:", err);
            }

            try {
                // 1. Fetch departments
                const { data: deptData } = await supabase
                    .schema('iota_v2')
                    .from('iota_departments')
                    .select('*');
                if (deptData) setDepartments(deptData);

                // 2. Fetch stakeholders
                const { data: stakeData } = await supabase
                    .schema('iota_v2')
                    .from('iota_stakeholders')
                    .select('*');
                if (stakeData) setStakeholders(stakeData);

                // 3. Fetch tasks
                const { data: tasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select(`
                        *,
                        lead_dept:iota_departments!lead_dept_code(dept_name),
                        external_party:iota_stakeholders!external_party_code(stakeholder_name)
                    `)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                
                if (tasks && tasks.length > 0) {
                    const mapped = tasks.map(t => ({
                        id: t.id,
                        category: t.category_main,
                        subsector: t.sector_detail,
                        task: t.task_name,
                        pf: t.gate_stage === 'G0',
                        const: t.gate_stage === 'G1',
                        op: t.gate_stage === 'G2',
                        lead: t.lead_dept?.dept_name || t.lead_dept_code || '',
                        coop: t.coop_dept_codes ? t.coop_dept_codes.split(';') : [],
                        need: t.deliverables || '',
                        partner: t.external_party?.stakeholder_name || t.external_party_code || '',
                        point: t.task_purpose || t.next_action || '',
                        lead_dept_code: t.lead_dept_code,
                        external_party_code: t.external_party_code,
                        gate_stage: t.gate_stage
                    }));
                    setRrData(mapped);
                    setIsDbMode(true);
                } else {
                    setRrData(CATEGORY_MAP_DATA.map((item, idx) => ({ ...item, id: `mock-${idx}` })));
                    setIsDbMode(false);
                }
            } catch (err) {
                console.warn("Using offline/fallback data for R&R:", err.message);
                setRrData(CATEGORY_MAP_DATA.map((item, idx) => ({ ...item, id: `mock-${idx}` })));
                setIsDbMode(false);
            }
        }
        loadData();
    }, []);

    const handleAddClick = () => {
        setEditingItem(null);
        setFormCategory(R_R_CATEGORIES[1]); // default to first category
        setFormSubsector('');
        setFormTask('');
        setFormPf(false);
        setFormConst(false);
        setFormOp(false);
        setFormLead(departments[0]?.dept_name || '사업관리2파트');
        setFormCoop([]);
        setFormNeed('');
        setFormPartner('');
        setFormPoint('');
        setIsModalOpen(true);
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setFormCategory(item.category);
        setFormSubsector(item.subsector);
        setFormTask(item.task);
        setFormPf(item.pf);
        setFormConst(item.const);
        setFormOp(item.op);
        setFormLead(item.lead);
        setFormCoop(item.coop || []);
        setFormNeed(item.need);
        setFormPartner(item.partner);
        setFormPoint(item.point);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Find dept code and stakeholder code if in DB mode
        let lead_dept_code = formLead;
        let external_party_code = formPartner;
        
        if (isDbMode) {
            const dept = departments.find(d => d.dept_name === formLead || d.dept_code === formLead);
            if (dept) lead_dept_code = dept.dept_code;
            
            const stake = stakeholders.find(s => s.stakeholder_name === formPartner || s.stakeholder_code === formPartner);
            if (stake) external_party_code = stake.stakeholder_code;
        }

        const gate_stage = formPf ? 'G0' : (formConst ? 'G1' : (formOp ? 'G2' : null));
        const coop_dept_codes = formCoop.join(';');

        if (editingItem) {
            // EDITING
            if (isDbMode) {
                try {
                    const { error } = await supabase
                        .schema('iota_v2')
                        .from('iota_pmo_tasks')
                        .update({
                            category_main: formCategory,
                            sector_detail: formSubsector,
                            task_name: formTask,
                            deliverables: formNeed,
                            task_purpose: formPoint,
                            gate_stage,
                            lead_dept_code,
                            coop_dept_codes,
                            external_party_code
                        })
                        .eq('id', editingItem.id);

                    if (error) throw error;
                } catch (err) {
                    console.error("Failed to update task in DB:", err);
                    alert("DB 수정에 실패했습니다. 권한이 없거나 필수 값이 누락되었을 수 있습니다.");
                    return;
                }
            }

            // Update local state
            setRrData(prev => prev.map(item => item.id === editingItem.id ? {
                ...item,
                category: formCategory,
                subsector: formSubsector,
                task: formTask,
                pf: formPf,
                const: formConst,
                op: formOp,
                lead: formLead,
                coop: formCoop,
                need: formNeed,
                partner: formPartner,
                point: formPoint
            } : item));
        } else {
            // ADDING
            let newId = `mock-${Date.now()}`;
            if (isDbMode) {
                try {
                    const { data, error } = await supabase
                        .schema('iota_v2')
                        .from('iota_pmo_tasks')
                        .insert([{
                            project_code: 'IOTA_SEOUL',
                            category_main: formCategory,
                            sector_detail: formSubsector,
                            task_name: formTask,
                            deliverables: formNeed,
                            task_purpose: formPoint,
                            gate_stage,
                            lead_dept_code,
                            coop_dept_codes,
                            external_party_code
                        }])
                        .select();

                    if (error) throw error;
                    if (data && data[0]) {
                        newId = data[0].id;
                    }
                } catch (err) {
                    console.error("Failed to insert task in DB:", err);
                    alert("DB 추가에 실패했습니다. 권한이 없거나 필수 값이 누락되었을 수 있습니다.");
                    return;
                }
            }

            const newItem = {
                id: newId,
                category: formCategory,
                subsector: formSubsector,
                task: formTask,
                pf: formPf,
                const: formConst,
                op: formOp,
                lead: formLead,
                coop: formCoop,
                need: formNeed,
                partner: formPartner,
                point: formPoint
            };

            setRrData(prev => [...prev, newItem]);
        }

        setIsModalOpen(false);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm("정말로 이 항목을 삭제하시겠습니까?")) return;

        if (isDbMode) {
            try {
                const { error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (err) {
                console.error("Failed to delete task in DB:", err);
                alert("DB 삭제에 실패했습니다. 권한이 없거나 문제가 발생했습니다.");
                return;
            }
        }

        setRrData(prev => prev.filter(item => item.id !== id));
    };

    const getSelectWidth = (value, defaultLabel) => {
        const text = value === '전체보기' ? defaultLabel : value;
        let len = 0;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 0 && code <= 128) len += 6.5;
            else len += 12.0;
        }
        return `${Math.max(len - 4, 16)}px`;
    };

    const R_R_LEADS = React.useMemo(() => {
        const leads = rrData.map(item => item.lead).filter(Boolean);
        return ['전체보기', ...Array.from(new Set(leads))];
    }, [rrData]);

    const R_R_COOPS = React.useMemo(() => {
        const coops = rrData.flatMap(item => item.coop).filter(Boolean);
        return ['전체보기', ...Array.from(new Set(coops))];
    }, [rrData]);

    const deptOptions = React.useMemo(() => {
        const set = new Set([
            '사업관리2파트', 
            '기획추진', 
            '개발관리실', 
            '공간솔루션실', 
            '사업관리1파트', 
            'LFC', 
            '법무/세무자문', 
            '기업마케팅실',
            ...pilotDepartments,
            ...departments.map(d => d.dept_name)
        ]);
        return Array.from(set);
    }, [pilotDepartments, departments]);

    const uniqueStakeholderNames = React.useMemo(() => {
        const names = masterStakeholders.map(s => s.company_name).filter(Boolean);
        return Array.from(new Set(names));
    }, [masterStakeholders]);

    const filteredData = TIMELINE_DATA.filter(item => {
        if (filterCategory === 'All') return true;
        return item.category === filterCategory;
    });

    const renderCategoryName = (name) => {
        if (name.startsWith('G') && name.includes(' ')) {
            const parts = name.split(' ');
            return (
                <div className="leading-[1.2] text-center">
                    <div className="text-[11px] font-bold">{parts[0]}</div>
                    <div className="text-[11px] font-bold mt-0.5 opacity-90">{parts[1]}</div>
                </div>
            );
        }
        return <div className="text-center text-[11px] font-bold">{name}</div>;
    };

    return (
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] pl-[60px] pr-[60px] font-sans text-white text-left">
            <style>{`
                .timeline-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .timeline-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .timeline-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .timeline-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .timeline-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.12) rgba(255, 255, 255, 0.02);
                }
            `}</style>
            {/* Header */}
            <div className="w-full flex justify-between items-end mb-[16px]">
                <div className="flex flex-col text-left">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">마일스톤</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Legend info */}
                    <div className="flex items-center gap-4 text-[12px] font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                            <span className="text-[#E5E5E5]">수행 진행 기간</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#F59E0B] font-mono text-[16px] leading-none">◆</span>
                            <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                        </div>
                    </div>

                    {/* Segmented Filter */}
                    <div className="flex items-center bg-[#222] border border-[#333] rounded-[8px] p-[4px]">
                        <button
                            onClick={() => setFilterCategory('All')}
                            className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'All' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                        >
                            전체보기
                        </button>
                        <button
                            onClick={() => setFilterCategory('Gate')}
                            className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Gate' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                        >
                            의사결정 Gate
                        </button>
                        <button
                            onClick={() => setFilterCategory('Task')}
                            className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Task' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                        >
                            기능별 업무
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Matrix Grid */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden">
                <div className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                    <div className="flex items-center min-w-[2300px]">
                        <table className="text-left table-fixed min-w-[1500px] flex-1">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="px-2 w-[100px] text-center sticky left-0 bg-[#272726] z-30">구분</th>
                                    <th className="pl-4 w-[270px] sticky left-[100px] bg-[#272726] z-30">세부업무</th>
                                    <th className="px-2 w-[110px] text-center sticky left-[370px] bg-[#272726] z-30">주관</th>
                                    <th className="px-2 w-[100px] text-center sticky left-[480px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {
                                        return (
                                            <th key={col.key} className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[92px] ${
                                                col.highlight ? 'bg-white/[0.03] text-[#60a5fa]' : 'text-[#86868B]'
                                            } border-r border-[#4c4c4c]/50`}>
                                                <div>{col.labelTop}</div>
                                                {col.labelBottom && <div className="text-[11px] opacity-75 mt-0.5">{col.labelBottom}</div>}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c] text-[13px]">
                                {filteredData.map((item, idx) => {
                                    const isGate = item.category === 'Gate';
                                    return (
                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-14 group">
                                            {/* 구분 */}
                                            <td className="px-2 sticky left-0 bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center w-[100px] min-w-[100px] max-w-[100px]">
                                                <span className={`px-1.5 py-1 rounded-md font-bold block ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {renderCategoryName(item.name)}
                                                </span>
                                            </td>
                                            
                                            {/* 세부업무 */}
                                            <td className="pl-4 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-all sticky left-[100px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-[14px] w-[270px] min-w-[270px] max-w-[270px]">
                                                {item.desc}
                                            </td>
                                            
                                            {/* 주관 */}
                                            <td className="px-2 text-[#E5E5E5] font-semibold text-center sticky left-[370px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-[13px] leading-tight whitespace-normal break-all w-[110px] min-w-[110px] max-w-[110px]">
                                                {item.lead.includes(' ') ? (
                                                    item.lead.split(' ').map((part, pIdx) => (
                                                        <div key={pIdx}>{part}</div>
                                                    ))
                                                ) : (
                                                    item.lead
                                                )}
                                            </td>
                                            
                                            {/* 협업 */}
                                            <td className="px-2 text-[#c2c2c6] leading-tight text-center pr-2 whitespace-normal break-all sticky left-[480px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] w-[100px] min-w-[100px] max-w-[100px]">
                                                {item.coop.split(';').map((c, cIdx) => (
                                                    c && <div key={cIdx} className="text-[11px]">{c}</div>
                                                ))}
                                            </td>

                                            {/* Grid Columns */}
                                            {COLUMNS.map((col, cIdx) => {
                                                const mark = item.schedule[col.key];
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.highlight ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' : ''
                                                    } border-r border-[#4c4c4c]/40 w-[92px] min-w-[92px] max-w-[92px]`}>
                                                        {mark === '●' && (
                                                            <span className="w-3.5 h-3.5 rounded-full bg-[#2997ff] inline-block shadow-sm shadow-[#2997ff]/20"></span>
                                                        )}
                                                        {mark === '◆' && (
                                                            <span className="text-[#F59E0B] font-mono text-[28px] font-extrabold block translate-y-[-1px] animate-pulse">◆</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* 우측 워터마크 영역 */}
                        <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                            <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                IOTA Seoul<br />Cross Functional<br />Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Map & R&R Section */}
            <div className="w-full flex items-center justify-between mt-[48px] mb-[14px]">
                <h2 className="text-[26px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>
                {isAuthorized && (
                    <button 
                        onClick={handleAddClick}
                        className="px-4 py-1.5 bg-[#272726] hover:bg-[#333] border border-[#3c3c3c] hover:border-[#555] rounded-full text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 mr-[calc(50vw-50%+24px)]"
                    >
                        <span>+ 업무 추가</span>
                    </button>
                )}
            </div>

            {/* R&R Matrix Table */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                    <div className="flex items-center min-w-[2380px]">
                        <table className="text-left table-fixed min-w-[1580px] flex-1 border-collapse border-b border-[#3c3c3c] bg-[#272726]">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-[#272726] text-[#86868B] font-bold text-[12px] h-[52px]">
                                    <th className="px-3 w-[104px] min-w-[104px] max-w-[104px] text-center sticky left-0 bg-[#272726] z-30">
                                        <div className="relative inline-flex items-center justify-center bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrCategory === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrCategory === '전체보기' ? '대분류' : selectedRrCategory}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrCategory}
                                                onChange={(e) => setSelectedRrCategory(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_CATEGORIES.slice(1).map(cat => {
                                                    const isAdHoc = cat === '팝업/단발';
                                                    return (
                                                        <option 
                                                            key={cat} 
                                                            value={cat} 
                                                            disabled={isAdHoc} 
                                                            className={isAdHoc ? 'text-[#555] bg-[#222]' : 'bg-[#222] text-white'}
                                                        >
                                                            {cat} {isAdHoc && '(준비중)'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="px-3 w-[130px] min-w-[130px] max-w-[130px] text-center sticky left-[104px] bg-[#272726] z-30">세부섹터</th>
                                    <th className="pl-3 w-[230px] min-w-[230px] max-w-[230px] sticky left-[234px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">대표 업무</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">PF 전<br />필요</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">착공 전<br />필요</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight border-r border-[#3c3c3c]">준공 전<br />필요</th>
                                    <th className="w-[116px] min-w-[116px] max-w-[116px] text-center bg-[#272726]">
                                        <div className="relative inline-flex items-center justify-center bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b] translate-x-[6px]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrLead === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrLead === '전체보기' ? '주관 부서' : selectedRrLead}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrLead}
                                                onChange={(e) => setSelectedRrLead(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_LEADS.slice(1).map(lead => (
                                                    <option key={lead} value={lead} className="bg-[#222] text-white">{lead}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="pl-3 w-[260px] min-w-[260px] max-w-[260px] text-left bg-[#272726] border-r border-[#3c3c3c]">
                                        <div className="relative inline-flex items-center justify-start bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2.5 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrCoop === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrCoop === '전체보기' ? '협업 부서' : selectedRrCoop}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrCoop}
                                                onChange={(e) => setSelectedRrCoop(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_COOPS.slice(1).map(coop => (
                                                    <option key={coop} value={coop} className="bg-[#222] text-white">{coop}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">외부 상대방</th>
                                    <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">필요산출물</th>
                                    <th className="px-3 w-[195px] min-w-[195px] max-w-[195px] text-left bg-[#272726] border-r border-[#3c3c3c]">관리 포인트</th>
                                    <th className="px-2 w-[80px] min-w-[80px] max-w-[80px] text-center bg-[#272726] border-r border-[#3c3c3c]">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]/60 text-[12px]">
                                {rrData.filter(item => {
                                    const matchCat = selectedRrCategory === '전체보기' || item.category === selectedRrCategory;
                                    const matchLead = selectedRrLead === '전체보기' || item.lead === selectedRrLead;
                                    const matchCoop = selectedRrCoop === '전체보기' || item.coop.includes(selectedRrCoop);
                                    return matchCat && matchLead && matchCoop;
                                }).map((item) => {
                                    return (
                                        <tr key={item.id} className="bg-[#272726] hover:bg-[#333] transition-colors h-11 group">
                                            {/* 대분류 */}
                                            <td className="px-3 sticky left-0 bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center font-bold text-white text-[12px] w-[104px] min-w-[104px] max-w-[104px]">
                                                {item.category}
                                            </td>
                                            
                                            {/* 세부섹터 */}
                                            <td className="px-3 sticky left-[104px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-all w-[130px] min-w-[130px] max-w-[130px]">
                                                {item.subsector}
                                            </td>
                                            
                                            {/* 대표 업무 */}
                                            <td className="pl-3 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-all sticky left-[234px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] text-[13px] w-[230px] min-w-[230px] max-w-[230px]">
                                                {item.task}
                                            </td>
                                            
                                            {/* PF 전 필요 */}
                                            <td className="px-2 text-center w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.pf ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 착공 전 필요 */}
                                            <td className="px-2 text-center w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.const ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 준공 전 필요 */}
                                            <td className="px-2 text-center border-r border-[#3c3c3c] w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.op ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 주관 부서 */}
                                            <td className="text-center w-[116px] min-w-[116px] max-w-[116px]">
                                                <span className="px-2.5 py-0.5 rounded font-bold bg-[#2997ff]/10 text-white border border-[#2997ff]/20 text-[11px] whitespace-nowrap inline-block translate-x-[6px]">
                                                    {item.lead}
                                                </span>
                                            </td>
                                            
                                            {/* 협업 부서 */}
                                            <td className="pl-3 text-left w-[260px] min-w-[260px] max-w-[260px] border-r border-[#3c3c3c]">
                                                <div className="flex flex-row gap-1.5 justify-start items-center whitespace-nowrap">
                                                    {item.coop.map((c, cIdx) => (
                                                        c && <span key={cIdx} className="px-2 py-0.5 rounded bg-[#1F1F1E] text-[#C2C2C6] border border-[#3c3c3c] text-[11px] whitespace-nowrap">{c}</span>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* 외부 상대방 */}
                                            <td className="px-3 text-center text-[#A1A1AA] font-semibold whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">
                                                {item.partner || '-'}
                                            </td>

                                            {/* 필요산출물 */}
                                            <td className="px-3 text-center text-[#F59E0B] font-semibold whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">
                                                {item.need || '-'}
                                            </td>

                                            {/* 관리 포인트 */}
                                            <td className="px-3 text-left text-[#F59E0B] font-semibold whitespace-normal break-all w-[195px] min-w-[195px] max-w-[195px] border-r border-[#3c3c3c]">
                                                {item.point}
                                            </td>

                                            {/* 관리 */}
                                            <td className="px-2 text-center w-[80px] min-w-[80px] max-w-[80px] border-r border-[#3c3c3c]">
                                                {isAuthorized ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => handleEditClick(item)}
                                                            className="text-blue-400 hover:text-blue-300 font-bold text-[11px] cursor-pointer"
                                                        >
                                                            수정
                                                        </button>
                                                        <span className="text-[#555] select-none">|</span>
                                                        <button 
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="text-red-400 hover:text-red-300 font-bold text-[11px] cursor-pointer"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#555] text-[11px]">🔒</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* 우측 워터마크 영역 */}
                        <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                            <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                IOTA Seoul<br />Cross Functional<br />Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] w-full max-w-[650px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[#3c3c3c] flex justify-between items-center bg-[#2c2c2b]">
                            <h3 className="text-[18px] font-bold text-white">
                                {editingItem ? 'R&R 및 필요산출물 수정' : 'R&R 및 필요산출물 추가'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#86868B] hover:text-white font-bold text-[18px] cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                {/* 대분류 */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">대분류</label>
                                    <select 
                                        value={formCategory}
                                        onChange={e => setFormCategory(e.target.value)}
                                        className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff]"
                                        required
                                    >
                                        {R_R_CATEGORIES.slice(1).map(cat => {
                                            const isAdHoc = cat === '팝업/단발';
                                            return (
                                                <option 
                                                    key={cat} 
                                                    value={cat} 
                                                    disabled={isAdHoc} 
                                                    className={isAdHoc ? 'text-[#555] bg-[#1a1a1a]' : 'bg-[#1a1a1a] text-white'}
                                                >
                                                    {cat} {isAdHoc && '(준비중)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                
                                {/* 세부섹터 */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">세부섹터</label>
                                    <input 
                                        type="text"
                                        value={formSubsector}
                                        onChange={e => setFormSubsector(e.target.value)}
                                        className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff]"
                                        placeholder="예: 현금기부채납"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 대표 업무 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-[#86868B]">대표 업무</label>
                                <input 
                                    type="text"
                                    value={formTask}
                                    onChange={e => setFormTask(e.target.value)}
                                    className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff] w-full"
                                    placeholder="업무 내용을 입력하세요"
                                    required
                                />
                            </div>

                            {/* 필수 여부 체크박스 (Gates) */}
                            <div className="flex items-center gap-6 py-2 border-y border-[#3c3c3c]/50">
                                <label className="text-[12px] font-bold text-[#86868B]">필수 지정:</label>
                                <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={formPf}
                                        onChange={e => setFormPf(e.target.checked)}
                                        className="rounded border-[#3c3c3c] bg-[#1a1a1a] text-[#2997ff] focus:ring-0 focus:ring-offset-0"
                                    />
                                    <span>PF 전 필요</span>
                                </label>
                                <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={formConst}
                                        onChange={e => setFormConst(e.target.checked)}
                                        className="rounded border-[#3c3c3c] bg-[#1a1a1a] text-[#2997ff] focus:ring-0 focus:ring-offset-0"
                                    />
                                    <span>착공 전 필요</span>
                                </label>
                                <label className="flex items-center gap-2 text-[13px] text-white cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={formOp}
                                        onChange={e => setFormOp(e.target.checked)}
                                        className="rounded border-[#3c3c3c] bg-[#1a1a1a] text-[#2997ff] focus:ring-0 focus:ring-offset-0"
                                    />
                                    <span>준공 전 필요</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* 주관 부서 */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">주관 부서</label>
                                    <select 
                                        value={formLead}
                                        onChange={e => setFormLead(e.target.value)}
                                        className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff]"
                                        required
                                    >
                                        {deptOptions.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 외부 상대방 */}
                                <div className="relative flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">외부 상대방</label>
                                    <input 
                                        type="text"
                                        value={formPartner}
                                        onChange={e => {
                                            setFormPartner(e.target.value);
                                            setShowStakeholderSuggestions(true);
                                        }}
                                        onFocus={() => setShowStakeholderSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowStakeholderSuggestions(false), 200)}
                                        className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff]"
                                        placeholder="예: 현대건설 (검색 또는 직접 입력)"
                                    />
                                    {showStakeholderSuggestions && formPartner && (
                                        <div className="absolute top-[60px] left-0 w-full bg-[#222] border border-[#3c3c3c] rounded-[8px] py-1 max-h-[160px] overflow-y-auto z-[10000] shadow-xl">
                                            {uniqueStakeholderNames
                                                .filter(name => name.toLowerCase().includes(formPartner.toLowerCase()))
                                                .map((name, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="px-3 py-2 text-[13px] text-[#E5E5E5] hover:bg-[#333] cursor-pointer truncate"
                                                        onClick={() => {
                                                            setFormPartner(name);
                                                            setShowStakeholderSuggestions(false);
                                                        }}
                                                    >
                                                        {name}
                                                    </div>
                                                ))}
                                            {!uniqueStakeholderNames.some(name => name.toLowerCase() === formPartner.toLowerCase()) && (
                                                <div 
                                                    className="px-3 py-2 text-[13px] text-[#2997ff] hover:bg-[#333] cursor-pointer font-bold border-t border-[#3c3c3c]/50"
                                                    onClick={async () => {
                                                        const nameToRegister = formPartner;
                                                        if (window.confirm(`'${nameToRegister}'을(를) 이해관계자 마스터에 새로 등록하시겠습니까?`)) {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('iota_stakeholder_master')
                                                                    .insert({
                                                                        company_name: nameToRegister,
                                                                        role_category: '기타'
                                                                    });
                                                                if (error) throw error;
                                                                
                                                                // Add to local state so it autocomplete updates
                                                                setMasterStakeholders(prev => [...prev, { company_name: nameToRegister, role_category: '기타' }]);
                                                                alert('새 이해관계자가 등록되었습니다.');
                                                            } catch (err) {
                                                                console.error("Failed to register new stakeholder:", err);
                                                                alert("등록에 실패했습니다.");
                                                            }
                                                        }
                                                        setShowStakeholderSuggestions(false);
                                                    }}
                                                >
                                                    ➕ 새 상대방 등록: "{formPartner}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 협업 부서 (Checkboxes) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-bold text-[#86868B]">협업 부서</label>
                                <div className="grid grid-cols-3 gap-2 bg-[#1a1a1a] p-3 rounded-[8px] border border-[#3c3c3c]">
                                    {deptOptions.map(dept => {
                                        const isChecked = formCoop.includes(dept);
                                        return (
                                            <label key={dept} className="flex items-center gap-2 text-[12px] text-white cursor-pointer select-none">
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setFormCoop(prev => [...prev, dept]);
                                                        } else {
                                                            setFormCoop(prev => prev.filter(d => d !== dept));
                                                        }
                                                    }}
                                                    className="rounded border-[#3c3c3c] bg-[#1a1a1a] text-[#2997ff] focus:ring-0 focus:ring-offset-0"
                                                />
                                                <span>{dept}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 필요산출물 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-[#86868B]">필요산출물</label>
                                <input 
                                    type="text"
                                    value={formNeed}
                                    onChange={e => setFormNeed(e.target.value)}
                                    className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff] w-full"
                                    placeholder="예: 관청 협의결과"
                                />
                            </div>

                            {/* 관리 포인트 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-[#86868B]">관리 포인트</label>
                                <input 
                                    type="text"
                                    value={formPoint}
                                    onChange={e => setFormPoint(e.target.value)}
                                    className="bg-[#1a1a1a] border border-[#3c3c3c] text-white rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#2997ff] w-full"
                                    placeholder="관리 및 점검 포인트를 입력하세요"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-[#3c3c3c] flex justify-end gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-[8px] bg-[#333] hover:bg-[#444] text-[13px] font-bold text-white transition-colors cursor-pointer"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 rounded-[8px] bg-[#2997ff] hover:bg-[#147ce5] text-[13px] font-bold text-white transition-colors cursor-pointer"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
