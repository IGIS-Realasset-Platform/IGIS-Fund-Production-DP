import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

// --- Default Mock Data based on Excel template ---
const defaultTenants = [
    { 
        id: 'tenant-novartis', 
        company_name: '한국노바티스', 
        company_name_en: 'Novartis Korea', 
        industry_category: '바이오·헬스케어', 
        employee_count: 450, 
        major_services: '전문 의약품, 면역항암제, 안과 치료제', 
        current_building: '3IFC', 
        rented_area: 1200, 
        rented_floor: '48F, 49F', 
        lease_start_date: '2022-09-01', 
        lease_end_date: '2027-08-31', 
        annual_rent: 45.2, 
        tr_manager: '김아름 팀장', 
        pain_points: '부서 분사로 인한 유휴 공간 발생, 회의 공간 부족 및 임대료 절감 니즈', 
        space_prospect: '축소', 
        other_requests: '1개 층 전대(Sublease) 검토 허용 및 임대 조건 조정 협의 희망' 
    },
    { 
        id: 'tenant-pfizer', 
        company_name: '화이자 코리아', 
        company_name_en: 'Pfizer Korea', 
        industry_category: '바이오·헬스케어', 
        employee_count: 380, 
        major_services: '백신, 백혈병 치료제, 바이오시밀러', 
        current_building: '스테이트타워 남산', 
        rented_area: 2100, 
        rented_floor: '5F, 6F, 7F', 
        lease_start_date: '2021-05-01', 
        lease_end_date: '2026-04-30', 
        annual_rent: 62.5, 
        tr_manager: '강동원 팀장', 
        pain_points: 'BOH(서버룸/창고) 공간 부족, HVAC(냉난방) 가동 시간 연장 필요', 
        space_prospect: '유지', 
        other_requests: '재계약 협의 시 전용 창고 공간 추가 확보 및 주차장 추가 배정 요구' 
    },
    { 
        id: 'tenant-astrazeneca', 
        company_name: '아스트라제네카 코리아', 
        company_name_en: 'AstraZeneca Korea', 
        industry_category: '바이오·헬스케어', 
        employee_count: 510, 
        major_services: '항암제, 심혈관/대사 질환 치료제', 
        current_building: '아셈타워', 
        rented_area: 2500, 
        rented_floor: '21F, 22F', 
        lease_start_date: '2023-01-01', 
        lease_end_date: '2028-12-31', 
        annual_rent: 85.0, 
        tr_manager: '박서준 부장', 
        pain_points: 'R&D 실험실 확장 니즈 및 연구 공간 설비(배관/환기) 보완 요청', 
        space_prospect: '증평', 
        other_requests: '인접 공실 구역 추가 임차(500평 수준) 및 R&D 설비 구축 지원 협의' 
    }
];

const defaultContacts = [
    { id: 'contact-1', tenant_id: 'tenant-novartis', name: '홍길동', position: '전무', role_category: '결정권자', phone: '010-1234-5678', engagement_score: 4, last_contact_date: '2026-06-03', memo: '계약 갱신에 긍정적이나, 면적 축소 조건 조율 필요.' },
    { id: 'contact-2', tenant_id: 'tenant-novartis', name: '이재무', position: '상무', role_category: 'CFO', phone: '010-9876-5432', engagement_score: 3, last_contact_date: '2026-06-05', memo: '임대료 평당 단가 인하 및 렌트프리 추가 제공 여부 타진 중.' },
    { id: 'contact-3', tenant_id: 'tenant-pfizer', name: '김시설', position: '부장', role_category: '총무/시설', phone: '010-5555-5555', engagement_score: 5, last_contact_date: '2026-05-28', memo: '기계실 소음 불만으로 방음 자재 보완 완료 피드백 전달.' }
];

const defaultSpaceNeeds = [
    { id: 'need-1', tenant_id: 'tenant-novartis', fixed_desks: 250, hot_desks: 100, meeting_rooms: 12, lounge_yn: 'Y', storage_count: 2, parking_count: 15 },
    { id: 'need-2', tenant_id: 'tenant-pfizer', fixed_desks: 300, hot_desks: 50, meeting_rooms: 18, lounge_yn: 'Y', storage_count: 4, parking_count: 20 },
    { id: 'need-3', tenant_id: 'tenant-astrazeneca', fixed_desks: 180, hot_desks: 120, meeting_rooms: 15, lounge_yn: 'Y', storage_count: 5, parking_count: 25 }
];

const defaultSiOpportunities = [
    { id: 'opp-1', tenant_id: 'tenant-novartis', collab_type: '공동 펀드', summary: '라이프사이언스 공동 운용 펀드 조성', collab_plan: '테넌트의 R&D 인프라와 운용사의 자본을 결합해 바이오 클러스터 대상 블라인드 펀드 공동 GP 참여 타진.', status: '제안중', pm_manager: '김민지 리더', created_at: '2026-05-10T00:00:00Z', updated_at: '2026-06-05T00:00:00Z' },
    { id: 'opp-2', tenant_id: 'tenant-astrazeneca', collab_type: '시설 연계 투자', summary: 'R&D 시설 투자 유치 및 임차 연계', collab_plan: '아셈타워 인접 구획 증평 시 특수 실험용 설비 구축비 일부를 운용사 펀드에서 선투자 후, 임대료 요율 조정을 통해 회수하는 구조 검토.', status: '대기', pm_manager: '전기영 매니저', created_at: '2026-05-15T00:00:00Z', updated_at: '2026-05-15T00:00:00Z' }
];

export default function StakeTenant({ defaultTab = 'list' }) {
    const { memberInfo } = useAuth();

    const navigateTo = (path) => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', base + (path.startsWith('/') ? path : '/' + path));
        window.dispatchEvent(new Event('popstate'));
    };
    
    // --- State Management ---
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [tenants, setTenants] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [spaceNeeds, setSpaceNeeds] = useState([]);
    const [siOpportunities, setSiOpportunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Search and Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [buildingFilter, setBuildingFilter] = useState('ALL');
    const [prospectFilter, setProspectFilter] = useState('ALL');

    // Selected Tenant for Detail Drawer
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

    // Inline additions in Drawer
    const [newContact, setNewContact] = useState({ name: '', position: '', role_category: '결정권자', phone: '', engagement_score: 3, last_contact_date: '', memo: '' });
    const [newSi, setNewSi] = useState({ collab_type: '공동 펀드', summary: '', collab_plan: '', status: '대기', pm_manager: '' });

    // Registration Form State
    const [regForm, setRegForm] = useState({
        company_name: '',
        company_name_en: '',
        industry_category: '바이오·헬스케어',
        employee_count: 100,
        major_services: '',
        current_building: '',
        rented_area: 100,
        rented_floor: '',
        lease_start_date: '',
        lease_end_date: '',
        annual_rent: 10,
        tr_manager: '',
        pain_points: '',
        space_prospect: '유지',
        other_requests: '',
        // Needs basic info
        fixed_desks: 0,
        hot_desks: 0,
        meeting_rooms: 0,
        lounge_yn: 'N',
        storage_count: 0,
        parking_count: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Initial Load ---
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Attempt Supabase Fetch
            const { data: fetchTenants, error: tErr } = await supabase.from('iota_tenants').select('*');
            const { data: fetchContacts, error: cErr } = await supabase.from('iota_tenant_contacts').select('*');
            const { data: fetchSpace, error: sErr } = await supabase.from('iota_tenant_space_needs').select('*');
            const { data: fetchSi, error: siErr } = await supabase.from('iota_tenant_si_opportunities').select('*');

            if (tErr || cErr || sErr || siErr) {
                // If any error exists (e.g. table not created), trigger local fallback
                throw new Error("Tables might not exist in Supabase, using localStorage fallback.");
            }

            setTenants(fetchTenants || []);
            setContacts(fetchContacts || []);
            setSpaceNeeds(fetchSpace || []);
            setSiOpportunities(fetchSi || []);
        } catch (e) {
            console.warn(e.message);
            // Local Storage Fallback
            let localTenants = localStorage.getItem('iota_tenants_mvp');
            let localContacts = localStorage.getItem('iota_contacts_mvp');
            let localSpace = localStorage.getItem('iota_space_needs_mvp');
            let localSi = localStorage.getItem('iota_si_opp_mvp');

            if (!localTenants) {
                localStorage.setItem('iota_tenants_mvp', JSON.stringify(defaultTenants));
                localStorage.setItem('iota_contacts_mvp', JSON.stringify(defaultContacts));
                localStorage.setItem('iota_space_needs_mvp', JSON.stringify(defaultSpaceNeeds));
                localStorage.setItem('iota_si_opp_mvp', JSON.stringify(defaultSiOpportunities));
                
                localTenants = JSON.stringify(defaultTenants);
                localContacts = JSON.stringify(defaultContacts);
                localSpace = JSON.stringify(defaultSpaceNeeds);
                localSi = JSON.stringify(defaultSiOpportunities);
            }

            setTenants(JSON.parse(localTenants));
            setContacts(JSON.parse(localContacts));
            setSpaceNeeds(JSON.parse(localSpace));
            setSiOpportunities(JSON.parse(localSi));
        } finally {
            setIsLoading(false);
        }
    };

    // --- Save Helpers ---
    const saveToDBOrLocal = async (updatedTenants, updatedContacts, updatedSpace, updatedSi) => {
        try {
            // Write to LocalStorage anyway
            localStorage.setItem('iota_tenants_mvp', JSON.stringify(updatedTenants));
            localStorage.setItem('iota_contacts_mvp', JSON.stringify(updatedContacts));
            localStorage.setItem('iota_space_needs_mvp', JSON.stringify(updatedSpace));
            localStorage.setItem('iota_si_opp_mvp', JSON.stringify(updatedSi));
            
            setTenants(updatedTenants);
            setContacts(updatedContacts);
            setSpaceNeeds(updatedSpace);
            setSiOpportunities(updatedSi);
        } catch (e) {
            console.error("Failed to sync local data", e);
        }
    };

    // --- Actions ---

    // 1. Register a New Tenant
    const handleRegisterTenant = async (e) => {
        e.preventDefault();
        if (!regForm.company_name) return alert('임차사명을 입력해주세요.');
        setIsSubmitting(true);

        const tenantId = `tenant_${Date.now()}`;
        const newTenantObj = {
            id: tenantId,
            company_name: regForm.company_name,
            company_name_en: regForm.company_name_en || '',
            industry_category: regForm.industry_category,
            employee_count: Number(regForm.employee_count) || 0,
            major_services: regForm.major_services || '',
            current_building: regForm.current_building || '',
            rented_area: Number(regForm.rented_area) || 0,
            rented_floor: regForm.rented_floor || '',
            lease_start_date: regForm.lease_start_date || null,
            lease_end_date: regForm.lease_end_date || null,
            annual_rent: Number(regForm.annual_rent) || 0,
            tr_manager: regForm.tr_manager || memberInfo?.staff_name || '미정',
            pain_points: regForm.pain_points || '',
            space_prospect: regForm.space_prospect,
            other_requests: regForm.other_requests || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const newSpaceObj = {
            id: `space_${Date.now()}`,
            tenant_id: tenantId,
            fixed_desks: Number(regForm.fixed_desks) || 0,
            hot_desks: Number(regForm.hot_desks) || 0,
            meeting_rooms: Number(regForm.meeting_rooms) || 0,
            lounge_yn: regForm.lounge_yn,
            storage_count: Number(regForm.storage_count) || 0,
            parking_count: Number(regForm.parking_count) || 0,
            created_at: new Date().toISOString()
        };

        // DB Insert Attempt
        try {
            await supabase.from('iota_tenants').insert([newTenantObj]);
            await supabase.from('iota_tenant_space_needs').insert([newSpaceObj]);
        } catch (dbErr) {
            console.warn("DB insert bypassed. Synchronized locally.", dbErr.message);
        }

        const nextTenants = [...tenants, newTenantObj];
        const nextSpace = [...spaceNeeds, newSpaceObj];
        await saveToDBOrLocal(nextTenants, contacts, nextSpace, siOpportunities);

        alert('신규 임차사가 성공적으로 등록되었습니다.');
        setIsSubmitting(false);
        
        // Reset Form
        setRegForm({
            company_name: '', company_name_en: '', industry_category: '바이오·헬스케어', employee_count: 100,
            major_services: '', current_building: '', rented_area: 100, rented_floor: '',
            lease_start_date: '', lease_end_date: '', annual_rent: 10, tr_manager: '',
            pain_points: '', space_prospect: '유지', other_requests: '',
            fixed_desks: 0, hot_desks: 0, meeting_rooms: 0, lounge_yn: 'N', storage_count: 0, parking_count: 0
        });
        
        navigateTo('platform/iotaseoul/stakeholder/tenant/list');
    };

    // 2. Add Contact to Selected Tenant
    const handleAddContact = async () => {
        if (!newContact.name) return alert('이름을 입력해주세요.');
        const contactObj = {
            id: `contact_${Date.now()}`,
            tenant_id: selectedTenant.id,
            ...newContact
        };

        try {
            await supabase.from('iota_tenant_contacts').insert([contactObj]);
        } catch (e) {
            console.warn("Bypassed DB contact insert");
        }

        const nextContacts = [...contacts, contactObj];
        await saveToDBOrLocal(tenants, nextContacts, spaceNeeds, siOpportunities);
        setNewContact({ name: '', position: '', role_category: '결정권자', phone: '', engagement_score: 3, last_contact_date: '', memo: '' });
    };

    // 3. Delete Contact
    const handleDeleteContact = async (contactId) => {
        if (!window.confirm('이 담당자 정보를 연락망에서 삭제하시겠습니까?')) return;
        try {
            await supabase.from('iota_tenant_contacts').delete().eq('id', contactId);
        } catch (e) {
            console.warn("Bypassed DB contact delete");
        }
        const nextContacts = contacts.filter(c => c.id !== contactId);
        await saveToDBOrLocal(tenants, nextContacts, spaceNeeds, siOpportunities);
    };

    // 4. Add SI Collab Opportunity
    const handleAddSiOpportunity = async () => {
        if (!newSi.summary) return alert('협업 내용 요약을 입력해주세요.');
        const oppObj = {
            id: `opp_${Date.now()}`,
            tenant_id: selectedTenant ? selectedTenant.id : null,
            ...newSi,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            await supabase.from('iota_tenant_si_opportunities').insert([oppObj]);
        } catch (e) {
            console.warn("Bypassed DB SI opportunity insert");
        }

        const nextSi = [...siOpportunities, oppObj];
        await saveToDBOrLocal(tenants, contacts, spaceNeeds, nextSi);
        setNewSi({ collab_type: '공동 펀드', summary: '', collab_plan: '', status: '대기', pm_manager: '' });
    };

    // 5. Update SI Status (e.g. from table list)
    const handleUpdateSiStatus = async (oppId, newStatus) => {
        const nextSi = siOpportunities.map(opp => {
            if (opp.id === oppId) {
                return { ...opp, status: newStatus, updated_at: new Date().toISOString() };
            }
            return opp;
        });

        try {
            await supabase.from('iota_tenant_si_opportunities').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', oppId);
        } catch (e) {
            console.warn("Bypassed DB SI status update");
        }

        await saveToDBOrLocal(tenants, contacts, spaceNeeds, nextSi);
    };

    // 6. Delete Tenant Entirely
    const handleDeleteTenant = async (tenantId) => {
        if (!window.confirm('이 임차사를 완전히 삭제하시겠습니까? 관련 의사결정자 및 공간 데이터도 모두 삭제됩니다.')) return;
        try {
            await supabase.from('iota_tenants').delete().eq('id', tenantId);
        } catch (e) {
            console.warn("Bypassed DB tenant delete");
        }

        const nextTenants = tenants.filter(t => t.id !== tenantId);
        const nextContacts = contacts.filter(c => c.tenant_id !== tenantId);
        const nextSpace = spaceNeeds.filter(s => s.tenant_id !== tenantId);
        const nextSi = siOpportunities.filter(o => o.tenant_id !== tenantId);

        await saveToDBOrLocal(nextTenants, nextContacts, nextSpace, nextSi);
        setIsDetailDrawerOpen(false);
        setSelectedTenant(null);
    };

    // --- Queries / Filters ---
    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (t.company_name_en && t.company_name_en.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesBuilding = buildingFilter === 'ALL' || t.current_building === buildingFilter;
        const matchesProspect = prospectFilter === 'ALL' || t.space_prospect === prospectFilter;
        return matchesSearch && matchesBuilding && matchesProspect;
    });

    const uniqueBuildings = [...new Set(tenants.map(t => t.current_building).filter(Boolean))];

    return (
        <div className="w-full flex-1 flex flex-col pt-[40px] pb-[160px] max-w-[1200px] mx-auto font-sans text-white relative">
            
            {/* Header Area */}
            <div className="w-full mb-[40px] flex justify-between items-end border-b border-[#2C2C2E] pb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-white tracking-tight leading-none mb-3">잠재 임차사 및 SI 협업</h1>
                    <p className="text-[15px] text-[#86868B]">기업마케팅 TR 및 PM 연계용 잠재 임차사(테넌트) 공간 진단 및 SI 투자 협업 관리보드</p>
                </div>
                
                {/* Tabs Selector */}
                <div className="flex bg-[#272726] border border-[#3c3c3c] rounded-[10px] overflow-hidden p-[3px]">
                    <button 
                        onClick={() => { navigateTo('platform/iotaseoul/stakeholder/tenant/list'); setIsDetailDrawerOpen(false); }} 
                        className={`px-[18px] py-[6px] text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer ${activeTab === 'list' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5]'}`}
                    >
                        임차사 명부
                    </button>
                    <button 
                        onClick={() => { navigateTo('platform/iotaseoul/stakeholder/tenant/si'); setIsDetailDrawerOpen(false); }} 
                        className={`px-[18px] py-[6px] text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer ${activeTab === 'si' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5]'}`}
                    >
                        SI 협업 파이프라인
                    </button>
                    <button 
                        onClick={() => { navigateTo('platform/iotaseoul/stakeholder/tenant/register'); setIsDetailDrawerOpen(false); }} 
                        className={`px-[18px] py-[6px] text-[13px] font-bold rounded-[8px] transition-colors cursor-pointer ${activeTab === 'register' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5]'}`}
                    >
                        + 신규 임차사 등록
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-24 text-[#86868B] flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>테넌트 DB를 로드하는 중...</span>
                </div>
            ) : (
                <div className="w-full flex-1 flex gap-6">
                    
                    {/* Tab 1: Tenant List Directory */}
                    {activeTab === 'list' && (
                        <div className="flex-1 flex flex-col gap-5">
                            
                            {/* Filters Bar */}
                            <div className="w-full flex gap-4 items-center bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px]">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="기업명 검색 (국문/영문)..."
                                        className="w-full bg-[#1A1A1A] border border-[#444] rounded-[10px] pl-10 pr-4 py-2 text-[14px] text-white outline-none focus:border-[#888] placeholder:text-[#86868B]"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    </div>
                                </div>
                                <div className="w-[180px]">
                                    <select 
                                        value={buildingFilter}
                                        onChange={e => setBuildingFilter(e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-[#444] rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-[#888] cursor-pointer"
                                    >
                                        <option value="ALL">전체 빌딩 보기</option>
                                        {uniqueBuildings.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="w-[180px]">
                                    <select 
                                        value={prospectFilter}
                                        onChange={e => setProspectFilter(e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-[#444] rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-[#888] cursor-pointer"
                                    >
                                        <option value="ALL">전체 공간전망</option>
                                        <option value="증평">증평</option>
                                        <option value="유지">유지</option>
                                        <option value="축소">축소</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grid List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTenants.length > 0 ? (
                                    filteredTenants.map(t => {
                                        const space = spaceNeeds.find(s => s.tenant_id === t.id) || {};
                                        const tContacts = contacts.filter(c => c.tenant_id === t.id);
                                        const prospectColors = {
                                            '증평': 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30',
                                            '축소': 'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30',
                                            '유지': 'bg-[#3c3c3c]/50 text-[#A1A1AA] border-[#444]'
                                        };

                                        return (
                                            <div 
                                                key={t.id}
                                                onClick={() => {
                                                    setSelectedTenant(t);
                                                    setIsDetailDrawerOpen(true);
                                                }}
                                                className={`p-5 rounded-[20px] border transition-all cursor-pointer flex flex-col justify-between min-h-[200px] ${selectedTenant?.id === t.id ? 'bg-[#333] border-[#2997ff]' : 'bg-[#1E1E1E] border-[#333] hover:bg-[#2A2A2A]'}`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className="text-[11px] font-bold text-[#86868B] block mb-1 uppercase tracking-wide">{t.industry_category}</span>
                                                            <h3 className="text-[18px] font-bold text-white leading-tight">{t.company_name}</h3>
                                                            {t.company_name_en && <span className="text-[12px] text-[#86868B] font-mono block">{t.company_name_en}</span>}
                                                        </div>
                                                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full border ${prospectColors[t.space_prospect] || 'bg-[#333]'}`}>
                                                            {t.space_prospect}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Contract Meta info */}
                                                    <div className="flex flex-col gap-1.5 border-t border-[#333] pt-3 mt-3">
                                                        <div className="flex justify-between text-[13px]">
                                                            <span className="text-[#86868B]">현재 오피스</span>
                                                            <span className="text-white font-medium">{t.current_building} {t.rented_floor && `(${t.rented_floor})`}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[13px]">
                                                            <span className="text-[#86868B]">임차 면적</span>
                                                            <span className="text-white font-medium">{t.rented_area.toLocaleString()} 평</span>
                                                        </div>
                                                        <div className="flex justify-between text-[13px]">
                                                            <span className="text-[#86868B]">계약 만료일</span>
                                                            <span className="text-white font-mono">{t.lease_end_date || '미정'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#333]/50 text-[12px] text-[#86868B]">
                                                    <span>담당 TR: {t.tr_manager}</span>
                                                    <span>관계망: {tContacts.length}명</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-16 text-center text-[#86868B] bg-[#1A1A1A] rounded-[24px] border border-[#333]">
                                        검색 필터 조건에 부합하는 임차사가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: SI Opportunities Pipeline */}
                    {activeTab === 'si' && (
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden shadow-xl">
                                <div className="p-5 border-b border-[#333] flex justify-between items-center bg-[#222]">
                                    <h2 className="text-[17px] font-bold text-white">전략적 투자 (SI) 및 협업 연계 관리대장</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#222] border-b border-[#333] text-[#86868B] text-[12px] font-bold">
                                                <th className="p-4 w-[160px]">협업 유형</th>
                                                <th className="p-4 w-[180px]">대상 임차인</th>
                                                <th className="p-4">협업 내용 요약</th>
                                                <th className="p-4 w-[140px]">진행 상태</th>
                                                <th className="p-4 w-[120px]">담당 PM</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#333] text-[14px]">
                                            {siOpportunities.length > 0 ? (
                                                siOpportunities.map(opp => {
                                                    const partner = tenants.find(t => t.id === opp.tenant_id);
                                                    return (
                                                        <tr key={opp.id} className="hover:bg-[#2A2A2A] transition-colors">
                                                            <td className="p-4 font-bold text-white">{opp.collab_type}</td>
                                                            <td className="p-4">
                                                                <span className="font-semibold text-white block">{partner ? partner.company_name : '임차사 무관'}</span>
                                                                {partner?.current_building && <span className="text-[12px] text-[#86868B]">{partner.current_building} 임차중</span>}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-semibold text-white block mb-1">{opp.summary}</span>
                                                                <p className="text-[13px] text-[#A1A1AA] leading-relaxed break-all">{opp.collab_plan}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <select 
                                                                    value={opp.status} 
                                                                    onChange={e => handleUpdateSiStatus(opp.id, e.target.value)}
                                                                    className="bg-[#222] border border-[#444] rounded-[6px] px-2 py-1 text-[13px] text-white outline-none focus:border-[#888] cursor-pointer"
                                                                >
                                                                    <option value="대기">대기</option>
                                                                    <option value="제안중">제안중</option>
                                                                    <option value="완료">완료</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-4 text-[#A1A1AA] text-[13px]">{opp.pm_manager || '미지정'}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-16 text-center text-[#86868B]">
                                                        등록된 전략적 협업 (SI) 기회가 없습니다.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Register Tenant */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegisterTenant} className="flex-1 bg-[#1E1E1E] border border-[#333] rounded-[24px] p-8 flex flex-col gap-6 max-w-[900px] mx-auto shadow-2xl">
                            <h2 className="text-[20px] font-bold text-white border-b border-[#333] pb-4">신규 임차사 DB 등록</h2>
                            
                            {/* Section 1: 기업 프로파일 */}
                            <div>
                                <h3 className="text-[15px] font-bold text-[#2997ff] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-[#2997ff] rounded-full"></span>
                                    1. 기업 프로파일 및 기본 정보
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">회사명 (한글) *</label>
                                        <input 
                                            type="text" 
                                            value={regForm.company_name}
                                            onChange={e => setRegForm({ ...regForm, company_name: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 한국노바티스"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">회사명 (영문)</label>
                                        <input 
                                            type="text" 
                                            value={regForm.company_name_en}
                                            onChange={e => setRegForm({ ...regForm, company_name_en: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: Novartis Korea"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">산업 분류</label>
                                        <select 
                                            value={regForm.industry_category}
                                            onChange={e => setRegForm({ ...regForm, industry_category: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#888] cursor-pointer"
                                        >
                                            <option>바이오·헬스케어</option>
                                            <option>IT / 테크놀로지</option>
                                            <option>금융 / 자산운용</option>
                                            <option>제조 / 유통</option>
                                            <option>법률 / 전문컨설팅</option>
                                            <option>기타</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">한국 임직원 수 (명)</label>
                                        <input 
                                            type="number" 
                                            value={regForm.employee_count}
                                            onChange={e => setRegForm({ ...regForm, employee_count: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 450"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">주요 제품 및 서비스</label>
                                        <input 
                                            type="text" 
                                            value={regForm.major_services}
                                            onChange={e => setRegForm({ ...regForm, major_services: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="회사 비즈니스 핵심 키워드나 제품/서비스 입력..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: 임차 계약 정보 */}
                            <div className="border-t border-[#333] pt-6">
                                <h3 className="text-[15px] font-bold text-[#2997ff] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-[#2997ff] rounded-full"></span>
                                    2. 현재 임대차 계약 현황
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">현재 자산명 (빌딩)</label>
                                        <input 
                                            type="text" 
                                            value={regForm.current_building}
                                            onChange={e => setRegForm({ ...regForm, current_building: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 3IFC"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">임차 층수</label>
                                        <input 
                                            type="text" 
                                            value={regForm.rented_floor}
                                            onChange={e => setRegForm({ ...regForm, rented_floor: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 48F, 49F"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">임차 면적 (전용 평수)</label>
                                        <input 
                                            type="number" 
                                            value={regForm.rented_area}
                                            onChange={e => setRegForm({ ...regForm, rented_area: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 1200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">연간 임대료 총액 (억원)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={regForm.annual_rent}
                                            onChange={e => setRegForm({ ...regForm, annual_rent: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="예: 45.2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">계약 개시일</label>
                                        <input 
                                            type="date" 
                                            value={regForm.lease_start_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={e => setRegForm({ ...regForm, lease_start_date: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888] [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">계약 만료일</label>
                                        <input 
                                            type="date" 
                                            value={regForm.lease_end_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={e => setRegForm({ ...regForm, lease_end_date: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888] [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">담당 TR 매니저</label>
                                        <input 
                                            type="text" 
                                            value={regForm.tr_manager}
                                            onChange={e => setRegForm({ ...regForm, tr_manager: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#888]"
                                            placeholder="담당자 이름 입력..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">향후 공간 전망</label>
                                        <select 
                                            value={regForm.space_prospect}
                                            onChange={e => setRegForm({ ...regForm, space_prospect: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[#888] cursor-pointer"
                                        >
                                            <option>유지</option>
                                            <option>증평</option>
                                            <option>축소</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: 공간 진단 */}
                            <div className="border-t border-[#333] pt-6">
                                <h3 className="text-[15px] font-bold text-[#2997ff] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-[#2997ff] rounded-full"></span>
                                    3. 기초 공간 니즈 진단
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">고정 데스크 (석)</label>
                                        <input 
                                            type="number" 
                                            value={regForm.fixed_desks}
                                            onChange={e => setRegForm({ ...regForm, fixed_desks: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2 text-[14px] text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">자유 데스크 (석)</label>
                                        <input 
                                            type="number" 
                                            value={regForm.hot_desks}
                                            onChange={e => setRegForm({ ...regForm, hot_desks: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2 text-[14px] text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">회의실 수량</label>
                                        <input 
                                            type="number" 
                                            value={regForm.meeting_rooms}
                                            onChange={e => setRegForm({ ...regForm, meeting_rooms: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2 text-[14px] text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">라운지/어메니티</label>
                                        <select 
                                            value={regForm.lounge_yn}
                                            onChange={e => setRegForm({ ...regForm, lounge_yn: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-3 py-2 text-[14px] text-white outline-none cursor-pointer"
                                        >
                                            <option value="Y">있음 (Y)</option>
                                            <option value="N">없음 (N)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">창고/서버룸 수량</label>
                                        <input 
                                            type="number" 
                                            value={regForm.storage_count}
                                            onChange={e => setRegForm({ ...regForm, storage_count: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2 text-[14px] text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">주차 배정 수량 (대)</label>
                                        <input 
                                            type="number" 
                                            value={regForm.parking_count}
                                            onChange={e => setRegForm({ ...regForm, parking_count: Number(e.target.value) })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-2 text-[14px] text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: 페인포인트 & 요청사항 */}
                            <div className="border-t border-[#333] pt-6 mb-4">
                                <h3 className="text-[15px] font-bold text-[#2997ff] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-[#2997ff] rounded-full"></span>
                                    4. 정성적 Painpoints & 요청사항
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">주요 불만 사항</label>
                                        <textarea 
                                            value={regForm.pain_points}
                                            onChange={e => setRegForm({ ...regForm, pain_points: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-3 text-[14px] text-white outline-none min-h-[80px]"
                                            placeholder="주차 협소, 기계실 소음, 회의 공간 부족 등 구체적 불만사항 기입..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[#86868B] text-[13px] font-bold mb-2">기타 특이 니즈 및 요청사항</label>
                                        <textarea 
                                            value={regForm.other_requests}
                                            onChange={e => setRegForm({ ...regForm, other_requests: e.target.value })}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[10px] px-4 py-3 text-[14px] text-white outline-none min-h-[80px]"
                                            placeholder="임대료 인하 요구, 전대 검토 허용 조건, ESG 자격 요구 등..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-end border-t border-[#333] pt-6 mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => navigateTo('platform/iotaseoul/stakeholder/tenant/list')}
                                    className="px-6 py-2.5 bg-[#3c3c3c]/50 text-[#86868B] border border-[#444] rounded-[10px] text-[14px] font-bold hover:bg-[#3c3c3c] hover:text-white transition-colors cursor-pointer"
                                >
                                    등록 취소
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#2997ff] hover:bg-[#0071e3] text-white font-bold rounded-[10px] text-[14px] transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? '저장 중...' : '임차사 등록'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            )}

            {/* --- SLIDE-OVER DRAWER (Tenant 360 Detail View) --- */}
            {isDetailDrawerOpen && selectedTenant && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-xs transition-opacity"
                        onClick={() => {
                            setIsDetailDrawerOpen(false);
                            setSelectedTenant(null);
                        }}
                    ></div>

                    {/* Drawer Content */}
                    <div className="fixed inset-y-0 right-0 z-[130] w-[550px] bg-[#1E1E1E] border-l border-[#333] shadow-2xl flex flex-col overflow-y-auto p-6 transition-transform">
                        
                        {/* Drawer Header */}
                        <div className="flex justify-between items-start border-b border-[#333] pb-4 mb-5">
                            <div>
                                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-1">{selectedTenant.industry_category}</span>
                                <h2 className="text-[22px] font-bold text-white leading-tight">{selectedTenant.company_name}</h2>
                                {selectedTenant.company_name_en && <span className="text-[13px] text-[#86868B] font-mono">{selectedTenant.company_name_en}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleDeleteTenant(selectedTenant.id)}
                                    className="text-[13px] font-bold text-[#ef4444] hover:underline px-2 py-1 cursor-pointer"
                                >
                                    삭제
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsDetailDrawerOpen(false);
                                        setSelectedTenant(null);
                                    }}
                                    className="p-1 rounded-full hover:bg-[#333] text-[#86868B] hover:text-white transition-colors cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>

                        {/* Stacking Sections */}
                        <div className="flex flex-col gap-6">

                            {/* Section 1: 임차 계약 핵심 요약 */}
                            <div className="bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px]">
                                <h4 className="text-[14px] font-bold text-[#2997ff] mb-3 border-b border-[#3c3c3c] pb-2">기본 임차 정보</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px]">
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">현재 빌딩 및 층</span>
                                        <span className="text-white font-medium">{selectedTenant.current_building} ({selectedTenant.rented_floor || '층수 미상'})</span>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">전용 임차면적</span>
                                        <span className="text-white font-medium">{selectedTenant.rented_area.toLocaleString()} 평</span>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">임대차 계약 기간</span>
                                        <span className="text-white font-mono">{selectedTenant.lease_start_date || '시작 미정'} ~ {selectedTenant.lease_end_date || '만료 미정'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">연간 임대료 총액</span>
                                        <span className="text-white font-medium">{selectedTenant.annual_rent} 억원</span>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">한국 임직원 수</span>
                                        <span className="text-white font-medium">{selectedTenant.employee_count} 명</span>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] block mb-0.5">담당 TR 매니저</span>
                                        <span className="text-white font-medium">{selectedTenant.tr_manager}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: 공간 진단 수치 */}
                            <div className="bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px]">
                                <h4 className="text-[14px] font-bold text-[#2997ff] mb-3 border-b border-[#3c3c3c] pb-2">공간 현황 및 구성 니즈</h4>
                                {(() => {
                                    const need = spaceNeeds.find(s => s.tenant_id === selectedTenant.id) || {};
                                    return (
                                        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-center text-[13px]">
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">고정 데스크</span>
                                                <span className="text-white font-bold">{need.fixed_desks || 0} 석</span>
                                            </div>
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">자유 데스크</span>
                                                <span className="text-white font-bold">{need.hot_desks || 0} 석</span>
                                            </div>
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">회의실</span>
                                                <span className="text-white font-bold">{need.meeting_rooms || 0} 개소</span>
                                            </div>
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">라운지/카페</span>
                                                <span className="text-white font-bold">{need.lounge_yn === 'Y' ? '있음 (Y)' : '없음 (N)'}</span>
                                            </div>
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">창고/IT룸</span>
                                                <span className="text-white font-bold">{need.storage_count || 0} 개</span>
                                            </div>
                                            <div className="bg-[#1A1A1A] p-2.5 rounded-[10px]">
                                                <span className="text-[#86868B] block mb-1 text-[11px] font-bold">전용 주차</span>
                                                <span className="text-white font-bold">{need.parking_count || 0} 대</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Section 3: 정성적 불만 및 요청 */}
                            <div className="bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px] text-[13px]">
                                <h4 className="text-[14px] font-bold text-[#2997ff] mb-3 border-b border-[#3c3c3c] pb-2">불만사항 및 요청 메모</h4>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <span className="text-[#86868B] font-bold block mb-1">주요 불만 사항 (Pain Points)</span>
                                        <p className="text-white bg-[#1A1A1A] p-3 rounded-[10px] leading-relaxed break-all">{selectedTenant.pain_points || '등록된 불만 사항이 없습니다.'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#86868B] font-bold block mb-1">기타 특이 요청 사항</span>
                                        <p className="text-white bg-[#1A1A1A] p-3 rounded-[10px] leading-relaxed break-all">{selectedTenant.other_requests || '등록된 특이 요청 사항이 없습니다.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: 고객 연락처 매핑 CRM */}
                            <div className="bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px]">
                                <h4 className="text-[14px] font-bold text-[#2997ff] mb-3 border-b border-[#3c3c3c] pb-2 flex justify-between items-center">
                                    <span>의사결정망 및 고객 연락처</span>
                                    <span className="text-[11px] text-[#86868B] font-normal">친밀도 1~5점</span>
                                </h4>
                                
                                {/* Contacts List */}
                                <div className="flex flex-col gap-2.5 mb-4">
                                    {contacts.filter(c => c.tenant_id === selectedTenant.id).length > 0 ? (
                                        contacts.filter(c => c.tenant_id === selectedTenant.id).map(contact => (
                                            <div key={contact.id} className="bg-[#1A1A1A] p-3 rounded-[10px] border border-[#333] relative group">
                                                <button 
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                    className="absolute top-2.5 right-3 text-[11px] text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity hover:underline cursor-pointer"
                                                >
                                                    삭제
                                                </button>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-bold text-white text-[14px]">{contact.name}</span>
                                                    <span className="text-[11px] px-1.5 py-0.5 bg-[#333] text-[#A1A1AA] rounded-md">{contact.position}</span>
                                                    <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#2997ff]/20 text-[#60a5fa] rounded-md">{contact.role_category}</span>
                                                </div>
                                                <div className="text-[12px] text-[#86868B] flex flex-col gap-1 font-sans">
                                                    <div>연락처: <span className="text-white font-mono">{contact.phone || '-'}</span></div>
                                                    {contact.last_contact_date && <div>마지막 접촉: <span className="text-white font-mono">{contact.last_contact_date}</span></div>}
                                                    {contact.memo && <div className="mt-1 text-[#A1A1AA] bg-[#272726] p-1.5 rounded-md text-[13px] italic">"{contact.memo}"</div>}
                                                </div>
                                                
                                                {/* Stars/Dots for Engagement Score */}
                                                <div className="flex gap-0.5 mt-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`w-2 h-2 rounded-full ${i < contact.engagement_score ? 'bg-[#fbf167]' : 'bg-[#333]'}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[12px] text-[#86868B] text-center py-4">등록된 의사결정권자 인맥이 없습니다.</p>
                                    )}
                                </div>

                                {/* Add Contact Form Inline */}
                                <div className="border-t border-[#333] pt-4 flex flex-col gap-3">
                                    <span className="text-[12px] font-bold text-[#86868B]">+ 담당 고객 추가</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input 
                                            type="text" 
                                            value={newContact.name}
                                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                            placeholder="이름"
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px]"
                                        />
                                        <input 
                                            type="text" 
                                            value={newContact.position}
                                            onChange={e => setNewContact({ ...newContact, position: e.target.value })}
                                            placeholder="직책"
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px]"
                                        />
                                        <select 
                                            value={newContact.role_category}
                                            onChange={e => setNewContact({ ...newContact, role_category: e.target.value })}
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-1 py-1.5 text-[13px] cursor-pointer"
                                        >
                                            <option>결정권자</option>
                                            <option>CFO</option>
                                            <option>총무/시설</option>
                                            <option>HR</option>
                                            <option>기타</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            value={newContact.phone}
                                            onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                            placeholder="연락처 (예: 010-1234-5678)"
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px] font-mono"
                                        />
                                        <input 
                                            type="date" 
                                            value={newContact.last_contact_date}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            onChange={e => setNewContact({ ...newContact, last_contact_date: e.target.value })}
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px] cursor-pointer [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            value={newContact.memo}
                                            onChange={e => setNewContact({ ...newContact, memo: e.target.value })}
                                            placeholder="미팅 접촉 메모 및 피드백 요약..."
                                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-[6px] px-3 py-1.5 text-[13px]"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] text-[#86868B]">친밀도</span>
                                            <select 
                                                value={newContact.engagement_score} 
                                                onChange={e => setNewContact({ ...newContact, engagement_score: Number(e.target.value) })}
                                                className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-1 py-1 text-[12px]"
                                            >
                                                <option value="5">5 (최상)</option>
                                                <option value="4">4 (우수)</option>
                                                <option value="3">3 (보통)</option>
                                                <option value="2">2 (낮음)</option>
                                                <option value="1">1 (위험)</option>
                                            </select>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleAddContact}
                                            className="px-4 py-1.5 bg-[#2997ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0071e3] cursor-pointer"
                                        >
                                            담당자 등록
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: SI 협업 카드 매핑 */}
                            <div className="bg-[#272726] border border-[#3c3c3c] p-4 rounded-[16px] mb-8">
                                <h4 className="text-[14px] font-bold text-[#2997ff] mb-3 border-b border-[#3c3c3c] pb-2">SI 및 공동 투자 딜 소싱</h4>
                                
                                {/* Opportunities associated */}
                                <div className="flex flex-col gap-2.5 mb-4 text-[13px]">
                                    {siOpportunities.filter(o => o.tenant_id === selectedTenant.id).length > 0 ? (
                                        siOpportunities.filter(o => o.tenant_id === selectedTenant.id).map(opp => (
                                            <div key={opp.id} className="bg-[#1A1A1A] p-3 rounded-[10px] border border-[#333]">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-white text-[14px]">{opp.summary}</span>
                                                    <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#d97706]/20 text-[#fbf167] rounded-md border border-[#d97706]/30">{opp.status}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-[#86868B] block mb-2">{opp.collab_type}</span>
                                                <p className="text-[#A1A1AA] leading-relaxed mb-2">{opp.collab_plan}</p>
                                                <div className="text-[11px] text-[#86868B]">담당 PM: {opp.pm_manager || '미지정'}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[12px] text-[#86868B] text-center py-4">등록된 연계 SI 협업 기회가 없습니다.</p>
                                    )}
                                </div>

                                {/* Add SI Opportunity Inline */}
                                <div className="border-t border-[#333] pt-4 flex flex-col gap-3">
                                    <span className="text-[12px] font-bold text-[#86868B]">+ 연계 SI 협업 기회 추가</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            value={newSi.summary}
                                            onChange={e => setNewSi({ ...newSi, summary: e.target.value })}
                                            placeholder="협업 명칭 (예: 공동 펀드 조성)"
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px] font-semibold"
                                        />
                                        <select 
                                            value={newSi.collab_type}
                                            onChange={e => setNewSi({ ...newSi, collab_type: e.target.value })}
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-1 py-1.5 text-[13px] cursor-pointer"
                                        >
                                            <option>공동 펀드</option>
                                            <option>시설 연계 투자</option>
                                            <option>ESG 금융</option>
                                            <option>기타</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            value={newSi.pm_manager}
                                            onChange={e => setNewSi({ ...newSi, pm_manager: e.target.value })}
                                            placeholder="담당 PM 매니저"
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-2 py-1.5 text-[13px]"
                                        />
                                        <select 
                                            value={newSi.status}
                                            onChange={e => setNewSi({ ...newSi, status: e.target.value })}
                                            className="bg-[#1A1A1A] border border-[#333] rounded-[6px] px-1 py-1.5 text-[13px] cursor-pointer"
                                        >
                                            <option value="대기">대기</option>
                                            <option value="제안중">제안중</option>
                                            <option value="완료">완료</option>
                                        </select>
                                    </div>
                                    <div>
                                        <textarea 
                                            value={newSi.collab_plan}
                                            onChange={e => setNewSi({ ...newSi, collab_plan: e.target.value })}
                                            placeholder="구체적인 투자 연계 및 협업 방안 요약..."
                                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-[6px] px-3 py-1.5 text-[13px] min-h-[50px]"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            type="button"
                                            onClick={handleAddSiOpportunity}
                                            className="px-4 py-1.5 bg-[#2997ff] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#0071e3] cursor-pointer"
                                        >
                                            SI 협업 등록
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
