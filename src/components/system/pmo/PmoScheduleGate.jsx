import React from 'react';

const COLUMNS = [
    { key: 'm06', label: '~2026.06' },
    { key: 'm07', label: '2026.07' },
    { key: 'm08', label: '2026.08' },
    { key: 'm09', label: '2026.09' },
    { key: 'm10', label: '2026.10' },
    { key: 'm11', label: '2026.11 PF 1차' },
    { key: 'm03', label: '2027.03 PF 2차' },
    { key: 'const_start', label: '2027~착공' },
    { key: 'const_mid', label: '공사~준공' },
    { key: 'take_out', label: 'Take-out/운영' }
];

const TIMELINE_DATA = [
    // Gates
    { category: 'Gate', name: 'G0 현황정리', desc: '업무원장·카테고리·우선순위 기준 확정', lead: '사업관리2파트', coop: '전 부서', schedule: { m06: '●', m07: '●' } },
    { category: 'Gate', name: 'G1 방향결정', desc: '단독/통합 PF 방향, 호텔 브랜드, 시공사 조건 결정', lead: '사업관리2파트', coop: 'LFC;기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●' } },
    { category: 'Gate', name: 'G2 PF준비도', desc: '인허가·도면·임차·금융·법무 CP 준비', lead: '사업관리2파트', coop: '전 부서', schedule: { m07: '●', m08: '●', m09: '●', m10: '●' } },
    { category: 'Gate', name: 'G3 PF실행', desc: '427/816 단독 또는 통합 PF 실행', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m09: '●', m10: '●', m11: '◆', m03: '◆' } },
    { category: 'Gate', name: 'G4 착공/공사', desc: '착공조건, 책임착공, 공정관리 체계 전환', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { m03: '●', const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G5 준공/사용승인', desc: '준공 CP, 사용승인, 리스크 증빙자료 관리', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G6 담보대출/운영전환', desc: 'Take-out, 운영전환, 임대 안정화, 자산관리', lead: '사업관리2파트', coop: '공간솔루션실;기업마케팅실', schedule: { const_mid: '●', take_out: '◆' } },
    // Functions
    { category: 'Task', name: '인허가', desc: '현금기부채납·소공원로·변경인가·사용승인', lead: '개발관리실', coop: '사업관리2파트;', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '호텔', desc: '브랜드·운영계약·운영수지·FF&E', lead: '사업관리2파트', coop: '기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', const_mid: '●' } },
    { category: 'Task', name: '시공/원가', desc: '현대/삼성 도급조건·공사비·신용공여', lead: '사업관리2파트', coop: '개발관리실;LFC', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '도면/설계', desc: 'PF 기준도면·면적표·실사자료', lead: '개발관리실', coop: '기업마케팅실;공간솔루션실', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '임차/마케팅', desc: '광장·KB·삼성/이지스·선임차', lead: '사업관리2파트', coop: '기업마케팅실; 공간솔루션실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: 'PF/금융', desc: 'Term Sheet·대주단·재무모델·CP', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', take_out: '◆' } },
    { category: 'Task', name: '법무/세무/구조', desc: '리츠·Asset/Share·합병·주주승인', lead: '법무/세무 외부자문', coop: '사업관리2파트;LFC', schedule: { m06: '●', m07: '●', m08: '●', m09: '●' } },
    { category: 'Task', name: '팝업업무', desc: '단발 요청 접수/위임/보류/반려', lead: '사업관리2파트', coop: '요청부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '●', m03: '●', const_start: '●', const_mid: '●', take_out: '●' } }
];

export default function PmoScheduleGate() {
    const [filterCategory, setFilterCategory] = React.useState('All'); // All, Gate, Task

    const filteredData = TIMELINE_DATA.filter(item => {
        if (filterCategory === 'All') return true;
        return item.category === filterCategory;
    });

    return (
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto select-none font-sans text-white">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[32px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">타임라인</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">Gate별 통제 마일스톤 및 주요 R&R 기능의 일정 트래커</p>
                </div>
                
                {/* Segmented Filter */}
                <div className="flex items-center bg-[#222] border border-[#333] rounded-[8px] p-[4px]">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'All' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        전체보기
                    </button>
                    <button
                        onClick={() => setFilterCategory('Gate')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Gate' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        의사결정 Gate
                    </button>
                    <button
                        onClick={() => setFilterCategory('Task')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Task' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        기능별 업무
                    </button>
                </div>
            </div>

            {/* Legend info panel */}
            <div className="w-full bg-[#272726]/60 border border-[#3c3c3c] rounded-[16px] px-6 py-4 flex items-center justify-between mb-6">
                <span className="text-[13px] text-[#86868B] font-medium">💡 일정의 최종 목표는 준공 및 Take-out/운영 전환이며, 각 업무는 Gate에서 멈춤/전환/상향보고 여부를 결정합니다.</span>
                <div className="flex items-center gap-4 shrink-0 text-[12px] font-bold">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                        <span className="text-[#E5E5E5]">● 수행 진행 기간</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#F59E0B] font-mono text-[14px] leading-none">◆</span>
                        <span className="text-[#E5E5E5]">◆ 의사결정 / 마일스톤 달성</span>
                    </div>
                </div>
            </div>

            {/* Timeline Matrix Grid */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden">
                <div className="w-full overflow-x-auto pr-[50px] custom-thin-scrollbar">
                    <div className="flex items-center min-w-[2600px]">
                        <table className="text-left table-fixed min-w-[1700px] flex-1">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="pl-6 w-[140px]">구분</th>
                                    <th className="pl-4 w-[280px]">세부업무</th>
                                    <th className="pl-4 w-[120px]">주관</th>
                                    <th className="pl-4 w-[160px]">협업</th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="text-center font-mono text-[11px] leading-tight px-1 font-bold w-[90px]">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c] text-[13px]">
                                {filteredData.map((item, idx) => {
                                    const isGate = item.category === 'Gate';
                                    return (
                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-14">
                                            {/* 구분 */}
                                            <td className="pl-6 font-bold">
                                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {item.name}
                                                </span>
                                            </td>
                                            
                                            {/* 세부업무 */}
                                            <td className="pl-4 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-all">
                                                {item.desc}
                                            </td>
                                            
                                            {/* 주관 */}
                                            <td className="pl-4 text-[#E5E5E5] font-semibold text-left">
                                                {item.lead}
                                            </td>
                                            
                                            {/* 협업 */}
                                            <td className="pl-4 text-[#86868B] leading-tight text-left pr-2 whitespace-normal break-all">
                                                {item.coop.split(';').map((c, cIdx) => (
                                                    c && <div key={cIdx} className="text-[11px]">{c}</div>
                                                ))}
                                            </td>

                                            {/* Grid Columns */}
                                            {COLUMNS.map(col => {
                                                const mark = item.schedule[col.key];
                                                return (
                                                    <td key={col.key} className="text-center">
                                                        {mark === '●' && (
                                                            <span className="w-3.5 h-3.5 rounded-full bg-[#2997ff] inline-block shadow-sm shadow-[#2997ff]/20"></span>
                                                        )}
                                                        {mark === '◆' && (
                                                            <span className="text-[#F59E0B] font-mono text-[16px] font-bold block translate-y-[-1px] animate-pulse">◆</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* 우측 워터마크 영역 */}
                        <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                            <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                Cross Functional<br />IOTA Seoul<br />Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
