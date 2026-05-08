import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import WorkspaceActivityLog from './WorkspaceActivityLog';

export default function WorkspacePm() {
    const [kpiData, setKpiData] = useState({
        progress_percent: 18.0,
        budget_variance: 1.2,
        schedule_slippage_days: 7,
        covenant_status: '정상',
        covenant_ltv: 45.5,
        covenant_dscr: 1.25
    });

    const [expandedDecisions, setExpandedDecisions] = useState({});

    const riskData = [
        { no: 1, risk: '공정 지연 (시공·인허가 복합)', cellText: '개발관리(', cellMembers: ['홍장군'], cellSuffix: ')', trigger: '2주 누적 지연', final: 'PM', status: '정상' },
        { no: 2, risk: '사업비 UW 범위 외 증가', cellText: 'PM(', cellMembers: ['강순용'], cellSuffix: ')', trigger: 'UW +5% 누적', final: 'CFT 총괄', status: '정상' },
        { no: 3, risk: '대주단 Covenants 위반', cellText: 'LFC(', cellMembers: ['박준호'], cellSuffix: ')', trigger: 'DSCR/LTV 임계점', final: 'CFT 총괄', status: '정상' },
        { no: 4, risk: '핵심 임차인 이탈/철회', cellText: 'EMC(', cellMembers: ['김민지'], cellSuffix: ')', trigger: 'LOI 철회 통보', final: 'PM', status: '주의' },
        { no: 5, risk: '금리 환경 급변(리파이낸싱 옵션 훼손)', cellText: 'LFC(', cellMembers: ['박준호'], cellSuffix: ')', trigger: '시장금리 ±50bp', final: 'CFT 총괄', status: '정상' },
        { no: 6, risk: 'LP 분배 지연 / 신뢰 하락', cellText: 'KAM(', cellMembers: ['김행단'], cellSuffix: ')', trigger: '분배 지연 30일', final: 'CFT 총괄', status: '정상' },
        { no: 7, risk: 'IPR 권순약정 협상 지연', cellText: '프리츠 TFT(', cellMembers: ['권순일'], cellSuffix: ')', trigger: 'Stage 2 지연 60일', final: 'CFT 총괄', status: '주의' },
        { no: 8, risk: '규제·인허가 변경', cellText: '사업1파트(', cellMembers: ['권순일'], cellSuffix: ')', trigger: '법령/지침 개정', final: '부문대표', status: '정상' },
        { no: 9, risk: '외부 자문 이해상충 노출', cellText: 'CFT 총괄', cellMembers: ['이철승', '권순일', '강순용'], cellSuffix: '', trigger: '감정평가 5% 차이', final: '부문대표', status: '정상', hideNames: true },
        { no: 10, risk: '평판/미디어 리스크', cellText: 'CFT 총괄', cellMembers: ['이철승', '권순일', '강순용'], cellSuffix: '', trigger: '외부 매체 보도', final: '부문대표', status: '정상', hideNames: true },
    ];

    const renderCell = (text, members, suffix, hideNames = false) => {
        return (
            <div className="flex items-center gap-[12px]">
                {members.length > 0 && (
                    <div className="flex -space-x-2 shrink-0">
                        {members.map((name, idx) => (
                            <div key={idx} className="w-[36px] h-[36px] rounded-full overflow-hidden bg-[#3c3c3c] border border-[#1A1A1A] relative z-[1]">
                                <img src={`${import.meta.env.BASE_URL}${name}.webp`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                            </div>
                        ))}
                    </div>
                )}
                <div className="leading-snug whitespace-normal">
                    {text}
                    {!hideNames && members.map((name, idx) => (
                        <React.Fragment key={idx}>
                            <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">{name}</span>
                            {idx < members.length - 1 && '·'}
                        </React.Fragment>
                    ))}
                    {!hideNames && suffix}
                </div>
            </div>
        );
    };

    useEffect(() => {
        const fetchKpis = async () => {
            const { data, error } = await supabase
                .from('iota_workspace_kpis')
                .select('*')
                .eq('project_id', 'IOTA_SEOUL')
                .single();
                
            if (data && !error) {
                setKpiData(data);
            }
        };
        fetchKpis();
    }, []);

    const toggleDecisionExpand = (id) => {
        setExpandedDecisions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full flex-1 flex flex-col pt-[48px] pb-[200px] max-w-[1200px] mx-auto">
            {/* Header & Team Structure */}
            <div className="w-full flex justify-between items-center mb-[40px] gap-[40px]">
                {/* Header Metadata */}
                <div className="shrink-0 max-w-[300px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">사업 PM</h1>
                    <p className="text-[15px] text-[#86868B] leading-[24px]">전체 사업 일정 및 예산 통제, 변경관리 결정</p>
                </div>
                
                {/* PM Team Structure */}
                <div className="border border-[#333] rounded-[24px] flex items-center bg-transparent overflow-x-auto hide-scrollbar max-w-[700px] pl-[20px] pr-[10px] py-[10px]">
                    
                    <div className="flex items-center shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B] mr-[16px]">Co-PM</span>
                        
                        <div className="flex items-center gap-[12px]">
                            {/* 권순일 */}
                            <div className="flex items-center gap-[6px]">
                                <div className="relative w-[28px] h-[28px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}권순일.webp`} alt="권순일" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                </div>
                                <span className="text-white font-bold text-[13px]">권순일</span>
                            </div>
                            {/* 강순용 */}
                            <div className="flex items-center gap-[6px]">
                                <div className="relative w-[28px] h-[28px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}강순용.webp`} alt="강순용" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                </div>
                                <span className="text-white font-bold text-[13px]">강순용</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-px h-[20px] bg-[#333] mx-[16px] shrink-0"></div>

                    <div className="flex items-center gap-[6px] shrink-0">
                        {['윤주형', '김제익', '류홍', '박만진', '박일훈', '이정원', '전무경', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정'].map(name => (
                            <div key={name} className="flex items-center gap-[6px] bg-[#222] border border-[#333] rounded-full pl-[4px] pr-[10px] py-[4px] min-w-[76px] shrink-0">
                                <div className="w-[21px] h-[21px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}${name}.webp`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                </div>
                                <span className="text-[#E5E5E5] text-[12px] font-medium leading-none">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            <WorkspaceActivityLog workspaceCode="WS_PM" workspaceLabel="사업 PM" />

            {/* Top 10 Risks Board */}
            <h2 className="text-[18px] font-bold text-white mb-[12px]">Top 10 리스크 모니터링</h2>
            <div className="w-full bg-transparent border border-[#333] rounded-[24px] overflow-hidden mb-[40px]">
                <table className="w-full text-left">
                    <thead className="bg-transparent">
                        <tr>
                            <th className="px-[16px] py-[16px] text-[15px] font-bold text-[#555] border-b border-[#333] w-[50px] text-center">#</th>
                            <th className="pl-[4px] pr-[24px] py-[16px] text-[15px] font-bold text-[#86868B] border-b border-[#333] border-r border-[#333] w-[300px]">리스크</th>
                            <th className="px-[24px] py-[16px] text-[15px] font-bold text-[#E5E5E5] border-b border-[#333] border-r border-[#333] w-[240px]">1차 대응 셀</th>
                            <th className="px-[24px] py-[16px] text-[15px] font-bold text-[#e11d48] border-b border-[#333] border-r border-[#333] w-[200px]">트리거</th>
                            <th className="px-[24px] py-[16px] text-[15px] font-bold text-white border-b border-[#333] border-r border-[#333] w-[130px] text-center">최종 책임</th>
                            <th className="px-[24px] py-[16px] text-[15px] font-bold text-[#86868B] border-b border-[#333] w-[120px] text-center">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {riskData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[16px] py-[16px] text-[15px] font-bold text-[#555] text-center">{row.no}</td>
                                <td className="pl-[4px] pr-[24px] py-[16px] text-[16px] font-bold text-white border-r border-[#333]">{row.risk}</td>
                                <td className="px-[24px] py-[16px] text-[15px] text-white border-r border-[#333]">{renderCell(row.cellText, row.cellMembers, row.cellSuffix, row.hideNames)}</td>
                                <td className="px-[24px] py-[16px] text-[15px] font-medium text-[#c3c2b7] border-r border-[#333]">{row.trigger}</td>
                                <td className="px-[24px] py-[16px] text-[15px] font-bold text-white border-r border-[#333] text-center">{row.final}</td>
                                <td className="px-[24px] py-[16px] text-center">
                                    <div className="inline-flex items-center justify-center bg-black rounded-[12px] px-[12px] py-[6px]">
                                        <span className={`text-[13px] font-bold ${row.status === '주의' ? 'text-[#f59e0b]' : 'text-[#2997FF]'}`}>{row.status}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}