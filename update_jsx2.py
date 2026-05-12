import re

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()

# Define the new tbody
new_tbody = """<tbody className="text-[13px] text-[#E5E5E5]">
                                {/* A종 */}
                                <tr className="border-b border-[#444]">
                                    <td rowSpan="7" className="py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]">A종 수익증권</td>
                                    <td className="py-2 px-4 border-r border-[#444]">한중건설㈜</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">13,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">20.97%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">4.02%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">에셀유한회사</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">10,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">16.13%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">3.10%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">구봉산업㈜</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">10,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">16.13%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">3.10%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">㈜게우트플래닝</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">4,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">6.45%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">1.24%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7] font-bold">이지스자산운용㈜</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20">19,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7]">30.65%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight bg-[#5da0e7]/20">5.88%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">㈜데피니트파트너스</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">6,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">9.68%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">1.86%</td>
                                </tr>
                                <tr className="border-b border-[#444] bg-[#1c1c1e]/50">
                                    <td className="py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]">소계</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">62,000</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight">19.20%</td>
                                </tr>

                                {/* B종 */}
                                <tr className="border-b border-[#444]">
                                    <td rowSpan="11" className="py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]">B종 수익증권</td>
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#3aaab3]/20 text-[#3aaab3] font-bold">㈜케이티에스테이트</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#3aaab3] font-[Inter] tracking-tight border-r border-[#444] bg-[#3aaab3]/20">21,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#3aaab3]/20 text-[#3aaab3]">33.87%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#3aaab3] font-[Inter] tracking-tight bg-[#3aaab3]/20">6.50%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7] font-bold">이지스자산운용㈜</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20">13,450</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7]">21.69%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight bg-[#5da0e7]/20">4.16%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">안다인베스트먼트파트너스 유한회사</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">9,500</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">15.32%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">2.94%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">에셀유한회사</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">5,350</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">8.63%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">1.66%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">구봉산업㈜</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">5,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">8.06%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">1.55%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">㈜에스제이더블유인터내셔널</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">3,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">4.84%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.93%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">주식회사 안다자산운용</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1,500</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">2.42%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.46%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">이노베스트 코리아</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1,200</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1.94%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.37%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">㈜데피니트파트너스</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1.61%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.31%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">㈜디와이시스템</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1.61%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.31%</td>
                                </tr>
                                <tr className="border-b border-[#444] bg-[#1c1c1e]/50">
                                    <td className="py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]">소계</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">62,000</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight">19.20%</td>
                                </tr>

                                {/* C종 */}
                                <tr className="border-b border-[#444]">
                                    <td rowSpan="9" className="py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]">C종 수익증권</td>
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7] font-bold">이지스자산운용㈜</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20">10,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7]">5.41%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight bg-[#5da0e7]/20">3.10%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c] font-bold">삼성물산</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20">80,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c]">43.24%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight bg-[#cd879c]/20">24.77%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c] font-bold">디에스클러스터 주식회사</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20">25,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c]">13.51%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight bg-[#cd879c]/20">7.74%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c] font-bold">NH투자증권</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20">37,500</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#cd879c]/20 text-[#cd879c]">20.27%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#cd879c] font-[Inter] tracking-tight bg-[#cd879c]/20">11.61%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">주식회사 투어벨여행사</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">500</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">0.27%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.15%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">주식회사 경방</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">10,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">5.41%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">3.10%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">주식회사 안다자산운용</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">2,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">1.08%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">0.62%</td>
                                </tr>
                                <tr className="border-b border-[#444]">
                                    <td className="py-2 px-4 border-r border-[#444]">현대캐피탈</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">20,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]">10.81%</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight">6.19%</td>
                                </tr>
                                <tr className="border-b border-[#444] bg-[#1c1c1e]/50">
                                    <td className="py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]">소계</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">185,000</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight">57.28%</td>
                                </tr>

                                {/* C-1종 */}
                                <tr className="border-b border-[#444]">
                                    <td rowSpan="2" className="py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]">C-1종 수익증권</td>
                                    <td className="py-2 px-4 border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7] font-bold">이지스자산운용㈜</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20">14,000</td>
                                    <td className="py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] bg-[#5da0e7]/20 text-[#5da0e7]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#5da0e7] font-[Inter] tracking-tight bg-[#5da0e7]/20">4.33%</td>
                                </tr>
                                <tr className="border-b border-[#444] bg-[#1c1c1e]/50">
                                    <td className="py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]">소계</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">14,000</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight">4.33%</td>
                                </tr>

                                {/* Total */}
                                <tr className="bg-[#2A2A2A]">
                                    <td colSpan="2" className="py-2 px-4 text-center font-bold text-white border-r border-[#444]">합계</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]">323,000</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight">100.00%</td>
                                </tr>
                            </tbody>"""

matches = list(re.finditer(r'(<tbody className="text-\[13px\] text-\[#E5E5E5\]">.*?</tbody\s*>)', content, re.DOTALL))
if len(matches) >= 2:
    match = matches[1] # The second one is the detail table
    old_tbody = match.group(1)
    
    if "{phase421 === 'new' ?" not in old_tbody:
        replacement = f"{{phase421 === 'new' ? (\n{new_tbody}\n) : (\n{old_tbody}\n)}}"
        content = content[:match.start()] + replacement + content[match.end():]
        
        with open('src/components/system/SystemFund421.jsx', 'w') as f:
            f.write(content)
        print("Successfully updated SystemFund421.jsx")
    else:
        print("Already updated.")
else:
    print("Could not find tbody")
