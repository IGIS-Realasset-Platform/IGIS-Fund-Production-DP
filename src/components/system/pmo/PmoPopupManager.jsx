import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// Local Fallbacks to prevent UI crashes if DB queries return empty or fail
const FALLBACK_PROJECTS = [
    { project_code: 'IOTA_SEOUL', project_name: '서울 IOTA' },
    { project_code: 'COMMON', project_name: '공통' },
    { project_code: 'PROJECT_427', project_name: '427 PFV' }
];

const FALLBACK_DEPARTMENTS = [
    { dept_code: 'WS_PM1', dept_name: '사업 PM 1' },
    { dept_code: 'WS_PM2', dept_name: '사업 PM 2' },
    { dept_code: 'WS_LFC', dept_name: '파이낸싱-LFC' },
    { dept_code: 'WS_DSC', dept_name: '개발솔루션-DSC' },
    { dept_code: 'WS_EMC', dept_name: '기업마케팅-EMC' },
    { dept_code: 'WS_SSC', dept_name: '공간솔루션-SSC' },
    { dept_code: 'WS_KAM', dept_name: '펀드운용-KAM' }
];

const CATEGORY_OPTIONS = [
    '공통 PMO', '인허가', '호텔/운영', '시공/원가', '도면/설계', '인테리어/TI',
    '임차/마케팅', 'PF/금융', '구조/법무/세무', '주주/보고', '준공/담보대출', '팝업/단발'
];

const IMPACT_OPTIONS = ['높음', '보통', '낮음'];
const STATUS_OPTIONS = ['접수', '위임', '보류', '반려'];

export default function PmoPopupManager() {
    const { memberInfo } = useAuth();
    const [popups, setPopups] = useState([]);
    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
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
    const [formImpactLevel, setFormImpactLevel] = useState('보통');
    const [formHandlingStatus, setFormHandlingStatus] = useState('접수');
    const [formMemo, setFormMemo] = useState('');

    // Inline edit state
    const [activeStatusSelectId, setActiveStatusSelectId] = useState(null);

    // Delete confirmation state
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Check Roles
    const currentUserEmail = memberInfo?.email || '';
    const isAdmin = memberInfo ? (memberInfo.workspace_code === 'WS_PM' || ['master', 'director'].includes(memberInfo.role_code)) : true;

    // Load Initial Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Popup Requests
            const { data: popupData, error: popupErr } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_popup_requests')
                .select('*')
                .order('request_date', { ascending: false });
            if (popupErr) throw popupErr;
            setPopups(popupData || []);

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
            if (!deptErr && deptData) setDepartments(deptData);
            else setDepartments(FALLBACK_DEPARTMENTS);

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
        const counts = { total: popups.length, received: 0, delegated: 0, pending: 0, rejected: 0 };
        popups.forEach(p => {
            if (p.handling_status === '접수') counts.received++;
            else if (p.handling_status === '위임') counts.delegated++;
            else if (p.handling_status === '보류') counts.pending++;
            else if (p.handling_status === '반려') counts.rejected++;
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
            if (filterStatus !== '전체보기' && p.handling_status !== filterStatus) return false;

            return true;
        });
    }, [popups, searchQuery, filterProject, filterCategory, filterStatus]);

    // Handle Open Create Modal
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedPopup(null);
        setFormRequestDate(new Date().toISOString().slice(0, 10));
        setFormRequester(memberInfo ? `${memberInfo.staff_name || memberInfo.name || ''} / ${memberInfo.org_name || ''}` : '');
        setFormProjectCode('COMMON');
        setFormCategoryName('팝업/단발');
        setFormRequestDetail('');
        setFormPurpose('');
        setFormDeliverables('');
        setFormDueDate('');
        setFormAssignedDeptCode('WS_PM2');
        setFormCoopDeptCodes('');
        setFormImpactLevel('보통');
        setFormHandlingStatus('접수');
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
        setFormImpactLevel(p.impact_level || '보통');
        setFormHandlingStatus(p.handling_status || '접수');
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
            category_name: formCategoryName || null,
            request_detail: formRequestDetail,
            purpose: formPurpose || null,
            deliverables: formDeliverables || null,
            due_date: formDueDate || null,
            assigned_dept_code: formAssignedDeptCode || null,
            coop_dept_codes: formCoopDeptCodes || null,
            impact_level: formImpactLevel || null,
            handling_status: formHandlingStatus || '접수',
            memo: formMemo || null,
            created_by_email: modalMode === 'create' ? currentUserEmail : selectedPopup.created_by_email
        };

        try {
            if (modalMode === 'create') {
                const { data, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_popup_requests')
                    .insert([payload])
                    .select();

                if (error) throw error;
                toast.success("단발업무가 성공적으로 등록되었습니다.");
            } else {
                const { error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_popup_requests')
                    .update(payload)
                    .eq('id', selectedPopup.id);

                if (error) throw error;
                toast.success("정보가 성공적으로 수정되었습니다.");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save popup request:", err);
            toast.error("저장에 실패했습니다. 권한을 확인하세요.");
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
                .from('iota_pmo_popup_requests')
                .update({ handling_status: newStatus })
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
                .from('iota_pmo_popup_requests')
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

    // Helper functions for badge styles
    const getStatusStyle = (status) => {
        switch (status) {
            case '접수': return 'bg-[#0a84ff]/15 text-[#2997ff] border border-[#0a84ff]/30';
            case '위임': return 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30';
            case '보류': return 'bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30';
            case '반려': return 'bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30';
            default: return 'bg-gray-800 text-gray-400 border border-gray-700';
        }
    };

    const getImpactStyle = (level) => {
        switch (level) {
            case '높음': return 'text-[#ff453a] font-bold';
            case '보통': return 'text-[#ffd60a]';
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

    return (
        <div className="w-full flex-1 flex flex-col pt-[30px] pb-[60px] px-8 select-none bg-[#1C1C1E] min-h-screen text-white">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Header Title Section */}
            <div className="w-full flex justify-between items-end mb-[24px]">
                <div className="text-left">
                    <div className="flex items-center gap-[12px] mb-[6px]">
                        <span className="text-[12px] font-bold text-[#82afb9] bg-[#82afb9]/10 border border-[#82afb9]/25 px-2 py-0.5 rounded-[6px]">
                            팝업요청관제
                        </span>
                        <span className="text-[14px] text-[#A1A1AA] font-semibold">
                            단발성 요청은 바로 수행하지 않고 접수/위임/보류/반려 판단
                        </span>
                    </div>
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">단발업무 관리</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData}
                        className="px-4 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3C3C3C] rounded-[10px] text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        🔄 새로고침
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="px-5 py-2 bg-[#2997ff] hover:bg-[#147ce5] rounded-[10px] text-[13px] font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-[#2997ff]/10"
                    >
                        ➕ 단발업무 등록
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard Banner */}
            <div className="grid grid-cols-5 gap-3 mb-[24px]">
                <div 
                    onClick={() => setFilterStatus('전체보기')}
                    className={`p-4 rounded-[16px] border transition-all cursor-pointer text-left ${filterStatus === '전체보기' ? 'bg-[#2997ff]/10 border-[#2997ff] shadow-md shadow-[#2997ff]/5' : 'bg-[#2C2C2E] border-[#3C3C3C] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#86868B] block mb-1">전체 요청</span>
                    <span className="text-[24px] font-bold text-white">{metrics.total} <span className="text-[13px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('접수')}
                    className={`p-4 rounded-[16px] border transition-all cursor-pointer text-left ${filterStatus === '접수' ? 'bg-[#0a84ff]/10 border-[#0a84ff] shadow-md shadow-[#0a84ff]/5' : 'bg-[#2C2C2E] border-[#3C3C3C] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#2997ff] block mb-1">접수 중</span>
                    <span className="text-[24px] font-bold text-[#2997ff]">{metrics.received} <span className="text-[13px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('위임')}
                    className={`p-4 rounded-[16px] border transition-all cursor-pointer text-left ${filterStatus === '위임' ? 'bg-[#30d158]/10 border-[#30d158] shadow-md shadow-[#30d158]/5' : 'bg-[#2C2C2E] border-[#3C3C3C] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#30d158] block mb-1">위임됨</span>
                    <span className="text-[24px] font-bold text-[#30d158]">{metrics.delegated} <span className="text-[13px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('보류')}
                    className={`p-4 rounded-[16px] border transition-all cursor-pointer text-left ${filterStatus === '보류' ? 'bg-[#ffd60a]/10 border-[#ffd60a] shadow-md shadow-[#ffd60a]/5' : 'bg-[#2C2C2E] border-[#3C3C3C] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#ffd60a] block mb-1">보류 중</span>
                    <span className="text-[24px] font-bold text-[#ffd60a]">{metrics.pending} <span className="text-[13px] font-medium text-[#86868B]">건</span></span>
                </div>
                <div 
                    onClick={() => setFilterStatus('반려')}
                    className={`p-4 rounded-[16px] border transition-all cursor-pointer text-left ${filterStatus === '반려' ? 'bg-[#ff453a]/10 border-[#ff453a] shadow-md shadow-[#ff453a]/5' : 'bg-[#2C2C2E] border-[#3C3C3C] hover:border-[#555]'}`}
                >
                    <span className="text-[12px] font-bold text-[#ff453a] block mb-1">반려됨</span>
                    <span className="text-[24px] font-bold text-[#ff453a]">{metrics.rejected} <span className="text-[13px] font-medium text-[#86868B]">건</span></span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#2C2C2E] border border-[#3C3C3C] rounded-[16px] p-4 mb-[16px] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                    {/* Search query */}
                    <div className="relative w-[280px] shrink-0">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="요청자, 요청업무, 목적 검색..."
                            className="w-full pl-9 pr-4 py-2 bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] text-[13px] font-medium text-white placeholder-[#86868B] focus:border-[#2997ff] focus:outline-none transition-colors"
                        />
                        <svg className="w-4 h-4 text-[#86868B] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Project */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#86868B] font-bold">프로젝트:</span>
                        <select 
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3 py-2 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                        >
                            <option value="전체보기">전체보기</option>
                            {projects.map(p => (
                                <option key={p.project_code} value={p.project_code}>{p.project_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Category */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#86868B] font-bold">카테고리:</span>
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3 py-2 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                        >
                            <option value="전체보기">전체보기</option>
                            {CATEGORY_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#86868B] font-bold">처리방침:</span>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3 py-2 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                        >
                            <option value="전체보기">전체보기</option>
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-[13px] text-[#86868B] font-bold">
                    검색 결과: <span className="text-white">{filteredPopups.length}</span> 건
                </div>
            </div>

            {/* Spreadsheet Grid Table */}
            {loading ? (
                <div className="w-full h-[360px] bg-[#2C2C2E] border border-[#3C3C3C] rounded-[24px] flex items-center justify-center">
                    <span className="text-[#86868B] text-[15px] animate-pulse">요청 데이터를 연동하고 있습니다...</span>
                </div>
            ) : (
                <div className="w-full border border-[#3C3C3C] bg-[#272726] rounded-[16px] overflow-hidden shadow-2xl flex flex-col">
                    <div className="overflow-x-auto w-full max-w-full">
                        <table className="w-full text-left table-fixed border-collapse min-w-[1930px] select-text">
                            <thead>
                                <tr className="bg-[#1A365D] border-b border-[#3C3C3C]">
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] text-center w-[100px]">접수일</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[140px]">요청자/부서</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[120px]">프로젝트</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[130px]">카테고리</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[250px]">요청업무</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[160px]">요청목적</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[160px]">필요 산출물</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] text-center w-[100px]">요청기한</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[130px]">원 수행부서</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[130px]">협업부서</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] text-center w-[110px]">정규업무 영향</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] text-center w-[110px]">처리방침</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white border-r border-[#3C3C3C] w-[200px]">메모</th>
                                    <th className="px-3 py-3 text-[13px] font-bold text-white text-center w-[90px]">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3C3C3C] bg-[#1E1E1E]">
                                {filteredPopups.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="py-20 text-center text-[#86868B] text-[14px]">
                                            조건에 만족하는 단발 업무 요청 정보가 없습니다.
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
                                                className={`hover:bg-[#2C2C2E] transition-colors group text-[13px] ${
                                                    index % 2 === 1 ? 'bg-[#222224]' : ''
                                                }`}
                                            >
                                                {/* Date */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#A1A1AA] text-center font-mono font-medium">
                                                    {p.request_date || '-'}
                                                </td>

                                                {/* Requester */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] font-bold text-[#E5E5E5] truncate" title={p.requester}>
                                                    {p.requester}
                                                </td>

                                                {/* Project */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] font-semibold text-[#bdbba7] truncate" title={getProjectName(p.project_code)}>
                                                    {getProjectName(p.project_code)}
                                                </td>

                                                {/* Category */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-white/80 font-medium truncate" title={p.category_name}>
                                                    {p.category_name || '-'}
                                                </td>

                                                {/* Task Details */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-white font-medium break-words leading-relaxed whitespace-pre-wrap">
                                                    {p.request_detail}
                                                </td>

                                                {/* Purpose */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#A1A1AA] break-words whitespace-pre-wrap leading-relaxed">
                                                    {p.purpose || '-'}
                                                </td>

                                                {/* Deliverables */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#86868B] font-medium break-words whitespace-pre-wrap leading-relaxed">
                                                    {p.deliverables || '-'}
                                                </td>

                                                {/* Deadline */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#fbbf24] text-center font-mono font-semibold">
                                                    {p.due_date || '-'}
                                                </td>

                                                {/* Original Executing Department */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] font-semibold text-white/80 truncate" title={getDeptName(p.assigned_dept_code)}>
                                                    {getDeptName(p.assigned_dept_code)}
                                                </td>

                                                {/* Collaborating Department */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#A1A1AA] truncate" title={p.coop_dept_codes}>
                                                    {p.coop_dept_codes || '-'}
                                                </td>

                                                {/* Impact on Regular Tasks */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-center">
                                                    <span className={getImpactStyle(p.impact_level)}>
                                                        {p.impact_level || '보통'}
                                                    </span>
                                                </td>

                                                {/* Processing Policy (Handling Status) */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-center relative select-none">
                                                    {activeStatusSelectId === p.id && isAdmin ? (
                                                        <div className="absolute inset-0 flex items-center justify-center p-1 bg-[#1E1E1E] z-10">
                                                            <select
                                                                value={p.handling_status}
                                                                onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                                                onBlur={() => setActiveStatusSelectId(null)}
                                                                autoFocus
                                                                className="w-full bg-[#2C2C2E] text-white border border-[#555] rounded px-1.5 py-1 text-[12px] font-bold outline-none"
                                                            >
                                                                {STATUS_OPTIONS.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <span 
                                                            onClick={() => isAdmin && setActiveStatusSelectId(p.id)}
                                                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-tight ${
                                                                isAdmin ? 'cursor-pointer hover:brightness-125' : ''
                                                            } ${getStatusStyle(p.handling_status)}`}
                                                        >
                                                            {p.handling_status} {isAdmin && '▾'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Memo */}
                                                <td className="px-3 py-3 border-r border-[#3C3C3C] text-[#86868B] italic break-words whitespace-pre-wrap leading-relaxed">
                                                    {p.memo || '-'}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3 text-center">
                                                    {canEdit ? (
                                                        <div className="flex items-center justify-center gap-1.5 select-none opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => openEditModal(p)}
                                                                title="수정하기"
                                                                className="p-1 hover:bg-[#3A3A3C] text-[#2997ff] rounded-md transition-colors cursor-pointer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteTargetId(p.id)}
                                                                title="삭제하기"
                                                                className="p-1 hover:bg-[#3A3A3C] text-[#ff453a] rounded-md transition-colors cursor-pointer"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-white/20 select-none">-</span>
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
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 transition-all select-none">
                    <div className="bg-[#2C2C2E] border border-[#3C3C3C] w-full max-w-[340px] rounded-[20px] p-6 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-[#ff453a]/15 text-[#ff453a] flex items-center justify-center mx-auto mb-4 border border-[#ff453a]/25">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-[17px] font-bold text-white mb-2">단발업무 요청 삭제</h3>
                        <p className="text-[13px] text-[#A1A1AA] mb-6 leading-relaxed">정말로 이 요청 정보를 영구 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.</p>
                        <div className="flex gap-2 justify-center">
                            <button 
                                onClick={() => setDeleteTargetId(null)}
                                className="px-4 py-2 bg-[#1C1C1E] border border-[#3C3C3C] text-[#86868B] hover:text-white rounded-[10px] text-[13px] font-bold transition-all cursor-pointer flex-1"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="px-4 py-2 bg-[#ff453a] hover:bg-[#e03b30] text-white rounded-[10px] text-[13px] font-bold transition-all cursor-pointer flex-1"
                            >
                                삭제확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Create / Edit Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-40 transition-all select-none">
                    <div className="bg-[#2C2C2E] border border-[#3C3C3C] w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-[#3C3C3C] flex justify-between items-center bg-[#1C1C1E]">
                            <div className="text-left">
                                <span className="text-[11px] font-bold text-[#82afb9] bg-[#82afb9]/10 border border-[#82afb9]/25 px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
                                    {modalMode === 'create' ? '새 안건 등록' : '정보 수정'}
                                </span>
                                <h3 className="text-[18px] font-bold text-white mt-1">
                                    {modalMode === 'create' ? '단발 업무 요청 등록' : '단발 업무 요청 상세 편집'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-[#2C2C2E] rounded-full text-[#86868B] hover:text-white transition-colors cursor-pointer"
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
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">요청기한 (마감일)</label>
                                    <input 
                                        type="date"
                                        value={formDueDate}
                                        onChange={(e) => setFormDueDate(e.target.value)}
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Line 2: 요청자 & 프로젝트 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">요청자 및 소속 부서 <span className="text-[#ff453a]">*</span></label>
                                    <input 
                                        type="text"
                                        required
                                        value={formRequester}
                                        onChange={(e) => setFormRequester(e.target.value)}
                                        placeholder="예시: 홍길동 / 메리츠증권"
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">프로젝트</label>
                                    <select 
                                        value={formProjectCode}
                                        onChange={(e) => setFormProjectCode(e.target.value)}
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    >
                                        {projects.map(p => (
                                            <option key={p.project_code} value={p.project_code}>{p.project_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Line 3: 카테고리 & 정규업무 영향도 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">카테고리</label>
                                    <select 
                                        value={formCategoryName}
                                        onChange={(e) => setFormCategoryName(e.target.value)}
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    >
                                        {CATEGORY_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">정규업무 영향</label>
                                    <select 
                                        value={formImpactLevel}
                                        onChange={(e) => setFormImpactLevel(e.target.value)}
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    >
                                        {IMPACT_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Line 4: 원 수행부서 & 처리상태 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">원 수행부서</label>
                                    <select 
                                        value={formAssignedDeptCode}
                                        onChange={(e) => setFormAssignedDeptCode(e.target.value)}
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold text-white focus:border-[#2997ff] focus:outline-none transition-colors"
                                    >
                                        {departments.map(d => (
                                            <option key={d.dept_code} value={d.dept_code}>{d.dept_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">처리방침 (상태)</label>
                                    <select 
                                        value={formHandlingStatus}
                                        onChange={(e) => setFormHandlingStatus(e.target.value)}
                                        disabled={!isAdmin}
                                        className={`border rounded-[10px] px-3.5 py-2.5 text-[13px] font-bold outline-none transition-colors ${
                                            isAdmin 
                                            ? 'bg-[#1C1C1E] border-[#3C3C3C] text-white focus:border-[#2997ff]' 
                                            : 'bg-[#222] border-transparent text-[#86868B] cursor-not-allowed'
                                        }`}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Text Area 1: 요청업무 상세 */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-[#86868B]">요청업무 상세 <span className="text-[#ff453a]">*</span></label>
                                <textarea 
                                    required
                                    rows={3}
                                    value={formRequestDetail}
                                    onChange={(e) => setFormRequestDetail(e.target.value)}
                                    placeholder="구체적인 요청 업무 내용을 입력하세요."
                                    className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors resize-none leading-relaxed"
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
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">필요 산출물</label>
                                    <input 
                                        type="text"
                                        value={formDeliverables}
                                        onChange={(e) => setFormDeliverables(e.target.value)}
                                        placeholder="예시: 한 장짜리 요약 PDF"
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Text Area 3: 협업부서 & 메모 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">협업 부서</label>
                                    <input 
                                        type="text"
                                        value={formCoopDeptCodes}
                                        onChange={(e) => setFormCoopDeptCodes(e.target.value)}
                                        placeholder="예시: 사업관리2파트, 개발팀"
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#86868B]">메모</label>
                                    <input 
                                        type="text"
                                        value={formMemo}
                                        onChange={(e) => setFormMemo(e.target.value)}
                                        placeholder="특이사항 및 제언 작성"
                                        className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-gray-600 focus:border-[#2997ff] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Save Actions */}
                            <div className="flex gap-2 justify-end mt-4 select-none">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 bg-[#2C2C2E] border border-[#3C3C3C] text-[#86868B] hover:text-white rounded-[10px] text-[13px] font-bold transition-all cursor-pointer"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#2997ff] hover:bg-[#147ce5] text-white rounded-[10px] text-[13px] font-bold transition-all cursor-pointer shadow-lg shadow-[#2997ff]/10"
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
