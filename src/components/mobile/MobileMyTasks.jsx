import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MobileLogCard from './MobileLogCard';

export default function MobileMyTasks({ memberInfo }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogIds, setExpandedLogIds] = useState(new Set());

    useEffect(() => {
        if (!memberInfo?.email) {
            setLoading(false);
            return;
        }
        fetchMyLogs();
    }, [memberInfo]);

    const fetchMyLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('*')
                .ilike('writer_staff_id', memberInfo.email)
                .order('work_date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error("Failed to fetch my tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full pb-24 p-4 bg-[#1F1F1E]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0 select-none">
                <h2 className="text-[20px] font-bold text-white">내가 쓴 로그 ({logs.length})</h2>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">작성하신 내역이 없습니다.</div>
            ) : (
                <div className="flex flex-col">
                    {logs.map(log => {
                        const logId = log.id || log.log_id;
                        return (
                            <MobileLogCard 
                                key={logId} 
                                log={log} 
                                memberInfo={memberInfo} 
                                isExpanded={expandedLogIds.has(logId)}
                                onClick={(clickedLog) => {
                                    const id = clickedLog.id || clickedLog.log_id;
                                    setExpandedLogIds(prev => {
                                        const next = new Set(prev);
                                        if (next.has(id)) {
                                            next.delete(id);
                                        } else {
                                            next.add(id);
                                        }
                                        return next;
                                    });
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
