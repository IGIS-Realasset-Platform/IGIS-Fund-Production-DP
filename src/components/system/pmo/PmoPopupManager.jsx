import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// Local Fallbacks to prevent UI crashes if DB queries return empty or fail
const FALLBACK_PROJECTS = [
    { project_code: 'IOTA_SEOUL', project_name: 'IOTA 공통' },
    { project_code: 'PFV_427', project_name: '427 PFV' },
    { project_code: 'PFV_816', project_name: '816 PFV' },
    { project_code: 'FUND_421', project_name: '421Fund' },
    { project_code: 'EXTERNAL', project_name: '외부' }
];

const FALLBACK_DEPARTMENTS = [
    { dept_code: 'DEPT_PM2', dept_name: '사업2파트' },
    { dept_code: 'DEPT_LFC', dept_name: '파이낸싱-LFC' },
    { dept_code: 'DEPT_DEV', dept_name: '개발관리실' },
    { dept_code: 'DEPT_DESIGN', dept_name: '설계실' },
    { dept_code: 'DEPT_MKT', dept_name: '마케팅팀' }
];

const CATEGORY_OPTIONS = [
    '공통 PMO', '인허가', '호텔/운영', '시공/원가', '도면/설계', '인테리어/TI',
    '임차/마케팅', 'PF/금융', '구조/법무/세무', '주주/보고', '준공/담보대출', '일반 요청'
];

const IMPACT_OPTIONS = ['높음', '중간', '낮음'];
const STATUS_OPTIONS = ['미착수', '진행중', '검토중', '대기', '지연', '완료', '보류', '중단'];

export default function PmoPopupManager() {
    const { memberInfo, user } = useAuth();
    const [popups, setPopups] = useState([]);
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [pilotMembers, setPilotMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProject, setFilterProject] = useState('전체보기');
    const [filterCategory, setFilterCategory] = useState('전체보기');
    const [filterStatus, setFilterStatus] = useState('전체보기');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedPopup, setSelectedPopup] = useState(null);

    // Form state
    const [formRequestDate, setFormRequestDate] = useState('');
    const [formRequester, setFormRequester] = useState('');
    const [formProjectCode, setFormProjectCode] = useState('');
    const [formCategoryName, setFormCategoryName] = useState('');
    const [formRequestDetail, setFormRequestDetail] = useState('');
    const [formPurpose, setFormPurpose] = useState('');
    const [formDeliverables, setFormDeliverables] = useState('');
    const [formDueDate, setFormDueDate] = useState('');
    const [formAssignedDeptCode, setFormAssignedDeptCode] = useState('');
    const [formCoopDeptCodes, setFormCoopDeptCodes] = useState('');
    const [formImpactLevel, setFormImpactLevel] = useState('중간');
    const [formHandlingStatus, setFormHandlingStatus] = useState('미착수');
    const [formMemo, setFormMemo] = useState('');

    // Inline edit state
    const [activeStatusSelectId, setActiveStatusSelectId] = useState(null);

    // Delete confirmation state
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Autocomplete states
    const [showRequesterSuggestions, setShowRequesterSuggestions] = useState(false);
    const [showCoopSuggestions, setShowCoopSuggestions] = useState(false);
    const [tempRequesterVal, setTempRequesterVal] = useState('');

    // Check Roles
    const currentUserEmail = user?.email || memberInfo?.email || '';
    const isAdmin = memberInfo ? (memberInfo.workspace_code === 'WS_PM' || ['master', 'director'].includes(memberInfo.role_code)) : true;

    // Load Initial Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Popup Requests (unified table)
            const { data: popupData, error: popupErr } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .select('*')
                .eq('task_type', '팝업')
                .order('request_date', { ascending: false });
            if (popupErr) throw popupErr;

            const normalizedData = (popupData || []).map(p => {
                let status = p.status;
                if (!status || status === '접수' || status === '위임' || status === '반려') {
                    status = '미착수';
                }
                return {
                    id: p.id,
                    request_date: p.request_date,
                    requester: p.requester,
                    project_code: p.project_code,
                    category_name: p.category_main,
                    request_detail: p.task_name,
                    purpose: p.task_purpose,
                    deliverables: p.deliverables,
                    due_date: p.due_date,
                    assigned_dept_code: p.lead_dept_code,
                    coop_dept_codes: p.coop_dept_codes,
                    impact_level: p.importance_level,
                    handling_status: status,
                    memo: p.notes,
                    created_by_email: p.created_by_email
                };
            });
            setPopups(normalizedData);

            // 2. Fetch Projects
            const { data: projData, error: projErr } = await supabase
                .schema('iota_v2')
                .from('iota_projects')
                .select('*');
            if (!projErr && projData) setProjects(projData);
            else setProjects(FALLBACK_PROJECTS);

            // 3. Fetch Departments
            const { data: deptData, error: deptErr } = await supabase
                .schema('iota_v2')
                .from('iota_departments')
                .select('*');
            if (!deptErr && deptData && deptData.length > 0) {
                // Map names dynamically to match user request (PM ➔ 파트, 펀드운용 ➔ KAM)
                const mappedDepts = deptData.map(d => {
                    if (d.dept_code === 'DEPT_PM2') return { ...d, dept_name: '사업2파트' };
                    return d;
                });
                setDepartments(mappedDepts);
            } else {
                setDepartments(FALLBACK_DEPARTMENTS);
            }

            // 4. Fetch Pilot Members for autocomplete (public schema)
            const { data: memberData, error: memberErr } = await supabase
                .from('iota_seoul_pilot_members')
                .select('staff_name, org_name');
            if (!memberErr && memberData) setPilotMembers(memberData);

        } catch (err) {
            console.error("Failed to load popups dashboard data:", err);
            toast.error("데이터 로드에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Summary Metric Counts
    const metrics = useMemo(() => {
        const counts = { total: popups.length, inProgress: 0, delayed: 0, completed: 0, pending: 0 };
        popups.forEach(p => {
            const status = p.handling_status;
            if (status === '진행중' || status === '검토중' || status === '대기') counts.inProgress++;
            else if (status === '지연') counts.delayed++;
            else if (status === '완료') counts.completed++;
            else if (status === '보류' || status === '중단' || status === '미착수' || !status) counts.pending++;
        });
        return counts;
    }, [popups]);

    // Filter Tasks
    const filteredPopups = useMemo(() => {
        return popups.filter(p => {
            // Search Query
            const textMatch = searchQuery.trim() === '' || 
                (p.requester || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.request_detail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.purpose || '').toLowerCase().includes(searchQuery.toLowerCase());
            if (!textMatch) return false;

            // Project code
            if (filterProject !== '전체보기' && p.project_code !== filterProject) return false;

            // Category name
            if (filterCategory !== '전체보기' && p.category_name !== filterCategory) return false;

            // Handling status
            if (filterStatus !== '전체보기') {
                if (filterStatus === '진행중') {
                    if (p.handling_status !== '진행중' && p.handling_status !== '검토중' && p.handling_status !== '대기') return false;
                } else if (filterStatus === '보류') {
                    if (p.handling_status !== '보류' && p.handling_status !== '중단' && p.handling_status !== '미착수' && p.handling_status) return false;
                } else {
                    if (p.handling_status !== filterStatus) return false;
                }
            }

            return true;
        });
    }, [popups, searchQuery, filterProject, filterCategory, filterStatus]);

    // Handle Open Create Modal
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedPopup(null);
        setFormRequestDate(new Date().toISOString().slice(0, 10));
        setFormRequester(memberInfo ? `${memberInfo.staff_name || memberInfo.name || ''} / ${memberInfo.org_name || ''}` : '');
        setFormProjectCode('IOTA_SEOUL');
        setFormCategoryName('일반 요청');
        setFormRequestDetail('');
        setFormPurpose('');
        setFormDeliverables('');
        setFormDueDate('');
        setFormAssignedDeptCode('DEPT_PM2');
        setFormCoopDeptCodes('');
        setFormImpactLevel('중간');
        setFormHandlingStatus('미착수');
        setFormMemo('');
        setIsModalOpen(true);
    };

    // Handle Open Edit Modal
    const openEditModal = (p) => {
        // Owner checking
        const isOwner = p.created_by_email === currentUserEmail;
        if (!isAdmin && !isOwner) {
            toast.error("직접 등록한 요청사항만 수정이 가능합니다.");
            return;
        }

        setModalMode('edit');
        setSelectedPopup(p);
        setFormRequestDate(p.request_date || '');
        setFormRequester(p.requester || '');
        setFormProjectCode(p.project_code || '');
        setFormCategoryName(p.category_name || '');
        setFormRequestDetail(p.request_detail || '');
        setFormPurpose(p.purpose || '');
        setFormDeliverables(p.deliverables || '');
        setFormDueDate(p.due_date || '');
        setFormAssignedDeptCode(p.assigned_dept_code || '');
        setFormCoopDeptCodes(p.coop_dept_codes || '');
        setFormImpactLevel(p.impact_level || '중간');
        setFormHandlingStatus(p.handling_status || '미착수');
        setFormMemo(p.memo || '');
        setIsModalOpen(true);
    };

    // Save Data (Insert / Update)
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formRequester.trim() || !formRequestDetail.trim()) {
            toast.error("요청자와 요청업무는 필수 입력 사항입니다.");
            return;
        }

        const payload = {
            request_date: formRequestDate || null,
            requester: formRequester,
            project_code: formProjectCode || null,
            category_main: formCategoryName || null,
            task_name: formRequestDetail,
            task_purpose: formPurpose || null,
            deliverables: formDeliverables || null,
            due_date: formDueDate || null,
            lead_dept_code: formAssignedDeptCode || null,
            coop_dept_codes: formCoopDeptCodes || null,
            importance_level: formImpactLevel || null,
            status: formHandlingStatus || '미착수',
            notes: formMemo || null,
            task_type: '팝업',
            target_axis: '공통 PMO',
            created_by_email: modalMode === 'create' ? currentUserEmail : selectedPopup.created_by_email
        };

        try {
            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .insert([payload])
                    .select();

                if (error) throw error;
                toast.success("단발성 업무 요청이 성공적으로 등록되었습니다.");
            } else {
                const { error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .update(payload)
                    .eq('id', selectedPopup.id);

                if (error) throw error;
                toast.success("정보가 성공적으로 수정되었습니다.");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save popup request:", err);
            toast.error("저장에 실패했습니다: " + (err.message || err.details || err));
        }
    };

    // Quick Status Update
    const handleInlineStatusChange = async (popupId, newStatus) => {
        if (!isAdmin) {
            toast.error("처리방침은 관리자(PMO)만 변경 가능합니다.");
            return;
        }

        try {
            const { error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .update({ status: newStatus })
                .eq('id', popupId);

            if (error) throw error;
            setPopups(prev => prev.map(p => p.id === popupId ? { ...p, handling_status: newStatus } : p));
            toast.success(`처리방침이 '${newStatus}' 상태로 변경되었습니다.`);
        } catch (err) {
            console.error("Failed to update status in-place:", err);
            toast.error("상태 변경에 실패했습니다.");
        } finally {
            setActiveStatusSelectId(null);
        }
    };

    // Delete popup request
    const handleDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const { error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .delete()
                .eq('id', deleteTargetId);

            if (error) throw error;
            toast.success("요청 정보가 삭제되었습니다.");
            fetchData();
        } catch (err) {
            console.error("Failed to delete popup request:", err);
            toast.error("삭제에 실패했습니다. 권한을 확인하세요.");
        } finally {
            setDeleteTargetId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case '완료': return 'bg-green-500/10 text-green-400 border border-green-500/20';
            case '지연': return 'bg-red-500/10 text-red-400 border border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
        }
    };

    const getImpactStyle = (level) => {
        switch (level) {
            case '높음': return 'text-[#ff453a] font-bold';
            case '보통':
            case '중간': return 'text-[#ffd60a]';
            case '낮음': return 'text-[#30d158]';
            default: return 'text-gray-400';
        }
    };

    const getProjectName = (code) => {
        const match = projects.find(p => p.project_code === code);
        return match ? match.project_name : code || '-';
    };

    const getDeptName = (code) => {
        const match = departments.find(d => d.dept_code === code);
        return match ? match.dept_name : code || '-';
    };

    const getRequesterDeptOnly = (requesterStr) => {
        if (!requesterStr) return '-';
        if (requesterStr.includes('/')) {
            return requesterStr.split('/')[1].trim();
        }
        return requesterStr;
    };

    const mapOrgName = (staffName, orgName) => {
        if (!orgName) return '';
        const trimmedOrg = orgName.trim();
        if (trimmedOrg === '사업 PM' || trimmedOrg === '사업PM' || trimmedOrg === '사업 PM 1' || trimmedOrg === '사업 PM 2') {
            const pm2Members = ['강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정'];
            return pm2Members.includes(staffName.trim()) ? '사업2파트' : '사업1파트';
        }
        return trimmedOrg;
    };

    // Autocomplete filtering logic
    const filteredRequesters = useMemo(() => {
        if (!formRequester.trim()) return pilotMembers;
        const exactMatch = pilotMembers.some(m => `${m.staff_name} / ${mapOrgName(m.staff_name, m.org_name)}` === formRequester.trim());
        if (exactMatch) return [];
        return pilotMembers.filter(m => {
            const mappedOrg = mapOrgName(m.staff_name, m.org_name);
            return m.staff_name.toLowerCase().includes(formRequester.toLowerCase()) ||
                mappedOrg.toLowerCase().includes(formRequester.toLowerCase());
        });
    }, [formRequester, pilotMembers]);

    const lastCoopToken = useMemo(() => {
        const parts = formCoopDeptCodes.split(',');
        return parts[parts.length - 1].trim();
    }, [formCoopDeptCodes]);

    const filteredCoopDepts = useMemo(() => {
        if (!lastCoopToken) return [];
        return departments.filter(d => 
            d.dept_name.toLowerCase().includes(lastCoopToken.toLowerCase()) &&
            !formCoopDeptCodes.includes(d.dept_name)
        );
    }, [lastCoopToken, departments, formCoopDeptCodes]);

    const handleSelectCoop = (deptName) => {
        const parts = formCoopDeptCodes.split(',');
        parts[parts.length - 1] = ` ${deptName}`;
        setFormCoopDeptCodes(parts.join(',').trim() + ', ');
        setShowCoopSuggestions(false);
    };

    return (
        <div className="w-[1290px] mx-auto flex-1 flex flex-col pt-[48px] pb-[200px] box-border select-text text-white bg-transparent">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Header Title Section */}
            <div className="w-full flex justify-between items-end mb-[22px]">
                <div className="flex flex-col text-left">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">단발성 업무 요청</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">정규 마일스톤 외에 개별적으로 발생하는 단발성 업무 요청 및 협업 사항을 관리합니다.</p>
                </div>

                <div className="flex items-center gap-3 select-none">
                    <button 
                        onClick={fetchData}
                        className="px-4 py-2 bg-[#2c2c2b]/80 border border-[#3c3c3c] hover:bg-[#323231] hover:border-[#4c4c4b] rounded-[8px] text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                        </svg>
                        새로고침
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-[#2997ff]/10 border border-[#2997ff]/20 hover:bg-[#2997ff]/20 text-[#2997ff] rounded-[8px] text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        단발성 업무 요청 등록
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard Banner */}
            <div className="grid grid-cols-5 gap-3 mb-[16px]">
                <div 
                    onClick={() => setFilterStatus('전체보기')}
                    className={`py-2 px-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${filterStatus === '전체보기' ? 'bg-[#2997ff]/10 border-[#2997ff] shadow-md shadow-[#2997ff]/5' : 'bg-[#2c2c2b]/60 border-[#3c3c3c] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#86868B]">전체 요청</span>
                    <span className="text-[15px] font-bold text-white">{metrics.total} <span className="text-[11px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('진행중')}
                    className={`py-2 px-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${filterStatus === '진행중' ? 'bg-[#0071e3]/10 border-[#0071e3] shadow-md shadow-[#0071e3]/5' : 'bg-[#2c2c2b]/60 border-[#3c3c3c] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#2997ff]">진행 중</span>
                    <span className="text-[15px] font-bold text-[#2997ff]">{metrics.inProgress} <span className="text-[11px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('지연')}
                    className={`py-2 px-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${filterStatus === '지연' ? 'bg-[#ff453a]/10 border-[#ff453a] shadow-md shadow-[#ff453a]/5' : 'bg-[#2c2c2b]/60 border-[#3c3c3c] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#ff453a]">지연됨</span>
                    <span className="text-[15px] font-bold text-[#ff453a]">{metrics.delayed} <span className="text-[11px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('완료')}
                    className={`py-2 px-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${filterStatus === '완료' ? 'bg-[#30d158]/10 border-[#30d158] shadow-md shadow-[#30d158]/5' : 'bg-[#2c2c2b]/60 border-[#3c3c3c] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#30d158]">완료됨</span>
                    <span className="text-[15px] font-bold text-[#30d158]">{metrics.completed} <span className="text-[11px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('보류')}
                    className={`py-2 px-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${filterStatus === '보류' ? 'bg-[#ffd60a]/10 border-[#ffd60a] shadow-md shadow-[#ffd60a]/5' : 'bg-[#2c2c2b]/60 border-[#3c3c3c] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#ffd60a]">보류/기타</span>
                    <span className="text-[15px] font-bold text-[#ffd60a]">{metrics.pending} <span className="text-[11px] font-medium text-[#86868B]">건</span></span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#2c2c2b]/30 border border-[#3c3c3c] rounded-[16px] py-3 pl-3 pr-4 mb-[16px] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                    {/* Search query */}
                    <div className="relative w-[280px] shrink-0">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="요청자, 업무명, 목적 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] text-[13px] font-medium text-white placeholder-[#86868B] focus:border-[#2997ff] focus:outline-none transition-colors"
                        />
                        <svg className="w-4 h-4 text-[#86868B] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Project */}
                    <div className="flex items-center gap-1.5 select-none">
                        <span className="text-[12px] text-[#86868B] font-bold">프로젝트:</span>
                        <div className="relative inline-block">
                            <select 
                                value={filterProject}
                                onChange={(e) => setFilterProject(e.target.value)}
                                className="appearance-none bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3 pr-8 py-1.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="전체보기">전체보기</option>
                                {projects.map(p => (
                                    <option key={p.project_code} value={p.project_code}>{p.project_name}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filter Category */}
                    <div className="flex items-center gap-1.5 select-none">
                        <span className="text-[12px] text-[#86868B] font-bold">업무분류:</span>
                        <div className="relative inline-block">
                            <select 
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="appearance-none bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3 pr-8 py-1.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="전체보기">전체보기</option>
                                {CATEGORY_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1.5 select-none">
                        <span className="text-[12px] text-[#86868B] font-bold">상태:</span>
                        <div className="relative inline-block">
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3 pr-8 py-1.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="전체보기">전체보기</option>
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-[13px] text-[#86868B] font-bold select-none">
                    검색 결과: <span className="text-white">{filteredPopups.length}</span> 건
                </div>
            </div>

            {/* Spreadsheet Grid Table */}
            {loading ? (
                <div className="h-[360px] bg-transparent border border-[#3c3c3c] rounded-[24px] flex items-center justify-center">
                    <span className="text-[#86868B] text-[15px] animate-pulse">요청 데이터를 연동하고 있습니다...</span>
                </div>
            ) : (
                <div className="border border-[#3c3c3c] bg-[#272726] rounded-[24px] overflow-hidden shadow-2xl flex flex-col">
                    <div className="w-full overflow-x-auto pr-0 timeline-scrollbar pb-1">
                        <table className="text-left table-fixed border-collapse w-[1290px] min-w-[1290px] select-text">
                            <thead className="bg-transparent">
                                <tr className="border-b border-[#3c3c3c] h-[38px]">
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[90px]">접수일</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[100px]">요청부서</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[80px]">프로젝트</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 w-[90px]">업무분류</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 w-[220px]">업무명</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 w-[150px]">요청목적</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 w-[150px]">필요 산출물</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[90px]">요청기한</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[80px]">수행부서</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[80px]">중요도</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] border-r border-[#3c3c3c]/50 text-center w-[70px]">상태</th>
                                    <th className="px-3 py-0 text-[13px] font-bold text-[#86868B] text-center w-[90px]">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]/50 bg-transparent">
                                {filteredPopups.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="py-20 text-center text-[#86868B] text-[14px]">
                                            조건에 만족하는 단발성 업무 요청 정보가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPopups.map((p, index) => {
                                        const isOwner = p.created_by_email === currentUserEmail;
                                        const canEdit = isAdmin || (currentUserEmail && isOwner);

                                        return (
                                            <tr 
                                                key={p.id} 
                                                onDoubleClick={() => canEdit && openEditModal(p)}
                                                className="hover:bg-white/[0.04] transition-colors group text-[13px] h-[42px] bg-transparent"
                                            >
                                                {/* Date (Format: yy.mm.dd, font 1px smaller) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-[#86868B] text-center font-mono font-medium text-[12px] align-middle">
                                                    {p.request_date ? p.request_date.slice(2).replace(/-/g, '.') : '-'}
                                                </td>

                                                {/* Requesting Department (Center aligned, requester name deleted) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-center font-bold text-[#E5E5E5] truncate align-middle" title={getRequesterDeptOnly(p.requester)}>
                                                    {getRequesterDeptOnly(p.requester)}
                                                </td>

                                                {/* Project (with badge, 80px, center-aligned) */}
                                                <td className="px-1.5 py-2 border-r border-[#3c3c3c]/50 text-center font-bold align-middle">
                                                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border inline-block align-middle max-w-full truncate ${
                                                        p.project_code === 'IOTA_SEOUL' ? 'bg-[#323233] text-[#F5F5F7] border-[#424243]' :
                                                        p.project_code === 'PFV_427' ? 'bg-[#3A3A3C] text-[#FFFFFF] border-[#48484A]' :
                                                        p.project_code === 'PFV_816' ? 'bg-[#2C2C2E] text-[#E5E5EA] border-[#3A3A3C]' :
                                                        p.project_code === 'FUND_421' ? 'bg-[#242426] text-[#D1D1D6] border-[#323234]' :
                                                        'bg-[#1C1C1E] text-[#AEAEB2] border-[#2C2C2E]'
                                                    }`}>
                                                        {getProjectName(p.project_code)}
                                                    </span>
                                                </td>

                                                {/* Category (업무분류, 90px) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-white/80 font-medium truncate align-middle" title={p.category_name}>
                                                    {p.category_name || '-'}
                                                </td>

                                                {/* Task Details (업무명, 220px, truncate) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-[#E5E5E5] font-medium truncate align-middle" title={p.request_detail}>
                                                    {p.request_detail}
                                                </td>

                                                {/* Purpose (요청목적, 150px, truncate) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-[#86868B] truncate align-middle" title={p.purpose || '-'}>
                                                    {p.purpose || '-'}
                                                </td>

                                                {/* Deliverables (필요 산출물, 150px, truncate) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-[#86868B] font-medium truncate align-middle" title={p.deliverables || '-'}>
                                                    {p.deliverables || '-'}
                                                </td>

                                                {/* Deadline (Format: yy.mm.dd, text-[12px], c3c2b7 color) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-[#c3c2b7] text-center font-mono font-semibold text-[12px] align-middle">
                                                    {p.due_date ? p.due_date.slice(2).replace(/-/g, '.') : '-'}
                                                </td>

                                                {/* Executing Department (Nametag Style, 80px, center-aligned) */}
                                                <td className="px-1.5 py-2 border-r border-[#3c3c3c]/50 text-center align-middle">
                                                    {(() => {
                                                        const deptName = getDeptName(p.assigned_dept_code);
                                                        return deptName && deptName !== '-' ? (
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#27272a] text-[#d4d4d8] border border-[#3f3f46] rounded-[4px] text-[11px] font-medium max-w-full truncate align-middle">
                                                                {deptName}
                                                            </span>
                                                        ) : '-';
                                                    })()}
                                                </td>

                                                {/* Importance (중요도, 80px, center-aligned) */}
                                                <td className="px-3 py-2 border-r border-[#3c3c3c]/50 text-center align-middle">
                                                    <span className={getImpactStyle(p.impact_level)}>
                                                        {p.impact_level || '중간'}
                                                    </span>
                                                </td>

                                                {/* Status (상태, 70px, center-aligned) */}
                                                <td className="px-1.5 py-2 border-r border-[#3c3c3c]/50 text-center select-none align-middle">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-tight align-middle ${getStatusStyle(p.handling_status)}`}>
                                                        {p.handling_status || '미착수'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-2 text-center align-middle">
                                                    {canEdit ? (
                                                        <div className="flex items-center justify-center gap-1.5 select-none opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => openEditModal(p)}
                                                                title="수정하기"
                                                                className="p-1 hover:bg-[#3A3A3C] text-[#2997ff] rounded-md transition-colors cursor-pointer align-middle"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteTargetId(p.id)}
                                                                title="삭제하기"
                                                                className="p-1 hover:bg-[#3A3A3C] text-[#ff453a] rounded-md transition-colors cursor-pointer align-middle"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-white/20 select-none align-middle">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTargetId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200000] transition-all select-none">
                    <div className="bg-[#272726] border border-[#3c3c3c] w-full max-w-[360px] rounded-[20px] p-6 text-center shadow-2xl">
                        <h3 className="text-[17px] font-bold text-white mb-2">단발성 업무 요청 삭제</h3>
                        <p className="text-[13px] text-[#A1A1AA] mb-6 leading-relaxed">정말로 이 요청 정보를 영구 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.</p>
                        <div className="flex gap-2 justify-center">
                            <button 
                                onClick={() => setDeleteTargetId(null)}
                                className="px-4 py-2 bg-[#2c2c2b] border border-[#3c3c3c] text-[#86868B] hover:text-white rounded-[8px] text-[13px] font-bold transition-all cursor-pointer flex-1"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 bg-[#ff453a] hover:bg-[#e03b30] text-white rounded-[8px] text-[13px] font-bold transition-all cursor-pointer flex-1"
                            >
                                삭제확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Create / Edit Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-[100000] transition-all select-none">
                    <div className="bg-[#272726] border border-[#3c3c3c] w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-[#3c3c3c] flex justify-between items-center bg-[#2c2c2b]/30">
                            <div className="text-left">
                                <span className="text-[11px] font-bold text-[#82afb9] bg-[#82afb9]/10 border border-[#82afb9]/25 px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
                                    {modalMode === 'create' ? '새 안건 등록' : '정보 수정'}
                                </span>
                                <h3 className="text-[18px] font-bold text-white mt-1">
                                    {modalMode === 'create' ? '단발성 업무 요청 등록' : '단발성 업무 요청 상세 편집'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-[#333] rounded-full text-[#86868B] hover:text-white transition-colors cursor-pointer"
                            >
                                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Form Content */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 text-left flex flex-col gap-5 select-text">
                            
                            {/* Line 1: 접수일 & 요청기한 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">접수일</label>
                                    <input 
                                        type="date"
                                        value={formRequestDate}
                                        onChange={(e) => setFormRequestDate(e.target.value)}
                                        onClick={(e) => {
                                            try { e.target.showPicker(); } catch (err) {}
                                        }}
                                        onFocus={(e) => {
                                            try { e.target.showPicker(); } catch (err) {}
                                        }}
                                        className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">요청기한 (마감일)</label>
                                    <input 
                                        type="date"
                                        value={formDueDate}
                                        onChange={(e) => setFormDueDate(e.target.value)}
                                        onClick={(e) => {
                                            try { e.target.showPicker(); } catch (err) {}
                                        }}
                                        onFocus={(e) => {
                                            try { e.target.showPicker(); } catch (err) {}
                                        }}
                                        className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Line 2: 요청자 & 프로젝트 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5 relative">
                                    <label className="text-[12px] font-bold text-[#86868B]">요청자 및 소속 부서 <span className="text-[#ff453a]">*</span></label>
                                    <input 
                                        type="text"
                                        required
                                        value={formRequester}
                                        onChange={(e) => setFormRequester(e.target.value)}
                                        onFocus={() => {
                                            setTempRequesterVal(formRequester);
                                            setFormRequester('');
                                            setShowRequesterSuggestions(true);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setShowRequesterSuggestions(false);
                                                setFormRequester(currentVal => {
                                                    const val = currentVal.trim();
                                                    if (!val) {
                                                        return tempRequesterVal;
                                                    }
                                                    if (!val.includes('/')) {
                                                        const match = pilotMembers.find(m => m.staff_name.trim() === val);
                                                        if (match) {
                                                            return `${match.staff_name} / ${mapOrgName(match.staff_name, match.org_name)}`;
                                                        }
                                                    }
                                                    return currentVal;
                                                });
                                            }, 200);
                                        }}
                                        placeholder="예시: 홍길동 / 메리츠증권"
                                        className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                    {showRequesterSuggestions && filteredRequesters.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[100%] mt-1 max-h-40 overflow-y-auto bg-[#2c2c2b] border border-[#4c4c4b] rounded-[8px] z-[99999] shadow-xl timeline-scrollbar">
                                            {filteredRequesters.map((m, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => setFormRequester(`${m.staff_name} / ${mapOrgName(m.staff_name, m.org_name)}`)}
                                                    className="px-3.5 py-2 hover:bg-white/5 cursor-pointer text-left text-[13px] text-white transition-colors"
                                                >
                                                    {m.staff_name} <span className="text-[#86868B]">({mapOrgName(m.staff_name, m.org_name)})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5 select-none">
                                    <label className="text-[12px] font-bold text-[#86868B]">프로젝트</label>
                                    <div className="relative w-full">
                                        <select 
                                            value={formProjectCode}
                                            onChange={(e) => setFormProjectCode(e.target.value)}
                                            className="appearance-none w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                        >
                                            {projects.map(p => (
                                                <option key={p.project_code} value={p.project_code}>{p.project_name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line 3: 업무분류 & 중요도 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5 select-none">
                                    <label className="text-[12px] font-bold text-[#86868B]">업무분류</label>
                                    <div className="relative w-full">
                                        <select 
                                            value={formCategoryName}
                                            onChange={(e) => setFormCategoryName(e.target.value)}
                                            className="appearance-none w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                        >
                                            {CATEGORY_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 select-none">
                                    <label className="text-[12px] font-bold text-[#86868B]">중요도</label>
                                    <div className="relative w-full">
                                        <select 
                                            value={formImpactLevel}
                                            onChange={(e) => setFormImpactLevel(e.target.value)}
                                            className="appearance-none w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                        >
                                            {IMPACT_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line 4: 수행부서 & 상태 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5 select-none">
                                    <label className="text-[12px] font-bold text-[#86868B]">수행부서</label>
                                    <div className="relative w-full">
                                        <select 
                                            value={formAssignedDeptCode}
                                            onChange={(e) => setFormAssignedDeptCode(e.target.value)}
                                            className="appearance-none w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] pl-3.5 pr-10 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors cursor-pointer"
                                        >
                                            {departments.map(d => (
                                                <option key={d.dept_code} value={d.dept_code}>{d.dept_name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 select-none">
                                    <label className="text-[12px] font-bold text-[#86868B]">상태</label>
                                    <div className="relative w-full">
                                        <select 
                                            value={formHandlingStatus}
                                            onChange={(e) => setFormHandlingStatus(e.target.value)}
                                            disabled={!isAdmin}
                                            className={`appearance-none w-full border rounded-[8px] pl-3.5 pr-10 py-2.5 text-[13px] font-bold outline-none transition-colors ${
                                                isAdmin 
                                                ? 'bg-[#2c2c2b] border-[#3c3c3c] text-white focus:border-[#2997ff] cursor-pointer' 
                                                : 'bg-[#222]/30 border-transparent text-[#86868B] cursor-not-allowed'
                                            }`}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {isAdmin && (
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868B] z-10">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Text Area 1: 업무명 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-[#86868B]">업무명 <span className="text-[#ff453a]">*</span></label>
                                <textarea 
                                    required
                                    rows={3}
                                    value={formRequestDetail}
                                    onChange={(e) => setFormRequestDetail(e.target.value)}
                                    placeholder="구체적인 업무 내용을 입력하세요."
                                    className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors resize-none leading-relaxed"
                                />
                            </div>

                            {/* Text Area 2: 요청목적 & 필요산출물 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">요청 목적</label>
                                    <input 
                                        type="text"
                                        value={formPurpose}
                                        onChange={(e) => setFormPurpose(e.target.value)}
                                        placeholder="예시: 대주단 보고 보고서용"
                                        className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">필요 산출물</label>
                                    <input 
                                        type="text"
                                        value={formDeliverables}
                                        onChange={(e) => setFormDeliverables(e.target.value)}
                                        placeholder="예시: 한 장짜리 요약 PDF"
                                        className="bg-[#2c2c2b] border border-[#3c3c3c] rounded-[8px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Save Actions */}
                            <div className="flex gap-2 justify-end mt-4 select-none">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-[#2c2c2b] border border-[#3c3c3c] hover:bg-[#323231] hover:border-[#4c4c4b] text-[#A1A1AA] hover:text-white rounded-[8px] text-[13px] font-bold transition-all cursor-pointer"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2 bg-[#2997ff] hover:bg-[#147ce5] text-white rounded-[8px] text-[13px] font-bold transition-all cursor-pointer shadow-lg shadow-[#2997ff]/10"
                                >
                                    {modalMode === 'create' ? '업무 등록' : '수정 완료'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
