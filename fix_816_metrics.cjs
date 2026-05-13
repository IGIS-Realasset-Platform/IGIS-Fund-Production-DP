const fs = require('fs');
const filePath = 'src/components/system/shared/IotaTwo816DetailCard.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add metrics calculations at the start of the component
const componentStart = 'const IotaTwo816DetailCard = ({ id, vehicleId, title, totalAmountStr, dbData, historyData, toggleContent }) => {\n';
const metricsCode = `
    const gfa = '36,537평';
    const officeArea = '15,529평';
    const retailArea = '1,022평';
    const hotelArea = '-평';
    const targetIrr = '8.2%';

    const costData = { uw: '6,500억', asis: '8,200억', uwPyeong: '1,780 만원/평', asisPyeong: '2,244 만원/평' };
    const revenueData = { uw: '7,800억', asis: '9,500억', uwPyeong: '2,135 만원/평', asisPyeong: '2,600 만원/평' };
    const periodData = { uwMonths: '50M', asisMonths: '74M', uwDate: 'UW 2021.10', asisDate: 'As-is 2025.08' };
    const enocData = { uw: '18.5만원', asis: '24.3만원', uwDate: '2026년 기준', asisDate: '2029년 기준' };
    const irrEmData = { uwEm: 'EM x1.45', asisEm: 'EM x1.41' };
`;
code = code.replace(componentStart, componentStart + metricsCode);

// 2. Insert the Dashboard Metrics Box right after the Title row
const titleRowEnd = `                    {toggleContent && toggleContent}
                </div>
            </div>`;

const dashboardMetricsBox = `
            {/* Dashboard Metrics Cards */}
            <div className="w-full p-[6px] border border-[#333] rounded-[38px] flex flex-col gap-[6px] mb-[20px]">
                <div 
                    className="w-full flex gap-[6px] cursor-pointer hover:opacity-90 transition-opacity relative group"
                    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                >
                    <div className="absolute inset-0 bg-[#292928]/50 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none flex items-center justify-center">
                        <span className="text-white font-bold tracking-tight text-[15px] bg-[#1a1a1c]/80 px-4 py-2 rounded-full border border-[#444] shadow-lg backdrop-blur-sm">
                            {isAccordionOpen ? '상세 표 닫기 ▲' : '개발 단계별 핵심 지표 상세 표 보기 ▼'}
                        </span>
                    </div>

                    <div className="w-[390px] h-[274px] flex flex-col gap-[6px]">
                        <div className="w-full flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] pr-6 flex flex-row items-center transition-colors duration-300">
                            <div className="w-[114px] flex flex-col justify-between border-r border-[#444]/50 h-[54px] pl-[24px]">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">공급 예정</span>
                                <span className="text-[28px] font-bold text-white tracking-tight leading-none mt-[-2px] whitespace-nowrap">2029</span>
                            </div>
                            <div className="w-[100px] flex flex-col justify-between border-r border-[#444]/50 h-[54px] pl-[18px]">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">Brand</span>
                                <img src="/iota-logo.png" alt="IOTA" className="h-[22px] object-contain object-left mt-0 opacity-100 mb-[4px]" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between h-[54px] pl-[20px] overflow-hidden">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">연면적</span>
                                <span className="text-[28px] font-bold text-white tracking-tight leading-none mt-[-2px] whitespace-nowrap">{gfa}</span>
                            </div>
                        </div>

                        <div className="w-full flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] px-6 pb-[8px] flex flex-row items-center transition-colors duration-300">
                            <div className="flex-[1.4] flex flex-col justify-center border-r border-[#444]/50 h-[74px] pr-5">
                                <span className="text-[14px] font-bold text-[#86868B] mb-[10px] font-['Inter']">개발기간</span>
                                <div className="flex items-center justify-start gap-[10px] mb-[4px]">
                                    <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{periodData.uwMonths}</span>
                                    <span className="text-[20px] text-[#666] leading-none mb-1 font-bold">→</span>
                                    <span className="text-[28px] font-bold text-white tracking-tighter leading-none">{periodData.asisMonths}</span>
                                </div>
                                <div className="flex justify-start gap-[24px] w-full">
                                    <span className="text-[11px] text-[#666] font-['Inter'] leading-none">{periodData.uwDate}</span>
                                    <span className="text-[11px] text-[#A1A1AA] font-['Inter'] leading-none">{periodData.asisDate}</span>
                                </div>
                            </div>
                            <div className="flex-[1] flex flex-col justify-center pl-6 h-[74px]">
                                <span className="text-[14px] font-bold text-[#86868B] mb-[10px] font-['Inter']">전용면적</span>
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] text-[#86868B] leading-none">업무</span>
                                        <span className="text-[16px] font-bold text-white leading-none">{officeArea}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] text-[#86868B] leading-none">리테일</span>
                                        <span className="text-[16px] font-bold text-white leading-none">{retailArea}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 h-[274px] bg-[#292928] border border-[#3c3c3c] rounded-[32px] overflow-hidden relative flex flex-col transition-colors duration-300">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#3C3C3C] z-0" />
                        <div className="absolute top-[0px] bottom-[0px] left-1/2 w-px bg-[#3C3C3C] z-0" />
                        
                        <div className="grid grid-cols-2 grid-rows-2 w-full h-full relative z-10">
                            <div className="relative flex flex-col justify-end px-[32px] pb-[32px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">원가</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{periodData.uwDate}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px]">{costData.uwPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{costData.uw}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{periodData.asisDate}</span>
                                        <span className="text-[13px] text-white mb-[6px] whitespace-nowrap">{costData.asisPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{costData.asis}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative flex flex-col justify-end px-[32px] pb-[32px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">매각 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{periodData.uwDate}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px]">{revenueData.uwPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{revenueData.uw}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{periodData.asisDate}</span>
                                        <span className="text-[13px] text-white mb-[6px] whitespace-nowrap"><span className="text-[#86868B] font-['Inter'] mr-1 tracking-tight">Target</span>{revenueData.asisPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{revenueData.asis}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex flex-col justify-end px-[32px] pb-[34px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">수익률 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{periodData.uwDate}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px] font-['Inter']">{irrEmData.uwEm}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none font-['Inter']">IRR {targetIrr}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{periodData.asisDate}</span>
                                        <span className="text-[13px] text-white mb-[6px] font-['Inter'] whitespace-nowrap"><span className="text-[#86868B] mr-1 tracking-tight">Target</span>{irrEmData.asisEm}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none font-['Inter'] whitespace-nowrap">IRR {targetIrr}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex flex-col justify-end px-[32px] pb-[34px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">E.NOC 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{enocData.uwDate}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px] opacity-0">-</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{enocData.uw}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{enocData.asisDate}</span>
                                        <span className="text-[13px] text-white mb-[6px] opacity-0 whitespace-nowrap">-</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{enocData.asis}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
`;
code = code.replace(titleRowEnd, titleRowEnd + "\n" + dashboardMetricsBox);

// 3. Remove the Accordion Trigger from the Visual Tranche Bar, since the Dashboard Metrics Box is now the trigger.
// And move the Accordion inside the wrapper, exactly like 427!
// Actually, let's keep the Accordion exactly where it is for now (between Dashboard Metrics and Visual Tranche Bar).
// I just need to remove the onClick from Visual Tranche Bar and its absolute "상세 연혁 닫기" overlay.
const visualTrancheTriggerStart = `<div 
                className="w-full mb-[20px] cursor-pointer relative group"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
                <div className="absolute inset-0 bg-[#292928]/50 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none flex items-center justify-center">
                    <span className="text-white font-bold tracking-widest text-[14px]">
                        {isAccordionOpen ? '상세 연혁 닫기' : '상세 연혁 보기'}
                    </span>
                </div>
                <div className="w-full transition-opacity group-hover:opacity-10">`;

const visualTrancheClean = `<div className="w-full mb-[20px] relative">
                <div className="w-full">`;

code = code.replace(visualTrancheTriggerStart, visualTrancheClean);

// Fix the closing divs
code = code.replace(
`                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>

                </div>
            </div>`,
`                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>
            </div>`
);

// We need to close the `w-full p-[6px] border border-[#333] rounded-[38px] flex flex-col gap-[6px] mb-[20px]` div right after the accordion!
// Wait, the Accordion History code is right after `</div> </div>`.
const accordionCodeStart = `            {/* Accordion History */}`;
const accordionCodeEnd = `                )}
            </AnimatePresence>`;

// Wrap the Accordion and Visual Tranche bar in the Dashboard Metrics container? No, in 427, the accordion is INSIDE the rounded-[38px] container.
// Let's modify the code to properly close the rounded-[38px] container AFTER the accordion.

// Actually, it's easier to just append `</div>` after the accordion.
code = code.replace(accordionCodeEnd, accordionCodeEnd + "\n            </div> {/* Close Dashboard Metrics Box Container */} \n");

fs.writeFileSync(filePath, code, 'utf8');
console.log("Updated IotaTwo816DetailCard.jsx");
