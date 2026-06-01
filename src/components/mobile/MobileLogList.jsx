import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';
import MobileLogCard from './MobileLogCard';

export default function MobileLogList({ memberInfo }) {
    const [workspace, setWorkspace] = useState(() => getInitialWorkspace(memberInfo));
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [workspace]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('*')
                .order('work_date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(200);
                
            if (error) throw error;

            const filtered = (data || []).filter(log => {
                const metadata = log.metadata || {};
                return metadata.workspace_code === workspace.code || 
                       metadata.workspace_label === workspace.label ||
                       workspace.orgNames.includes(metadata.workspace_label);
            });
            
            setLogs(filtered);
        } catch (err) {
            console.error("Failed to fetch mobile logs:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full min-h-full pb-24 px-4 pt-4 relative">
            {/* Header / Workspace Selector */}
            <div className="flex items-center justify-between mb-4 relative z-20">
                <div className="relative">
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 text-[20px] font-bold text-white bg-transparent outline-none"
                    >
                        {workspace.label}
                        <svg className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-[200px] bg-[#242423] border border-[#3A3A39] rounded-xl shadow-xl z-20 py-2 overflow-hidden">
                                {MOBILE_WORKSPACES.map(w => (
                                    <button 
                                        key={w.code}
                                        onClick={() => { setWorkspace(w); setDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-[15px] font-medium transition-colors ${workspace.code === w.code ? 'text-[#4C82FF] bg-[#4C82FF]/10' : 'text-[#F4F4F1] hover:bg-[#20201F]'}`}
                                    >
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-[#4C82FF] border-t-transparent rounded-full"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-[15px]">등록된 협업 게시글이 없습니다.</div>
            ) : (
                <div className="flex flex-col">
                    {logs.map(log => (
                        <MobileLogCard 
                            key={log.id || log.log_id} 
                            log={log} 
                            memberInfo={memberInfo} 
                            onClick={(log) => alert("상세보기 모달 준비중입니다. (" + (log.metadata?.title || '제목없음') + ")")}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
