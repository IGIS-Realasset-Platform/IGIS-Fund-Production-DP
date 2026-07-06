import React from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function PmoPopupManager() {
    const [popups, setPopups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    async function fetchPopups() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_popup_requests')
                .select('*')
                .order('request_date', { ascending: false });

            if (error) throw error;
            setPopups(data || []);
        } catch (err) {
            console.error("Failed to fetch popups:", err);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchPopups();
    }, []);

    const handleUpdateStatus = async (popupId, nextStatus) => {
        try {
            const { error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_popup_requests')
                .update({ handling_status: nextStatus })
                .eq('id', popupId);

            if (error) throw error;
            setPopups(prev => prev.map(p => p.id === popupId ? { ...p, handling_status: nextStatus } : p));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("처리 상태 변경에 실패했습니다.");
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto select-none">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[32px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">단발 업무 요청 관리</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">정규업무 침식을 방지하기 위한 외부 팝업 요청 접수/위임/반려 관리</p>
                </div>
                <button 
                    onClick={fetchPopups}
                    className="px-4 py-1.5 bg-[#272726] hover:bg-[#333] border border-[#3c3c3c] hover:border-[#555] rounded-full text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                    🔄 새로고침
                </button>
            </div>

            {loading ? (
                <div className="w-full h-[260px] flex items-center justify-center border border-[#333] rounded-[24px]">
                    <span className="text-[#86868B] text-[15px] animate-pulse">요청 데이터를 연동하고 있습니다...</span>
                </div>
            ) : (
                <div className="w-full flex flex-col gap-4 select-text">
                    {popups.length === 0 ? (
                        <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[24px] p-20 text-center text-[#86868B]">
                            현재 접수된 단발성 팝업 요청이 없습니다.
                        </div>
                    ) : (
                        popups.map(p => (
                            <div key={p.id} className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex justify-between items-start hover:border-[#555] transition-all">
                                <div className="flex flex-col gap-2 max-w-[70%] text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] bg-[#1F1F1E] border border-[#3c3c3c] text-white px-2 py-0.5 rounded-lg font-bold font-mono">
                                            {p.request_date}
                                        </span>
                                        <span className="text-[12px] font-bold text-[#2997ff]">
                                            요청자: {p.requester}
                                        </span>
                                    </div>
                                    <h4 className="text-[16px] font-bold text-white mt-1">
                                        {p.request_detail}
                                    </h4>
                                    <div className="text-[13px] text-[#A1A1AA] leading-relaxed mt-1">
                                        목적: {p.purpose || '-'}
                                    </div>
                                    {p.deliverables && (
                                        <div className="text-[12px] text-[#86868B] mt-1 font-medium">
                                            필요 산출물: {p.deliverables}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <span className={`text-[11px] px-2 py-0.5 rounded-[6px] font-bold uppercase ${
                                        p.handling_status === '접수' ? 'bg-[#2997ff]/20 text-[#2997ff] border border-[#2997ff]/30' :
                                        p.handling_status === '위임' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' :
                                        p.handling_status === '보류' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                                        'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                                    }`}>
                                        {p.handling_status}
                                    </span>

                                    {/* Action buttons */}
                                    <div className="flex gap-1.5 select-none">
                                        {['위임', '보류', '반려'].map(status => (
                                            p.handling_status !== status && (
                                                <button
                                                    key={status}
                                                    onClick={() => handleUpdateStatus(p.id, status)}
                                                    className="px-3 py-1 bg-[#1F1F1E] border border-[#3c3c3c] hover:bg-[#333] text-[#A1A1AA] hover:text-white rounded-[8px] text-[11px] font-bold cursor-pointer transition-all"
                                                >
                                                    {status}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
