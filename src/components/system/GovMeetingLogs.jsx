import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import MeetingWriteBox from './MeetingWriteBox';

const internalMeetings = [
    { meeting: 'Iota 임원 보고회', period: '월 1회 (3주차)', leader: '부문대표(이철승)', attendees: '부대표진·CFT 총괄·셀 리드 5인', output: '월간 사업보고서, T1 의사결정 사안 통과' },
    { meeting: 'CFT 운영위', period: '격주 (수)', leader: 'CFT 총괄(부문대표 겸직)', attendees: 'PM·5개 셀 리드·KAM 1파트', output: 'UW 범위 외 의사결정, 변경관리 승인' },
    { meeting: '주간 PM Stand-up', period: '주 1회 (월)', leader: 'PM(강순용)', attendees: '5개 셀 실무 책임자', output: '주간 진척, Top10 리스크, 7일 액션' },
    { meeting: 'LP 정기보고 미팅', period: '분기 1회', leader: 'KAM 1파트(김행단)', attendees: 'PM·LFC·운용지원·외부 LP', output: '분기보고서, Q&A 로그' },
    { meeting: '대주단 보고', period: '월/분기', leader: 'LFC(박준호)', attendees: 'PM·KAM·외부 대주단', output: 'Covenants 모니터링 보드, 차주 통지' },
    { meeting: 'IPR WG', period: '격주 (목)', leader: '프리츠 TFT (권순일)', attendees: 'CFT 총괄·PM·외부자문(법무·회계·감정)', output: 'Forward Purchase 구조설계서, 약정 초안' },
    { meeting: '분기 회고', period: '분기 말', leader: 'CFT 총괄', attendees: '전 셀 리드·실무 핵심 인력', output: 'KPI/OKR 리뷰, 원인분석, 차분기 OKR' }
];

const externalMeetings = [
    { meeting: '이오타 1 (현대건설)', period: '격주 (수)', leader: '부문대표(이철승)', attendees: '현대건설 및 금융주관사들', output: '' },
    { meeting: '이오타 2 (삼성물산)', period: '격주 (수)', leader: '부문대표(이철승)', attendees: '삼성물산 및 금융주관사들', output: '' },
    { meeting: '통합PF (NH투자증권)', period: '격주 (수)', leader: '부문대표(이철승)', attendees: 'NH투자증권', output: '' }
];

const MEETING_TYPES = [...internalMeetings.map(m=>m.meeting), ...externalMeetings.map(m=>m.meeting)];

export default function GovMeetingLogs() {
    const { memberInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('전체');
    const [activeCadenceTab, setActiveCadenceTab] = useState('internal');
    const [meetingLogs, setMeetingLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [masterStakeholders, setMasterStakeholders] = useState([]);
    const [expandedLogs, setExpandedLogs] = useState({});
    const [editingLogId, setEditingLogId] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const typeParam = params.get('type');
        if (typeParam && MEETING_TYPES.includes(typeParam)) {
            setActiveTab(typeParam);
            if (externalMeetings.some(m => m.meeting === typeParam)) {
                setActiveCadenceTab('external');
            } else {
                setActiveCadenceTab('internal');
            }
        }
        fetchMasterStakeholders();
    }, []);

    useEffect(() => {
        fetchMeetingLogs();
    }, [activeTab]);

    const fetchMasterStakeholders = async () => {
        try {
            const { data } = await supabase.from('iota_stakeholder_master').select('*');
            if (data) setMasterStakeholders(data);
        } catch (e) {
            console.error('Fetch master stakeholders error:', e);
        }
    };

    const toggleExpand = (id) => {
        setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('정말 이 회의록을 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase.from('iota_meeting_logs').delete().eq('id', id);
            if (error) throw error;
            fetchMeetingLogs();
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const fetchMeetingLogs = async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('iota_meeting_logs')
                .select('*')
                .order('meeting_date', { ascending: false })
                .order('created_at', { ascending: false });
            if (activeTab !== '전체') {
                query = query.eq('meeting_type', activeTab);
            }
            const { data, error } = await query;
                
            if (error) {
                console.warn('Table might not exist yet:', error);
                setMeetingLogs([]);
            } else {
                setMeetingLogs(data || []);
            }
        } catch (e) {
            console.error('Fetch meetings error:', e);
            setMeetingLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="w-full h-full bg-[#1F1F1E] font-sans overflow-y-auto custom-scrollbar">
            <div className="w-[1200px] mx-auto flex-1 flex flex-col pt-[20px] shrink-0 pb-[100px]">
                
                {/* Header */}
                <div className="shrink-0 pointer-events-none">
                    <h1 className="text-[24px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[8px]">회의록</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">IOTA Seoul 주요 회의체 히스토리 및 의사결정 내역</p>
                </div>

                {/* 주요 회의체 히스토리 Table */}
                <div className="w-full flex flex-col mb-[40px] -mt-[40px] relative z-10">
                    <div className="flex items-center justify-end mb-[12px]">
                        <div className="flex items-center bg-[#222] border border-[#333] rounded-[8px] p-[4px] pointer-events-auto">
                            <button
                                onClick={() => setActiveCadenceTab('internal')}
                                className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${activeCadenceTab === 'internal' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                            >
                                이지스 내부
                            </button>
                            <button
                                onClick={() => setActiveCadenceTab('external')}
                                className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${activeCadenceTab === 'external' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                            >
                                이지스 외부
                            </button>
                        </div>
                    </div>
                    
                    <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[16px] overflow-hidden">
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-transparent">
                                <tr>
                                    <th className="pl-[22px] pr-[12px] py-[12px] text-[14px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[210px]">회의체</th>
                                    <th className="pl-[22px] pr-[12px] py-[12px] text-[14px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[130px]">주기</th>
                                    <th className="pl-[22px] pr-[12px] py-[12px] text-[14px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[160px]">주재자</th>
                                    <th className="pl-[42px] pr-[12px] py-[12px] text-[14px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[280px]">주요 참석자</th>
                                    <th className="pl-[22px] pr-[12px] py-[12px] text-[14px] font-bold text-[#86868B] border-b border-[#3c3c3c]">핵심 산출물</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]">
                                {(activeCadenceTab === 'internal' ? internalMeetings : externalMeetings).map((row, idx) => {
                                    const isActive = activeTab === row.meeting;
                                    return (
                                        <React.Fragment key={idx}>
                                            <tr 
                                                className={`hover:bg-[#333] transition-colors group cursor-pointer ${isActive ? 'bg-[#333]' : ''}`} 
                                                onClick={() => setActiveTab(row.meeting)}
                                            >
                                                <td className="pl-[22px] pr-[12px] py-[12px] text-[17px] text-[#E5E5E5] group-hover:text-white transition-colors text-left font-semibold whitespace-pre-wrap">{row.meeting}</td>
                                                <td className="pl-[22px] pr-[12px] py-[12px] text-[13px] transition-colors"><span className={`inline-block px-[10px] py-[4px] rounded-[6px] bg-[#222] text-[#c3c2b7] group-hover:bg-[#2997ff] group-hover:text-white transition-colors whitespace-nowrap ${isActive ? 'bg-[#2997ff] text-white' : ''}`}>{row.period}</span></td>
                                                <td className="pl-[22px] pr-[12px] py-[12px] text-[13px] font-bold text-white whitespace-nowrap transition-colors">{row.leader}</td>
                                                <td className="pl-[42px] pr-[12px] py-[12px] text-[13px] text-[#c3c2b7] text-left group-hover:text-[#E5E5E5] transition-colors">{row.attendees}</td>
                                                <td className="pl-[22px] pr-[12px] py-[12px] text-[13px] text-[#c3c2b7] text-left group-hover:text-[#E5E5E5] transition-colors">{row.output}</td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between items-end mb-[14px]">
                        <h2 className="text-[20px] font-bold text-white tracking-tight">{activeTab === '전체' ? '전체 회의록' : `${activeTab} 회의록`}</h2>
                        <div className="flex items-center">
                            <select 
                                value={activeTab} 
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="bg-[#222] border border-[#333] rounded-[8px] px-[16px] py-[8px] text-[13px] font-bold text-white outline-none cursor-pointer appearance-none pr-[30px]"
                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23A1A1AA\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                            >
                                <option disabled value="" className="bg-[#222] text-[#86868B] font-bold">[ 회의록 유형 ]</option>
                                <option value="전체">모든 회의록 보기</option>
                                <optgroup label="이지스 내부">
                                    {internalMeetings.map(m => <option key={m.meeting} value={m.meeting}>{m.meeting}</option>)}
                                </optgroup>
                                <optgroup label="이지스 외부">
                                    {externalMeetings.map(m => <option key={m.meeting} value={m.meeting}>{m.meeting}</option>)}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    {activeTab !== '전체' && (
                        <div className="mb-[4px]">
                            <MeetingWriteBox 
                                memberInfo={memberInfo}
                                masterStakeholders={masterStakeholders}
                                fetchLogs={fetchMeetingLogs}
                                fetchMasterStakeholders={fetchMasterStakeholders}
                                workspaceCode={`MEETING_${activeTab.replace(/ /g, '_')}`}
                                workspaceLabel={activeTab}
                                defaultExpanded={false}
                            />
                        </div>
                    )}

                    {/* Meeting List */}
                    <div className="mt-[4px]">
                        {isLoading ? (
                            <div className="text-[#86868B] text-[14px] text-center py-[40px]">로딩 중...</div>
                        ) : meetingLogs.length === 0 ? (
                            <div className="bg-[#262626] rounded-[16px] border border-[#333] p-[40px] text-center">
                                <p className="text-[#86868B] text-[14px]">등록된 회의록이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-[12px]">
                                {meetingLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        {editingLogId === log.id ? (
                                            <div className="bg-[#262626] rounded-[16px] border border-[#333] p-[4px] hover:border-[#444] transition-colors">
                                                <MeetingWriteBox 
                                                    memberInfo={memberInfo}
                                                    masterStakeholders={masterStakeholders}
                                                    fetchLogs={fetchMeetingLogs}
                                                    fetchMasterStakeholders={fetchMasterStakeholders}
                                                    workspaceCode={`MEETING_${(log.meeting_type || activeTab).replace(/ /g, '_')}`}
                                                    workspaceLabel={log.meeting_type || activeTab}
                                                    defaultExpanded={true}
                                                    editMode={true}
                                                    initialData={log}
                                                    onCancel={() => setEditingLogId(null)}
                                                    onSuccess={() => { setEditingLogId(null); fetchMeetingLogs(); }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-[#262626] rounded-[16px] border border-[#333] p-[20px] hover:border-[#444] transition-colors cursor-pointer" onClick={() => toggleExpand(log.id)}>
                                                <div className="flex justify-between items-start mb-[12px]">
                                                    <div>
                                                        <div className="flex items-center gap-[8px] mb-[6px]">
                                                            <span className="text-[#2997ff] font-bold text-[13px]">{formatDate(log.meeting_date)}</span>
                                                            {log.meeting_type && (
                                                                <span className="bg-[#333] text-[#E5E5E5] text-[11px] px-[8px] py-[2px] rounded-full">{log.meeting_type}</span>
                                                            )}
                                                            {log.meeting_category && (
                                                                <span className="bg-[#333] text-[#E5E5E5] text-[11px] px-[8px] py-[2px] rounded-full">{log.meeting_category}</span>
                                                            )}
                                                            {log.metadata?.priority === '높음' && (
                                                                <span className="bg-red-500/20 text-red-500 text-[11px] px-[8px] py-[2px] rounded-full">중요도 높음</span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-white font-bold text-[18px] leading-snug translate-y-[6px] mb-[2px]">{log.title}</h3>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-[8px]">
                                                            <span className="text-[#86868B] text-[13px]">{log.author_name}</span>
                                                            <span className="text-[#666] text-[12px]">{formatDate(log.created_at)}</span>
                                                        </div>
                                                        {(log.author_id === memberInfo?.email || log.author_name === memberInfo?.staff_name || memberInfo?.role === 'admin') && (
                                                            <div className="flex items-center gap-[8px] mt-[6px]">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setEditingLogId(log.id); }}
                                                                    className="text-[12px] font-bold text-[#A1A1AA] hover:text-[#2997ff] transition-colors"
                                                                >
                                                                    수정
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => handleDelete(e, log.id)}
                                                                    className="text-[12px] font-bold text-[#A1A1AA] hover:text-[#ef4444] transition-colors"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`text-[#E5E5E5] text-[14px] leading-relaxed whitespace-pre-wrap mt-[12px] transition-all ${expandedLogs[log.id] ? '' : 'line-clamp-1'}`}>
                                                    {log.content}
                                                </div>
                                        {log.metadata?.attachedFiles?.length > 0 && (
                                            <div className="mt-[16px] flex flex-wrap gap-[8px]">
                                                {log.metadata.attachedFiles.map((f, i) => (
                                                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[6px] bg-[#333] hover:bg-[#444] rounded-[8px] px-[12px] py-[6px] transition-colors cursor-pointer">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                        <span className="text-[12px] text-white">{f.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
