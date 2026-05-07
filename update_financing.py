import sys
import re

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Add states for market news
state_injection = """
    const [marketNews, setMarketNews] = useState(null);
    const [selectedLender, setSelectedLender] = useState('전체 대주');
    const [newsLoading, setNewsLoading] = useState(false);
    
    const fetchMarketNews = async () => {
        setNewsLoading(true);
        try {
            // Add cache busting query param
            const res = await fetch(`${import.meta.env.BASE_URL}data/lfc-market-news.json?t=${new Date().getTime()}`);
            if (res.ok) {
                const data = await res.json();
                setMarketNews(data);
            }
        } catch (e) {
            console.error("Failed to load market news", e);
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketNews();
    }, []);
    
    // PF Plan Mock Data
    const pfPlanData = [
        { id: "p1", step: "1", name: "자본구조 설계", materials: "구조도표, IM 초안", counterparty: "N/A", target: "2026.06" },
        { id: "p2", step: "2", name: "IM 배포 및 주관사 선정", materials: "IM 본본, RFP", counterparty: "금융주관사", target: "2026.07" },
        { id: "p3", step: "3", name: "대주단 모집 (Syndication)", materials: "LOI/LOC 수취현황", counterparty: "대주단", target: "2026.09" },
        { id: "p4", step: "4", name: "금융약정 및 기표", materials: "금융약정서", counterparty: "대주단, 법무법인", target: "2026.11" }
    ];
"""

content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);" + state_injection)

# 2. Add the UI blocks below the 816 PFV block
ui_blocks = """
                    <div className="w-full h-[60px]"></div>

                    {/* 월별 이자 발생 시계열 */}
                    <div className="w-full mb-[60px]">
                        <h2 className="text-[20px] font-bold text-white mb-[20px] uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">Interest Timeline</span>월별 이자 발생 시계열</h2>
                        <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[32px] h-[320px] relative overflow-hidden flex items-end justify-between px-[60px]">
                            {/* Dummy Y-axis labels */}
                            <div className="absolute left-[20px] top-[24px] bottom-[40px] flex flex-col justify-between text-[11px] text-[#666] font-['Inter'] pointer-events-none">
                                <span>300억</span>
                                <span>150억</span>
                                <span>0</span>
                            </div>
                            
                            {/* Dummy Bar Chart */}
                            {[...Array(12)].map((_, i) => {
                                const isProjected = i >= 3;
                                const trA = isProjected ? 0 : 80 + Math.random() * 20;
                                const trB = isProjected ? 0 : 30 + Math.random() * 10;
                                const trC = isProjected ? 0 : 15 + Math.random() * 5;
                                const totalH = trA + trB + trC;
                                
                                return (
                                    <div key={i} className="flex flex-col items-center gap-[12px] h-full justify-end w-[40px] group">
                                        <div className={`w-full flex flex-col justify-end gap-[1px] ${isProjected ? 'opacity-20' : ''} transition-opacity cursor-crosshair`} style={{height: '220px'}}>
                                            {isProjected ? (
                                                <div className="w-full h-[20px] bg-[#333] rounded-t-[4px]" title={`${i+1}월 - 입력 대기`}></div>
                                            ) : (
                                                <>
                                                    <div className="w-full bg-[#b889d9] rounded-t-[4px]" style={{height: `${trC}%`}} title={`Tr.C 이자: ${trC.toFixed(0)}억`}></div>
                                                    <div className="w-full bg-[#3aaab3]" style={{height: `${trB}%`}} title={`Tr.B 이자: ${trB.toFixed(0)}억`}></div>
                                                    <div className="w-full bg-[#5da0e7]" style={{height: `${trA}%`}} title={`Tr.A 이자: ${trA.toFixed(0)}억`}></div>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-[12px] text-[#86868B] font-['Inter'] font-medium">{i+1}M</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[12px] text-[#666] mt-[12px] ml-[8px]">금리·실행일·만기 입력 시 월별 발생액이 표시됩니다. (현재 UI 예시용 데이터 적용)</p>
                    </div>

                    {/* 본 PF 계획(통합 PF) */}
                    <div className="w-full mb-[60px]">
                        <h2 className="text-[20px] font-bold text-white mb-[20px] uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">PF Conversion</span>본 PF 계획(통합 PF)</h2>
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
                    </div>

                    {/* 시장 이슈 모니터링 */}
                    <div className="w-full mb-[40px]">
                        <div className="flex justify-between items-end mb-[20px]">
                            <h2 className="text-[20px] font-bold text-white uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">Market Watch</span>시장 이슈 모니터링</h2>
                            <button 
                                onClick={fetchMarketNews}
                                disabled={newsLoading}
                                className="px-[16px] py-[8px] bg-transparent border border-[#444] text-[#E5E5E5] rounded-[10px] text-[13px] font-bold hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center gap-[6px]"
                            >
                                {newsLoading ? (
                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                )}
                                뉴스 업데이트
                            </button>
                        </div>
                        
                        <div className="w-full bg-transparent border border-[#3c3c3c] rounded-[24px] p-[32px] flex gap-[32px]">
                            {/* Sidebar Filters */}
                            <div className="w-[200px] shrink-0 flex flex-col">
                                <div className="text-[13px] font-bold text-[#86868B] mb-[12px]">전체 대주</div>
                                <select 
                                    value={selectedLender} 
                                    onChange={(e) => setSelectedLender(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-[#444] text-white text-[14px] rounded-[12px] px-[16px] py-[10px] outline-none hover:border-[#555] transition-colors focus:border-[#0a84ff] appearance-none"
                                    style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%2386868B" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '16px' }}
                                >
                                    <option value="전체 대주">전체 대주</option>
                                    {marketNews?.items?.map((g, i) => (
                                        <option key={i} value={g.lender}>{g.lender}</option>
                                    ))}
                                </select>
                                <div className="mt-[20px] text-[#666] text-[11px] font-['Inter'] leading-[18px]">
                                    뉴스 {marketNews?.generatedAt ? new Date(marketNews.generatedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'} <br/>
                                    확인 {new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} <br/>
                                    통합 · 실시간 크롤링
                                </div>
                            </div>

                            {/* News List */}
                            <div className="flex-1 flex flex-col gap-[16px]">
                                {marketNews ? (
                                    marketNews.items
                                        .filter(g => selectedLender === '전체 대주' || g.lender === selectedLender)
                                        .flatMap(g => g.articles.map(a => ({ ...a, lender: g.lender })))
                                        .sort((a,b) => new Date(b.date) - new Date(a.date))
                                        .map((article, idx) => (
                                            <a key={idx} href={article.url} target="_blank" rel="noreferrer" className="w-full bg-[#151515] border border-[#333] rounded-[16px] p-[20px] flex flex-col hover:border-[#555] hover:bg-[#1a1a1a] transition-all group">
                                                <div className="flex items-center gap-[10px] mb-[8px]">
                                                    <span className="bg-[#2a2a2c] border border-[#444] text-[#A1A1AA] text-[11px] font-bold px-[8px] py-[2px] rounded-full">{article.lender}</span>
                                                    <span className="text-[#666] text-[12px] font-['Inter']">{article.date} · {article.publisher}</span>
                                                </div>
                                                <h3 className="text-white text-[15px] font-bold leading-snug group-hover:text-[#0a84ff] transition-colors">{article.title}</h3>
                                            </a>
                                        ))
                                ) : (
                                    <div className="w-full h-[200px] flex items-center justify-center text-[#666] text-[14px]">
                                        데이터를 불러오는 중입니다...
                                    </div>
                                )}
                                {marketNews && marketNews.items.filter(g => selectedLender === '전체 대주' || g.lender === selectedLender).flatMap(g => g.articles).length === 0 && (
                                    <div className="w-full h-[100px] flex items-center justify-center text-[#666] text-[14px]">
                                        해당 대주의 최근 크롤링 뉴스가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
"""

end_marker = "                </>"
content = content.replace(end_marker, end_marker + "\n" + ui_blocks)

with open(path, 'w') as f:
    f.write(content)
print("Updated WorkspaceFinancing with all three LFC blocks.")
