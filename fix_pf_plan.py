import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Hint text up 1px
content = content.replace(
    '<p className="text-[12px] text-[#666] mt-[12px] ml-[8px]">금리·실행일·만기 입력 시 월별 발생액이 표시됩니다. (현재 UI 예시용 데이터 적용)</p>',
    '<p className="text-[12px] text-[#666] mt-[12px] ml-[8px] transform -translate-y-[1px]">금리·실행일·만기 입력 시 월별 발생액이 표시됩니다. (현재 UI 예시용 데이터 적용)</p>'
)

# 2. State & Data
new_data = """    const [selectedPfPlan, setSelectedPfPlan] = useState(null);
    
    const pfPlanData = [
        { id: "pf-plan-01", step: "01", name: "통합 PF 구조 확정", work: "427 본PF와 816 후속 PF를 통합 관점에서 연결", materials: "통합 자금구조표, 상환재원 표", counterparty: "주관기관 후보", target: "", next: "최종 엑셀 수령 후 구조표와 tranche sizing 연결" },
        { id: "pf-plan-02", step: "02", name: "Tranche sizing", work: "Senior, 중순위, 후순위, 주주대여금의 역할 구분", materials: "Capital stack, 대주별 조건표", counterparty: "대주단 / 증권사", target: "", next: "금액은 최종 엑셀 수령 후 반영" },
        { id: "pf-plan-03", step: "03", name: "주관·참여기관 협의", work: "대주단과의 구체적인 조건 협의", materials: "협의 메모, term sheet", counterparty: "KB, NH, 신한 등", target: "", next: "" },
        { id: "pf-plan-04", step: "04", name: "Term sheet 정리", work: "금융조건의 서면화 및 최종 조율", materials: "대출 조건표, 약정 주요 조건", counterparty: "대주단", target: "", next: "" },
        { id: "pf-plan-05", step: "05", name: "심의·승인 패키지", work: "대주단 내부 심의용 자료 작성", materials: "IM, 리스크심의, 사업계획, 모델", counterparty: "내부 심의 / 대주 심사", target: "", next: "" },
        { id: "pf-plan-06", step: "06", name: "약정서·담보 패키지", work: "대출약정서 및 제반 담보 계약 체결", materials: "약정서, 담보계약, 책임준공 관련 문서", counterparty: "법무 / 대주단 / 시공사", target: "", next: "" },
        { id: "pf-plan-07", step: "07", name: "기표 및 기존 대출 상환", work: "자금 집행 및 브릿지론 상환", materials: "기표 일정, 상환계획, 자금집행표", counterparty: "대리금융기관 / 대주단", target: "", next: "" }
    ];"""

import re
content = re.sub(
    r"    const pfPlanData = \[.*?\];",
    new_data,
    content,
    flags=re.DOTALL
)

# 3. Rewrite PF Conversion UI
old_pf_ui = """                    {/* 본 PF 계획(통합 PF) */}
                    <div className="w-full mb-[40px]">
                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">본 PF 계획(통합 PF)</h2>
                        <div className="w-full bg-transparent border border-[#3c3c3c] rounded-[24px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#222]">
                                        <th className="px-[20px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">단계</th>
                                        <th className="px-[20px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">업무</th>
                                        <th className="px-[20px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">필요 자료</th>
                                        <th className="px-[20px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">카운터파티</th>
                                        <th className="px-[20px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">목표 일정</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pfPlanData.map((item, idx) => (
                                        <tr key={idx} className="border-b border-[#333] last:border-b-0 hover:bg-[#252525] transition-colors cursor-pointer" onClick={() => alert(`${item.name} 상세 페이지 개발 예정`)}>
                                            <td className="px-[20px] py-[16px] text-[#E5E5E5] font-['Inter'] text-[14px]">STEP {item.step}</td>
                                            <td className="px-[20px] py-[16px] text-white font-bold text-[14px]">{item.name}</td>
                                            <td className="px-[20px] py-[16px] text-[#A1A1AA] text-[13px]">{item.materials}</td>
                                            <td className="px-[20px] py-[16px] text-[#A1A1AA] text-[13px]">{item.counterparty}</td>
                                            <td className="px-[20px] py-[16px] text-[#A1A1AA] text-[13px] font-['Inter']">{item.target}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>"""

new_pf_ui = """                    {/* 본 PF 계획(통합 PF) */}
                    <div className="w-full mb-[40px]">
                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">본 PF 계획(통합 PF)</h2>
                        
                        <div className="w-full bg-[#1A1A1A] border border-[#3c3c3c] rounded-[24px] overflow-hidden p-[32px]">
                            <div className="flex justify-between items-center mb-[24px]">
                                <strong className="text-white text-[16px] font-bold tracking-tight">본 PF 전환 준비사항</strong>
                                <span className="text-[#86868B] text-[13px] font-bold">통합 기준</span>
                            </div>
                            
                            {/* Stepper Rail */}
                            <div className="flex gap-[12px] overflow-x-auto pb-[20px] mb-[12px] scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                                {pfPlanData.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setSelectedPfPlan(item)}
                                        className={`flex-shrink-0 w-[180px] h-[90px] border ${idx === 1 ? 'border-[#86868B] bg-[#222]' : 'border-[#333] bg-[#151515] hover:bg-[#1f1f1f]'} rounded-[12px] p-[16px] flex flex-col justify-between cursor-pointer transition-colors`}
                                    >
                                        <div className="text-[11px] font-bold text-[#86868B] font-['Inter']">STEP {item.step}</div>
                                        <div className="text-[14px] font-bold text-white leading-tight break-keep">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">단계</th>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">업무</th>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">필요 자료</th>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">카운터파티</th>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c]">목표 일정</th>
                                        <th className="px-[12px] py-[16px] text-[#86868B] font-bold text-[13px] border-b border-[#3c3c3c] text-center w-[80px]">상세</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pfPlanData.map((item, idx) => (
                                        <tr key={idx} className="border-b border-[#333] last:border-b-0 hover:bg-[#252525] transition-colors cursor-pointer group" onClick={() => setSelectedPfPlan(item)}>
                                            <td className="px-[12px] py-[16px] text-[#E5E5E5] font-['Inter'] text-[14px]">{item.step}</td>
                                            <td className="px-[12px] py-[16px] text-white font-bold text-[14px]">{item.name}</td>
                                            <td className="px-[12px] py-[16px] text-[#A1A1AA] text-[13px]">{item.materials}</td>
                                            <td className="px-[12px] py-[16px] text-[#A1A1AA] text-[13px]">{item.counterparty}</td>
                                            <td className="px-[12px] py-[16px] text-[#A1A1AA] text-[13px] font-['Inter']">{item.target}</td>
                                            <td className="px-[12px] py-[16px] text-center">
                                                <button className="px-[14px] py-[6px] border border-[#444] text-[#A1A1AA] rounded-full text-[12px] group-hover:bg-[#333] group-hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedPfPlan(item); }}>상세</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>"""

content = content.replace(old_pf_ui, new_pf_ui)

# 4. Modal
modal_jsx = """            {/* PF Plan Modal */}
            {selectedPfPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPfPlan(null)}>
                    <div className="bg-[#151515] border border-[#333] rounded-[24px] w-full max-w-[480px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-[24px] border-b border-[#333] flex justify-between items-start">
                            <div>
                                <h3 className="text-[20px] font-bold text-white tracking-tight mb-[4px]">본 PF 계획 · STEP {selectedPfPlan.step}</h3>
                                <div className="text-[14px] text-[#86868B]">{selectedPfPlan.name}</div>
                            </div>
                            <button 
                                className="w-[32px] h-[32px] rounded-full border border-[#444] text-[#86868B] hover:text-white hover:bg-[#333] flex items-center justify-center transition-colors"
                                onClick={() => setSelectedPfPlan(null)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-[24px] overflow-y-auto flex flex-col gap-[16px]">
                            <div className="bg-[#1A1A1A] border border-[#333] rounded-[16px] p-[20px]">
                                <h4 className="text-[14px] font-bold text-white mb-[16px]">업무 정의</h4>
                                <div className="flex flex-col gap-[12px]">
                                    <div className="flex text-[13px]"><span className="text-[#86868B] w-[80px] shrink-0 font-medium">단계</span><span className="text-[#E5E5E5] font-['Inter']">{selectedPfPlan.step}</span></div>
                                    <div className="flex text-[13px]"><span className="text-[#86868B] w-[80px] shrink-0 font-medium">업무</span><span className="text-[#E5E5E5]">{selectedPfPlan.work || "-"}</span></div>
                                    <div className="flex text-[13px]"><span className="text-[#86868B] w-[80px] shrink-0 font-medium">필요 자료</span><span className="text-[#E5E5E5]">{selectedPfPlan.materials || "-"}</span></div>
                                    <div className="flex text-[13px]"><span className="text-[#86868B] w-[80px] shrink-0 font-medium">카운터파티</span><span className="text-[#E5E5E5]">{selectedPfPlan.counterparty || "-"}</span></div>
                                    <div className="flex text-[13px]"><span className="text-[#86868B] w-[80px] shrink-0 font-medium">목표 일정</span><span className="text-[#E5E5E5]">{selectedPfPlan.target || "-"}</span></div>
                                </div>
                            </div>
                            {selectedPfPlan.next && (
                                <div className="bg-[#1A1A1A] border border-[#333] rounded-[16px] p-[20px]">
                                    <h4 className="text-[14px] font-bold text-white mb-[8px]">다음 액션</h4>
                                    <p className="text-[13px] text-[#E5E5E5] leading-relaxed">{selectedPfPlan.next}</p>
                                </div>
                            )}
                            <div className="bg-[#1A1A1A] border border-[#333] rounded-[16px] p-[20px]">
                                <h4 className="text-[14px] font-bold text-white mb-[8px]">LFC 관리 포인트</h4>
                                <p className="text-[13px] text-[#E5E5E5] leading-relaxed">본 PF 계획은 통합 PF 기준의 준비 업무만 이 컴포넌트에서 관리하고, 세부 협의 이력은 상단 LFC 업무 로그에 남기는 구조입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}"""

# Insert the modal just before the final `</div>`
content = content.replace("            )}\n\n        </div>", "                </>\n            )}\n" + modal_jsx + "\n        </div>")
# Oh wait, `</>\n            )}\n        </div>` might already exist without extra \n\n. Let's just find `)}\n        </div>`
if "            )}\n        </div>" in content:
    content = content.replace("            )}\n        </div>", "            )}\n" + modal_jsx + "\n        </div>")

with open(path, 'w') as f:
    f.write(content)
print("Updated PF Plan.")
