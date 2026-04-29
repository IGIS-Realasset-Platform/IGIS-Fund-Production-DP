import React from 'react';

const VEHICLES = [
    {
        id: '816',
        name: 'IOTA Seoul 2',
        sub: '816 PFV',
        status: '개발중',
        priority: 'High',
        priorityColor: '#e11d48',
        isMain: true,
        metrics: [
            { label: '원가', uw: '1조 6,000억', uwSub: '4,380만원/평', actual: '2조 1,964억', actualSub: '6,053만원/평', highlight: true },
            { label: '매각 목표', uw: '1조 8,070억', uwSub: '4,600만원/평', actual: '2조 3,749억', actualSub: '6,500만원/평', highlight: true },
            { label: 'IRR / EM', uw: '10.5% / x1.75', actual: 'Target 10.5% / x1.73', highlight: false },
        ],
        issue: 'KB증권 리파이낸싱 부결 → 메리츠+NH 구조 협의 중',
    },
    {
        id: '427',
        name: 'IOTA Seoul 1',
        sub: '427 PFV',
        status: '개발 준비',
        priority: 'High',
        priorityColor: '#e11d48',
        isMain: false,
        metrics: [
            { label: '원가', uw: '7,200억', uwSub: '3,850만원/평', actual: '8,100억', actualSub: '4,330만원/평', highlight: true },
            { label: '매각 목표', uw: '8,500억', uwSub: '4,550만원/평', actual: '9,600억', actualSub: '5,130만원/평', highlight: true },
            { label: 'IRR / EM', uw: '12.1% / x1.85', actual: 'Target 11.5% / x1.80', highlight: false },
        ],
        issue: '힐튼 재개발 IPR 통합 리츠 구조 연계 검토 중',
    },
    {
        id: '421',
        name: '이지스 421호',
        sub: '부동산투자신탁',
        status: '운용중',
        priority: 'Medium',
        priorityColor: '#f59e0b',
        isMain: false,
        metrics: [
            { label: 'AUM', uw: null, actual: '3,850억', highlight: false },
            { label: '집행률', uw: null, actual: '75% (2,887억)', highlight: false },
            { label: 'IRR', uw: '목표 9.5%', actual: '추정 9.2%', highlight: false },
        ],
        issue: '자본콜 3차 완료 — 4차 예정 2026.09',
    },
    {
        id: 'ipr',
        name: 'IOTA Project REITs',
        sub: 'IPR — Stage 2 / 5',
        status: '설립 추진',
        priority: 'High',
        priorityColor: '#e11d48',
        isMain: false,
        metrics: [
            { label: '구조', uw: null, actual: 'Forward Purchase + 상장', highlight: false },
            { label: '목표 자산규모', uw: null, actual: '4.1조 (427 + 816)', highlight: true },
            { label: '설립 목표', uw: null, actual: '2027.Q1', highlight: false },
        ],
        issue: 'Stage 2: 구조설계 및 외부 자문 선정 진행 중',
    },
];

const D_DAYS = [
    { label: '통합 PF', date: '2027.02', days: 281, urgent: true },
    { label: 'IOTA1 착공', date: '2027.05', days: 371, urgent: false },
    { label: 'IOTA2 착공', date: '2028.06', days: 762, urgent: false },
    { label: '준공', date: '2032.08', days: 2312, urgent: false },
];

const MILESTONES = [
    { date: '2022.12', label: 'PFV설립', left: 0 },
    { date: '2024.03', label: '자산매입', left: 0.10 },
    { date: '2024.12', label: '통합심의 完', left: 0.17 },
    { date: '2025.04', label: '사업시행인가', left: 0.27 },
    { date: '2026.01', label: 'EOD', left: 0.40 },
    { type: 'now', date: 'NOW', left: 0.46 },
    { date: '2027.02', label: '통합PF', left: 0.55 },
    { date: '2027.05', label: 'IOTA1 착공', left: 0.66 },
    { date: '2028.06', label: 'IOTA2 착공', left: 0.79 },
    { date: '2032.08', label: '준공', left: 1.0 },
];

const CELLS = [
    { name: '사업PM', lead: '강순용', status: '진행', color: '#f59e0b', desc: '통합PF 구조 협의 진행 중' },
    { name: '파이낸싱', lead: '박준호', status: '지연', color: '#e11d48', desc: '메리츠+NH 리파이낸싱 구조 최종 협의' },
    { name: '개발관리', lead: '홍장군', status: '정상', color: '#22c55e', desc: '사업시행인가 완료, 착공 준비 대기' },
    { name: '기업마케팅', lead: '김민지', status: '진행', color: '#f59e0b', desc: '앵커 임차인 파이프라인 발굴 중' },
    { name: '상품·디지털', lead: '김현수', status: '진행', color: '#f59e0b', desc: 'IPR Stage 2 구조설계 및 자문 선정' },
];

const RISKS = [
    { tag: 'High', tagColor: '#e11d48', label: '리파이낸싱 지연', desc: 'KB증권 부결, 메리츠+NH 협의 장기화 위험' },
    { tag: 'High', tagColor: '#e11d48', label: '브릿지론 만기', desc: '통합PF 미체결 시 5차 연장 필요' },
    { tag: 'Med', tagColor: '#f59e0b', label: '착공 일정 슬리피지', desc: '2027.05 착공 목표 달성 불확실' },
];

const DECISIONS = [
    { date: '2026.04.15', text: 'KB증권 리파이낸싱 안 부결 — 메리츠+NH 대안 구조 진행 결정' },
    { date: '2026.03.28', text: '브릿지론 4차 연장 완료 — 소노인터내셔널 후순위 700억 확약 확보' },
    { date: '2026.02.10', text: 'IPR 통합 리츠 구조 연계 방안 T2 승인' },
];

function VehicleCard({ vehicle: v }) {
    return (
        <div className={`bg-[#292928] border rounded-[32px] px-[30px] py-[26px] flex flex-col cursor-pointer group hover:bg-[#2f2f2d] transition-colors duration-300 ${v.isMain ? 'border-[#fbf167]/25' : 'border-[#3c3c3c]'}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-[22px]">
                <div>
                    <div className="text-[20px] font-bold text-white tracking-tight leading-none">{v.name}</div>
                    <div className="text-[12px] text-[#86868B] font-['Inter'] mt-[5px]">{v.sub}</div>
                </div>
                <div className="flex items-center gap-[10px]">
                    <span className="text-[13px] text-[#A1A1AA]">{v.status}</span>
                    <span className="text-[11px] font-bold px-[8px] py-[2px] rounded-full border" style={{ color: v.priorityColor, borderColor: `${v.priorityColor}50` }}>{v.priority}</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-[16px] flex-1">
                {v.metrics.map((m, i) => (
                    <div key={i} className="flex items-end justify-between border-b border-[#333]/60 pb-[14px] last:border-0 last:pb-0">
                        <div className="flex flex-col">
                            <span className="text-[12px] text-[#86868B] font-['Inter'] mb-[2px]">{m.label}</span>
                            {m.uw && <span className="text-[13px] text-[#555] font-['Inter']">{m.uw}</span>}
                        </div>
                        <div className="flex items-center gap-[8px]">
                            {m.uw && <span className="text-[15px] text-[#444] font-bold">→</span>}
                            <span className={`text-[16px] font-bold font-['Inter'] ${m.highlight ? 'text-[#fbf167]' : 'text-white'}`}>{m.actual}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Issue Footer */}
            <div className="mt-[20px] pt-[16px] border-t border-[#3c3c3c]/60 flex items-center gap-[8px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#f59e0b] flex-shrink-0"></div>
                <span className="text-[12px] text-[#86868B] leading-snug">{v.issue}</span>
            </div>
        </div>
    );
}

export default function IotaDashboard() {
    return (
        <div className="flex-1 h-full bg-transparent flex flex-col relative font-sans text-[#E5E5E5] overflow-hidden">

            {/* Tab Bar */}
            <div className="relative z-[100] w-full h-[46px] flex items-end justify-between shrink-0 bg-[#1A1A1A]">
                <div className="flex h-full items-end pl-0">
                    <div className="flex items-center justify-between pl-6 pr-3 h-full cursor-pointer text-[#E5E5E5] bg-[#1F1F1E] relative">
                        <span className="text-[13px] font-medium tracking-wide mr-8">사업 개요</span>
                    </div>
                </div>
                <div className="px-5 h-full flex items-center bg-[#1A1A1A]">
                    <div className="text-[#86868B] hover:text-[#E5E5E5] cursor-pointer tracking-[3px] font-black text-[13px] transition-colors duration-300 pb-[2px] translate-y-[1px] translate-x-0.5">···</div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 w-full overflow-y-auto hide-scrollbar">
                <div className="w-[1200px] mx-auto pt-[60px] pb-[80px] flex flex-col">

                    {/* Title + Alert Row */}
                    <div className="flex items-end justify-between mb-[22px]">
                        <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] translate-x-[4px]">IOTA Seoul</h1>
                        <div className="flex items-center gap-[20px] -translate-x-[30px]">
                            <div className="flex items-center gap-[8px]">
                                <div className="w-[9px] h-[9px] rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[16px] font-bold text-[#f59e0b]">Watch</span>
                            </div>
                            <div className="w-px h-[18px] bg-[#333]"></div>
                            <span className="text-[15px] text-[#86868B] font-medium">Phase. 개발·조성 준비</span>
                            <div className="w-px h-[18px] bg-[#333]"></div>
                            <span className="text-[13px] text-[#555] font-['Inter']">기준일 2026.04.29</span>
                        </div>
                    </div>

                    {/* D-day Status Bar */}
                    <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[24px] h-[78px] flex items-center px-8 mb-[20px]">
                        {D_DAYS.map((d, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center flex-1 gap-[2px]">
                                    <span className="text-[12px] text-[#86868B] font-['Inter'] font-medium">{d.label}</span>
                                    <div className="flex items-baseline gap-[2px]">
                                        <span className="text-[12px] text-[#444] font-['Inter']">D-</span>
                                        <span className={`text-[26px] font-bold font-['Inter'] tracking-tighter leading-none ${d.urgent ? 'text-[#f59e0b]' : 'text-white'}`}>{d.days.toLocaleString()}</span>
                                    </div>
                                    <span className="text-[11px] text-[#555] font-['Inter']">{d.date}</span>
                                </div>
                                {i < D_DAYS.length - 1 && <div className="w-px h-[40px] bg-[#3c3c3c]"></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* 4 Vehicle Cards */}
                    <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                        {VEHICLES.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
                    </div>

                    {/* Timeline */}
                    <div className="w-full h-[120px] mb-[20px] relative group cursor-pointer rounded-[24px] hover:bg-[#242424] transition-colors duration-300 px-[40px] bg-[#292928] border border-[#3c3c3c]">
                        <div className="absolute top-[56px] left-[40px] right-[40px] h-px bg-[#444] group-hover:bg-[#666] transition-colors duration-300 z-0">
                            {MILESTONES.map((ms, i) => (
                                <div key={i} className={`absolute flex flex-col items-center justify-center top-1/2 -translate-y-1/2 -translate-x-1/2 ${ms.type === 'now' ? 'ml-[4px]' : ''}`} style={{ left: `${ms.left * 100}%` }}>
                                    <div className="absolute bottom-[20px] w-[120px] text-center pointer-events-none">
                                        <span className={`text-[12px] font-['Inter'] transition-colors duration-300 ${ms.type === 'now' ? 'font-bold text-[#c3c2b7]' : 'text-[#86868B] group-hover:text-[#A1A1AA]'}`}>{ms.date}</span>
                                    </div>
                                    <div className="relative z-10 flex items-center justify-center w-[14px] h-[14px]">
                                        {ms.type === 'now' ? (
                                            <div className="absolute w-[2px] h-[36px] border-l-[2px] border-dotted border-[#c3c2b7] -top-[14px] left-[6px]" />
                                        ) : (
                                            <div className="w-[12px] h-[12px] rounded-full bg-[#555] group-hover:bg-[#A1A1AA] transition-colors duration-300" />
                                        )}
                                    </div>
                                    <div className="absolute top-[22px] w-[140px] text-center pointer-events-none">
                                        <span className="text-[13px] font-medium text-[#A1A1AA] group-hover:text-white transition-colors duration-300 whitespace-nowrap">{ms.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: 5-Cell + Risks/Decisions */}
                    <div className="grid grid-cols-[1fr_400px] gap-[20px]">

                        {/* 5-Cell Status */}
                        <div className="bg-[#292928] border border-[#3c3c3c] rounded-[32px] px-[28px] py-[24px]">
                            <span className="text-[13px] font-bold text-[#86868B] font-['Inter'] block mb-[18px]">5-Cell 운영 현황</span>
                            <div className="flex flex-col gap-[14px]">
                                {CELLS.map((cell, i) => (
                                    <div key={i} className="flex items-center gap-[14px] group cursor-pointer">
                                        <div className="w-[7px] h-[7px] rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: cell.color, boxShadow: `0 0 6px ${cell.color}60` }}></div>
                                        <span className="text-[14px] font-bold text-white w-[88px] flex-shrink-0">{cell.name}</span>
                                        <span className="text-[13px] text-[#555] font-['Inter'] w-[56px] flex-shrink-0">{cell.lead}</span>
                                        <span className="text-[13px] text-[#A1A1AA] group-hover:text-white transition-colors">{cell.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right column: Risks + Decisions */}
                        <div className="flex flex-col gap-[20px]">

                            {/* Top Risks */}
                            <div className="bg-[#292928] border border-[#3c3c3c] rounded-[32px] px-[24px] py-[22px] flex-1">
                                <span className="text-[13px] font-bold text-[#86868B] font-['Inter'] block mb-[16px]">Top 리스크</span>
                                <div className="flex flex-col gap-[13px]">
                                    {RISKS.map((r, i) => (
                                        <div key={i} className="flex items-start gap-[10px]">
                                            <span className="text-[10px] font-bold px-[6px] py-[2px] rounded flex-shrink-0 mt-[2px]" style={{ color: r.tagColor, backgroundColor: `${r.tagColor}18`, border: `1px solid ${r.tagColor}30` }}>{r.tag}</span>
                                            <div>
                                                <span className="text-[13px] font-medium text-white block leading-tight">{r.label}</span>
                                                <span className="text-[12px] text-[#86868B] leading-snug">{r.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Decisions */}
                            <div className="bg-[#292928] border border-[#3c3c3c] rounded-[32px] px-[24px] py-[22px] flex-1">
                                <span className="text-[13px] font-bold text-[#86868B] font-['Inter'] block mb-[16px]">최근 의사결정</span>
                                <div className="flex flex-col gap-[14px]">
                                    {DECISIONS.map((d, i) => (
                                        <div key={i} className="flex flex-col gap-[3px] cursor-pointer group">
                                            <span className="text-[11px] text-[#555] font-['Inter']">{d.date}</span>
                                            <span className="text-[12px] text-[#A1A1AA] leading-snug group-hover:text-white transition-colors">{d.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
