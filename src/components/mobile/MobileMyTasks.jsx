import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MobileLogCard from './MobileLogCard';

export default function MobileMyTasks({ memberInfo }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="flex flex-col w-full min-h-full pb-24 px-4 pt-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-20">
                <h2 className="text-[20px] font-bold text-white">내업무</h2>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-[#4C82FF] border-t-transparent rounded-full"></div>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-[15px]">작성하신 내역이 없습니다.</div>
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
