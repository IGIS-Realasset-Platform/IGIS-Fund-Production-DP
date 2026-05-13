const fs = require('fs');
let code = fs.readFileSync('src/components/system/shared/IotaTwo816DetailCard.jsx', 'utf8');

code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");

code = code.replace("const VehicleDetailCard = ({ id, vehicleId, title, totalAmountStr, data, toggleContent, onInstClick }) => {", "const IotaTwo816DetailCard = ({ id, vehicleId, title, totalAmountStr, dbData, historyData, toggleContent, onInstClick }) => {\n    const data = dbData || {};\n    const [isAccordionOpen, setIsAccordionOpen] = useState(false);");

code = code.replace("export default VehicleDetailCard;", "export default IotaTwo816DetailCard;");

const accordionCode = `
            {/* Accordion History */}
            <AnimatePresence>
                {isAccordionOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden mb-[20px]"
                    >
                        <div className="bg-[#1C1C1E] border border-[#3C3C3C] rounded-[24px] p-6 mt-[6px]">
                            <h3 className="text-[18px] font-bold text-white mb-4">Phase별 사업계획 및 현황 변경 이력</h3>
                            <div className="w-full overflow-x-auto custom-scrollbar pb-4">
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
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
`;

// Replace the Visual Tranche Bar to wrap it in a clickable overlay
const oldBarStart = '{/* Visual Tranche Bar */}';
const newBarStart = `
            {/* Visual Tranche Bar wrapped in Accordion Trigger */}
            <div 
                className="w-full mb-[20px] cursor-pointer relative group"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
                <div className="absolute inset-0 bg-[#292928]/50 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none flex items-center justify-center">
                    <span className="text-white font-bold tracking-widest text-[14px]">
                        {isAccordionOpen ? '상세 연혁 닫기' : '상세 연혁 보기'}
                    </span>
                </div>
                <div className="w-full transition-opacity group-hover:opacity-10">
`;

code = code.replace(oldBarStart, newBarStart);

// We need to close the two divs we just opened after the visual bar ends
// It ends right before `<div className="bg-[#292928] rounded-[32px] px-[32px] pt-[32px] pb-[20px] flex flex-col">`
const detailBlockStart = '<div className="bg-[#292928] rounded-[32px] px-[32px] pt-[32px] pb-[20px] flex flex-col">';
code = code.replace(detailBlockStart, `                </div>\n            </div>\n\n${accordionCode}\n\n            ${detailBlockStart}`);

fs.writeFileSync('src/components/system/shared/IotaTwo816DetailCard.jsx', code);
