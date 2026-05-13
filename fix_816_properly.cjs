const fs = require('fs');
const src = 'src/components/system/shared/IotaOne427DetailCard.jsx';
const dest = 'src/components/system/shared/IotaTwo816DetailCard.jsx';

let code = fs.readFileSync(src, 'utf8');

// 1. Rename Component
code = code.replace(/IotaOne427DetailCard/g, 'IotaTwo816DetailCard');

// 2. Change hardcoded metrics
const oldMetrics = `    const baseMetrics = {
        period: '68M', title: '최초UW', subtitle: '2021.11',
        cost: '2조 9,044억', costPyeong: '2,832 만원/평',
        revenue: '3조 2,907억', revenuePyeong: '3,209 만원/평',
        profit: '2,962억원', margin: '이익률 9.0%',
        enoc: 'TBD'
    };
    const curMetrics = {
        period: '122M', title: '본PF 1차', subtitle: '2025.05',
        completionYear: '2032', gfa: '102,124평', officeArea: '34,470평', retailArea: '1,569평', hotelArea: '5,121평',
        cost: '4조 9,751억', costPyeong: '4,851 만원/평',
        revenue: '5조 3,288억', revenuePyeong: '5,196 만원/평',
        profit: '3,536억원', margin: '이익률 6.6%',
        enoc: 'TBD'
    };`;

const newMetrics = `    const baseMetrics = {
        period: '50M', title: '최초UW', subtitle: '2021.10',
        cost: '6,500억', costPyeong: '1,780 만원/평',
        revenue: '7,800억', revenuePyeong: '2,135 만원/평',
        profit: '1,300억원', margin: '이익률 16.6%',
        enoc: '18.5만원'
    };
    const curMetrics = {
        period: '74M', title: '현재예상', subtitle: '2025.08',
        completionYear: '2029', gfa: '36,537평', officeArea: '15,529평', retailArea: '1,022평', hotelArea: '-평',
        cost: '8,200억', costPyeong: '2,244 만원/평',
        revenue: '9,500억', revenuePyeong: '2,600 만원/평',
        profit: '1,300억원', margin: '이익률 13.6%',
        enoc: '24.3만원'
    };`;

code = code.replace(oldMetrics, newMetrics);

// 3. Update the data mappings. IotaTwo816 uses historyData which is passed as a prop!
// Wait, `IotaOne427DetailCard` has `dbData` passed to it, and defines `historyData` internally?
// No, `IotaOne427DetailCard` has the `table` hardcoded!

const oldAccordionStart = `<div className="overflow-x-auto custom-scrollbar pb-2">
                                    <table className="w-full text-left border-collapse border-y-[2px] border-t-[#666] border-b-[#444] min-w-[1000px]">`;
const oldAccordionEnd = `                                    </table>
                                </div>`;

// Wait, I don't want to use regular expressions for this multiline replace if I can just slice it!
const accStartIndex = code.indexOf(oldAccordionStart);
const accEndIndex = code.indexOf(oldAccordionEnd) + oldAccordionEnd.length;

const newAccordion = `<div className="w-full overflow-x-auto custom-scrollbar pb-4">
                                <div className="min-w-max border border-[#3C3C3C] rounded-lg overflow-hidden bg-[#242426]">
                                    <div className="flex border-b border-[#3C3C3C] bg-[#2C2C2E]">
                                        <div className="w-[180px] p-3 border-r border-[#3C3C3C] font-bold text-[#86868B] text-[13px] shrink-0 flex items-center">지표 구분</div>
                                        <div className="w-[280px] p-3 border-r border-[#3C3C3C] font-bold text-[#E5E5E5] text-[13px] shrink-0">Phase 1: PFV 설립 / 계약금 납입<br/><span className="text-[#86868B] font-normal">(2023.01 / 4차 심의 기준)</span></div>
                                        <div className="w-[280px] p-3 border-r border-[#3C3C3C] font-bold text-[#E5E5E5] text-[13px] shrink-0">Phase 2: 정비계획 변경 / 연면적 상향<br/><span className="text-[#86868B] font-normal">(2023.09~11 / 5차 심의 기준)</span></div>
                                        <div className="w-[280px] p-3 border-r border-[#3C3C3C] font-bold text-[#E5E5E5] text-[13px] shrink-0">Phase 3: 자산매입 완료 / 거래 연기<br/><span className="text-[#86868B] font-normal">(2024.03 / KPMG 타당성 기준)</span></div>
                                        <div className="w-[280px] p-3 border-r border-[#3C3C3C] font-bold text-[#E5E5E5] text-[13px] shrink-0">Phase 4: 본 PF 지연 / 3차 BL 연장<br/><span className="text-[#86868B] font-normal">(2025.10 / 리스크심의 기준)</span></div>
                                        <div className="w-[280px] p-3 font-bold text-[#E5E5E5] text-[13px] shrink-0">Phase 5: EOD 발생, 긴급 수혈 / 리파이낸싱<br/><span className="text-[#86868B] font-normal">(2026.01~04 / 최종안)</span></div>
                                    </div>
                                    {historyData && historyData.length > 0 ? historyData.map((row, index) => (
                                        <div key={index} className={\`flex border-b border-[#3C3C3C] hover:bg-[#2A2A2C] transition-colors \${index === historyData.length - 1 ? 'border-b-0' : ''}\`}>
                                            <div className="w-[180px] p-3 border-r border-[#3C3C3C] font-bold text-[#86868B] text-[13px] shrink-0 flex items-center bg-[#28282A]">{row.category}</div>
                                            <div className="w-[280px] p-3 border-r border-[#3C3C3C] text-[#D1D1D6] text-[13px] leading-snug shrink-0 whitespace-pre-wrap">{row.phase1}</div>
                                            <div className="w-[280px] p-3 border-r border-[#3C3C3C] text-[#D1D1D6] text-[13px] leading-snug shrink-0 whitespace-pre-wrap">{row.phase2}</div>
                                            <div className="w-[280px] p-3 border-r border-[#3C3C3C] text-[#D1D1D6] text-[13px] leading-snug shrink-0 whitespace-pre-wrap">{row.phase3}</div>
                                            <div className="w-[280px] p-3 border-r border-[#3C3C3C] text-[#D1D1D6] text-[13px] leading-snug shrink-0 whitespace-pre-wrap">{row.phase4}</div>
                                            <div className="w-[280px] p-3 text-[#D1D1D6] text-[13px] leading-snug shrink-0 whitespace-pre-wrap">{row.phase5}</div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-[#86868B] text-[14px]">
                                            데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>`;

code = code.slice(0, accStartIndex) + newAccordion + code.slice(accEndIndex);

// Add historyData to props!
code = code.replace(
    `const IotaTwo816DetailCard = ({ id, vehicleId, title, dbData, navigateTo, externalPhase, setExternalPhase }) => {`,
    `const IotaTwo816DetailCard = ({ id, vehicleId, title, dbData, historyData, navigateTo, externalPhase, setExternalPhase }) => {`
);

// Fix the activePhase check logic. For 816 we don't have activePhase, but let's keep it to return dbData
const oldGetActive = `    const getActiveData = () => {
        if (activePhase === 'phase1') return dbData?.['Phase1'] || {};
        if (activePhase === 'phase2') return dbData?.['Phase2'] || {};
        if (activePhase === 'phase3') return dbData?.['Bridge'] || {};
        if (activePhase === 'phase4') return dbData?.['Refinancing'] || {};
        return {};
    };`;

const newGetActive = `    const getActiveData = () => {
        return dbData || {};
    };`;
code = code.replace(oldGetActive, newGetActive);

fs.writeFileSync(dest, code, 'utf8');
console.log("Successfully created IotaTwo816DetailCard.jsx from 427 template");
