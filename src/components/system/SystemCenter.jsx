import React from 'react';

export default function SystemCenter() {
    return (
        <div className="flex-1 h-full bg-transparent flex flex-col relative font-sans text-[#1D1D1F] dark:text-[#E5E5E5] overflow-y-auto hide-scrollbar transition-colors duration-300">
            
            {/* Top Tab Bar (IDE Style) */}
            <div className="w-full h-[46px] flex items-end justify-between shrink-0 bg-[#1A1A1A]">
                {/* Tabs Container */}
                <div className="flex h-full items-end pl-0">
                    {/* Inactive Tab */}
                    <div className="flex items-center justify-center px-6 h-full cursor-pointer text-[#86868B] hover:text-[#A1A1AA] transition-colors bg-transparent border-none">
                        <span className="text-[13px] font-normal tracking-wide">더케이트윈타워</span>
                    </div>
                    {/* Active Tab */}
                    <div className="flex items-center justify-between pl-6 pr-3 h-full cursor-pointer text-[#E5E5E5] bg-white dark:bg-[#1F1F1E] relative border-none">
                        <span className="text-[13px] font-medium tracking-wide mr-8">IOTA 서울 816</span>
                        <button className="text-[#86868B] hover:text-white transition-colors outline-none cursor-pointer flex items-center justify-center p-1 rounded-md hover:bg-[#333]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="px-5 h-full flex items-center bg-[#1A1A1A]">
                    <div className="text-[#86868B] hover:text-[#E5E5E5] cursor-pointer tracking-[3px] font-black text-[13px] transition-colors duration-300 pb-[2px] transform translate-y-[1px] translate-x-0.5">
                        ···
                    </div>
                </div>
            </div>

            {/* Scrollable Context Area */}
            <div className="w-[1000px] mx-auto flex-1 flex flex-col pb-32">
                
                {/* Title & Metadata row */}
                <div className="w-full pl-[130px] mt-[50px] flex justify-between items-end mb-11">
                    <h1 className="text-[34px] font-bold text-white tracking-tight leading-[1.1]">IOTA Seoul 2_816</h1>
                    <div className="flex items-end gap-[30px] pb-1">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Now</span>
                            <span className="text-[13px] font-medium text-[#A1A1AA]">개발중</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Priority</span>
                            <span className="text-[13px] font-bold text-[#e11d48]">High</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Vehicle</span>
                            <span className="text-[13px] font-medium text-[#E5E5E5]">PFV</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Sector</span>
                            <span className="text-[13px] font-medium text-[#E5E5E5]">Commercial</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Use</span>
                            <span className="text-[13px] font-medium text-[#E5E5E5]">Office</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-[#666] mb-1 font-semibold tracking-wider">Project Type</span>
                            <span className="text-[13px] font-medium text-[#E5E5E5]">Development</span>
                        </div>
                    </div>
                </div>

                {/* Section 1: 내부 담당자 */}
                <div className="flex items-center w-full mt-2 mb-[22px]">
                    <span className="text-[12px] text-[#86868B] w-[130px] shrink-0 font-medium tracking-tight">내부 담당자</span>
                    <div className="flex-1 h-px bg-[#2C2C2E]"></div>
                </div>

                <div className="w-full pl-[130px] flex flex-col gap-[38px]">
                    <div className="flex justify-between items-center w-full pr-1">
                        <div className="flex items-center text-[13px]">
                            <span className="text-[#666] mr-2 text-[11px] font-medium">Director</span>
                            <span className="text-white font-medium mr-[26px]">이철승</span>
                            <span className="text-[#666] mr-2 text-[11px] font-medium">Project Owner</span>
                            <span className="text-white font-medium mr-[26px]">강순용</span>
                            <span className="text-[#666] mr-2 text-[11px] font-medium">Project Manager</span>
                            <span className="text-white font-medium tracking-tight">한진호 소현준 이수진 한수정 박재현 조영배</span>
                        </div>
                        <div className="text-[12px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium">사업참여 프로젝트 전체보기 {'>'}</div>
                    </div>

                    {/* Timeline Container */}
                    <div className="relative w-full h-[60px] flex items-center justify-between px-2">
                        {/* Background Lines */}
                        <div className="absolute top-[28px] left-[26px] right-[26px] flex z-0">
                            <div className="w-[66%] h-[1px] bg-[#3A3A3C]"></div>
                            <div className="w-[34%] h-[1px] border-t border-dashed border-[#555]"></div>
                        </div>

                        {/* NOW Indicator */}
                        <div className="absolute left-[64%] top-[10px] bottom-[-18px] flex flex-col items-center z-0">
                            <span className="text-[10px] font-black text-white absolute -top-[14px] bg-[#1F1F1E] px-1 tracking-tighter">NOW</span>
                            <div className="w-px h-full border-l border-dashed border-[#555]"></div>
                        </div>

                        {/* Nodes */}
                        {[
                            { date: '2022.12', text: 'PFV설립' },
                            { date: '2024.03', text: '자산매입' },
                            { date: '2024.12', text: '종합설계 完' },
                            { date: '2025.4', text: '사업시행인가 完' },
                            { date: '2025.5', text: '1차연장' },
                            { date: '2025.09', text: '2차연장' },
                            { date: '2025.10', text: '3차연장' },
                            { date: '2026.01', text: 'EOD' },
                            { date: '2027.02', text: '통합PF', isFuture: true },
                            { date: '2027.05', text: 'IOTA1 착공', isFuture: true },
                            { date: '2029.06', text: 'IOTA2 착공', isFuture: true },
                            { date: '2032.06', text: '준공', isFuture: true },
                        ].map((node, i) => (
                            <div key={i} className="flex flex-col items-center relative z-10 w-[60px]">
                                <span className={`text-[10px] mb-2 font-medium tracking-tighter ${node.isFuture ? 'text-[#666]' : 'text-[#86868B]'}`}>{node.date}</span>
                                <div className={`w-[7px] h-[7px] rounded-full my-[1px] ${node.isFuture ? 'border border-[#555] bg-[#1F1F1E]' : 'bg-[#D1D1D6]'}`}></div>
                                <span className={`text-[11px] mt-2 font-semibold tracking-tighter whitespace-nowrap ${node.isFuture ? 'text-[#86868B]' : 'text-white'}`}>{node.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: 자산 주요 정보 */}
                <div className="flex items-center w-full mt-14 mb-[22px]">
                    <span className="text-[12px] text-[#86868B] w-[130px] shrink-0 font-medium tracking-tight">자산 주요 정보</span>
                    <div className="flex-1 h-px bg-[#2C2C2E]"></div>
                </div>
                
                <div className="w-full pl-[130px] flex flex-col gap-4">
                    {/* Row 1 */}
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {/* Box 1: Basic */}
                            <div className="bg-[#242424] rounded-[18px] p-6 flex flex-row items-center justify-between h-[126px]">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[11px] font-medium text-[#86868B] mb-2">공급 예정</span>
                                    <span className="text-[22px] font-bold text-white tracking-tight">2032</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[11px] font-medium text-[#86868B] mb-2">Brand</span>
                                    <span className="text-[20px] font-normal text-white font-serif tracking-widest mt-1">IOTA</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[11px] font-medium text-[#86868B] mb-2">연면적</span>
                                    <span className="text-[22px] font-bold text-white tracking-tight mt-0.5">36,537<span className="text-[14px]">평</span></span>
                                </div>
                            </div>
                            
                            {/* Box 2: 원가 */}
                            <div className="bg-[#242424] rounded-[18px] p-5 flex flex-col justify-between relative h-[126px]">
                                <span className="text-[11px] font-medium text-[#86868B] absolute top-[22px] left-5">원가</span>
                                <div className="flex justify-end gap-10 mt-1 mb-[2px] pr-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#666] font-semibold tracking-wider">UW 2022.12</span>
                                        <span className="text-[10px] text-[#86868B] mt-0.5">4,380 만원/평</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-white font-semibold tracking-wider">As-Is 2026.03</span>
                                        <span className="text-[10px] font-semibold text-white mt-0.5">6,053 만원/평</span>
                                    </div>
                                </div>
                                <div className="w-full text-right pr-3 pb-1">
                                    <span className="text-[24px] font-bold text-[#86868B] tracking-tighter">1조 6,000억 <span className="font-normal text-[18px] mx-1 opacity-80">→</span> </span>
                                    <span className="text-[24px] font-bold text-white tracking-tighter">2조 1,964억</span>
                                </div>
                            </div>

                            {/* Box 3: 매각 목표 */}
                            <div className="bg-[#242424] rounded-[18px] p-5 flex flex-col justify-between relative h-[126px]">
                                <span className="text-[11px] font-medium text-[#86868B] absolute top-[22px] left-5">매각 목표</span>
                                <div className="flex justify-end gap-10 mt-1 mb-[2px] pr-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#666] font-semibold tracking-wider">UW 2022.12</span>
                                        <span className="text-[10px] text-[#86868B] mt-0.5">4,800 만원/평</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-white font-semibold tracking-wider">As-Is 2026.03</span>
                                        <span className="text-[10px] font-semibold text-white mt-0.5">Target 8,500 만원/평</span>
                                    </div>
                                </div>
                                <div className="w-full text-right pr-3 pb-1">
                                    <span className="text-[24px] font-bold text-[#86868B] tracking-tighter">1조 8,070억 <span className="font-normal text-[18px] mx-1 opacity-80">→</span> </span>
                                    <span className="text-[24px] font-bold text-white tracking-tighter">2조 3,749억</span>
                                </div>
                            </div>
                        </div>
                        {/* + Button */}
                        <div className="w-[46px] flex items-center justify-center shrink-0 relative mr-1">
                            <span className="text-[10px] text-[#86868B] absolute -left-[7px] -ml-[30px] font-medium tracking-tight">주요 숫자</span>
                            <button className="w-[32px] h-[32px] rounded-full border border-[#444] text-[#A1A1AA] hover:text-white hover:border-white transition-colors flex items-center justify-center font-light text-[20px] pb-1 cursor-pointer">
                                +
                            </button>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center gap-4 w-full pr-[62px]">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {/* Box 4: 개발기간 & 전용면적 */}
                            <div className="bg-[#242424] rounded-[18px] p-5 flex gap-2 h-[126px]">
                                <div className="flex flex-col w-[53%] justify-between pb-1 pl-1">
                                    <span className="text-[11px] font-medium text-[#86868B]">개발기간</span>
                                    <div className="mt-2 text-left">
                                        <span className="text-[20px] font-bold text-[#86868B] tracking-tight">67M <span className="font-normal text-[15px] mx-[2px] opacity-80">→</span> </span>
                                        <span className="text-[20px] font-bold text-white tracking-tight">116M</span>
                                    </div>
                                    <span className="text-[9px] text-[#666] font-semibold tracking-wider">UW 2022.12 <span className="ml-[12px] opacity-80">As-Is 2026.03</span></span>
                                </div>
                                <div className="w-px bg-[#333] my-1 mx-2 h-[70px] self-center"></div>
                                <div className="flex flex-col w-[47%] justify-between h-full pb-1 pr-1">
                                    <span className="text-[11px] font-medium text-[#86868B]">전용면적</span>
                                    <div className="flex flex-col mt-4 gap-2">
                                        <div className="flex justify-between items-end text-white">
                                            <span className="text-[11px] font-medium text-[#86868B]">업무</span> 
                                            <span className="text-[13px] font-medium">15,529<span className="text-[10.5px]">평</span></span>
                                        </div>
                                        <div className="flex justify-between items-end text-white">
                                            <span className="text-[11px] font-medium text-[#86868B]">리테일</span> 
                                            <span className="text-[13px] font-medium">1,022<span className="text-[10.5px]">평</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Box 5: 수익률 목표 */}
                            <div className="bg-[#242424] rounded-[18px] p-5 flex flex-col justify-between relative h-[126px]">
                                <span className="text-[11px] font-medium text-[#86868B] absolute top-[22px] left-5">수익률 목표</span>
                                <div className="flex justify-end gap-12 mt-6 pr-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#666] font-semibold tracking-wider">UW 2022.12</span>
                                        <span className="text-[10px] text-[#86868B] mt-0.5">EM x1.75</span>
                                    </div>
                                    <div className="flex flex-col items-end pr-2">
                                        <span className="text-[9px] text-white font-semibold tracking-wider">As-Is 2026.03</span>
                                        <span className="text-[10px] font-semibold text-white mt-0.5">Target EM x1.73</span>
                                    </div>
                                </div>
                                <div className="w-full text-center pr-2 pb-1">
                                    <span className="text-[22px] font-bold text-[#86868B] tracking-tight">IRR 10.5% <span className="font-normal text-[18px] mx-1 opacity-80">→</span> </span>
                                    <span className="text-[22px] font-bold text-white tracking-tight">IRR 5.8%</span>
                                </div>
                            </div>

                            {/* Box 6: E.NOC 목표 */}
                            <div className="bg-[#242424] rounded-[18px] p-5 flex flex-col justify-between relative h-[126px]">
                                <span className="text-[11px] font-medium text-[#86868B] absolute top-[22px] left-5">E.NOC 목표</span>
                                <div className="flex justify-end gap-12 mt-6 pr-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] text-[#666] font-semibold tracking-wider">UW 2022.12</span>
                                        <span className="text-[10px] text-[#86868B] mt-0.5">2027년 기준</span>
                                    </div>
                                    <div className="flex flex-col items-end pr-3">
                                        <span className="text-[9px] text-white font-semibold tracking-wider">As-Is 2026.03</span>
                                        <span className="text-[10px] font-semibold text-white mt-0.5">2032년 기준</span>
                                    </div>
                                </div>
                                <div className="w-full text-center pb-1">
                                    <span className="text-[22px] font-bold text-[#86868B] tracking-tight">37.5만원 <span className="font-normal text-[18px] mx-1 opacity-80">→</span> </span>
                                    <span className="text-[22px] font-bold text-white tracking-tight">64.3만원</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: 이슈 및 리스크 */}
                <div className="flex items-center w-full mt-[50px] mb-6">
                    <span className="text-[12px] text-[#86868B] w-[130px] shrink-0 font-medium tracking-tight">이슈 및 리스크</span>
                    <div className="flex-1 h-px bg-[#2C2C2E]"></div>
                </div>
                <div className="w-full pl-[130px] pr-2">
                    <div className="w-full bg-[#242424] rounded-[18px] p-6 pt-5 relative">
                        <div className="text-[11px] text-[#86868B] font-medium mb-[14px]">주요 이슈</div>
                        <div className="text-[13px] text-[#A1A1AA] leading-relaxed break-keep pr-10">
                            2026년 3월 금융권 자금유치를 마무리하는 협상을 추진했으나 채권단 안이 보결되어 현재는 신수위 일부는 메리츠증권, 잔액분은 NH증권이 참여하는 구조를 협의 중임<br/>
                            PFV는 브릿지론 축소에 대비 700억원 소노인터내셔널 확약을 확보했고, 당초 지가공사결과 통합 프로젝트 취소 상황 등 PF 자금 조달에 전략적 사업구조를 유지하려는 당인 협의 검토 중
                        </div>
                        <button className="absolute top-[22px] right-6 text-[#666] hover:text-white transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Section 4: Equity & Loan */}
                <div className="flex items-center w-full mt-[50px] mb-7">
                    <span className="text-[12px] text-[#86868B] w-[130px] shrink-0 font-medium tracking-tight">Equity & Loan</span>
                    <div className="flex-1 h-px bg-[#2C2C2E]"></div>
                </div>
                <div className="w-full pl-[130px] pr-2">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-[22px] text-[12px] font-medium">
                            <span className="text-[#86868B]">Equity <span className="text-[#3b82f6] ml-1.5 font-bold">63.95 억원</span></span>
                            <span className="text-[#86868B]">Loan <span className="text-[#3b82f6] ml-1.5 font-bold">9,570 억원</span></span>
                            <div className="w-px h-3 bg-[#444]"></div>
                            <span className="text-[#86868B]">Tr.A <span className="text-white ml-2">4,800 억원 <span className="text-[#666] ml-1 font-normal tracking-wide">(7.7%)</span></span></span>
                            <span className="text-[#86868B]">Tr.B <span className="text-white ml-2">1,400 억원 <span className="text-[#666] ml-1 font-normal tracking-wide">(11.3%)</span></span></span>
                            <span className="text-[#86868B]">Tr.C <span className="text-white ml-2">970 억원 <span className="text-[#666] ml-1 font-normal tracking-wide">(15.6%) _ All-in</span></span></span>
                        </div>
                        <div className="text-[12px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium">투자구조 자세히보기 {'>'}</div>
                    </div>
                </div>

                {/* Section 5: 수익자 & 대주 */}
                <div className="flex items-center w-full mt-[32px] mb-8">
                    <span className="text-[12px] text-[#86868B] w-[130px] shrink-0 font-medium tracking-tight">수익자 & 대주</span>
                    <div className="flex-1 h-px bg-[#2C2C2E]"></div>
                </div>
                <div className="w-full pl-[130px] pr-3">
                    <div className="grid grid-cols-4 gap-x-[72px] px-1 text-[12px]">
                        {/* Col 1 */}
                        <div className="flex flex-col gap-[12px]">
                            <div className="flex justify-between mb-[2px]">
                                <span className="text-[#86868B]">수익자</span>
                                <span className="text-[#3b82f6] font-bold tracking-wider">63.95 억</span>
                            </div>
                            {[
                                { n: '1.', name: '국민은행', amt: '19.55 억' },
                                { n: '2.', name: '이지스투자증권', amt: '15.50 억' },
                                { n: '3.', name: '신한투자증권', amt: '12.95 억' },
                                { n: '4.', name: 'NH투자증권', amt: '7.95 억' },
                                { n: '5.', name: '삼성물산', amt: '6.00 억' }
                            ].map(item => (
                                <div className="flex justify-between" key={item.name}>
                                    <span className="text-white font-medium"><span className="text-[#86868B] mr-[6px]">{item.n}</span> {item.name}</span>
                                    <span className="text-[#E5E5E5] font-medium tracking-wide">{item.amt}</span>
                                </div>
                            ))}
                        </div>

                        {/* Col 2 */}
                        <div className="flex flex-col gap-[12px]">
                            <div className="flex justify-between mb-[2px]">
                                <span className="text-[#86868B] ml-1">Tr. A</span>
                                <span className="text-[#3b82f6] font-bold tracking-wider">4,800 억</span>
                            </div>
                            {[
                                { n: '1.', name: '국민은행', amt: '1,500 억' },
                                { n: '2.', name: '과학기술인공제회', amt: '500 억' },
                                { n: '3.', name: '대구은행', amt: '500 억' },
                                { n: '4.', name: '미래에셋캐피탈', amt: '480 억' },
                                { n: '5.', name: 'KB캐피탈', amt: '450 억' }
                            ].map(item => (
                                <div className="flex justify-between" key={item.name}>
                                    <span className="text-white font-medium"><span className="text-[#86868B] mr-[6px]">{item.n}</span> {item.name}</span>
                                    <span className="text-[#E5E5E5] font-medium tracking-wide">{item.amt}</span>
                                </div>
                            ))}
                        </div>

                        {/* Col 3 */}
                        <div className="flex flex-col gap-[12px]">
                            <div className="flex justify-between mb-[2px]">
                                <span className="text-[#86868B] ml-1">Tr. B</span>
                                <span className="text-[#3b82f6] font-bold tracking-wider">1,400 억</span>
                            </div>
                            {[
                                { n: '1.', name: '한투캐피탈(Debt)', amt: '600 억' },
                                { n: '2.', name: '한투리얼(재차신)', amt: '350 억' },
                                { n: '3.', name: '신한증권', amt: '115 억' },
                                { n: '4.', name: '신한캐피탈', amt: '100 억' },
                                { n: '5.', name: 'NH투자증권', amt: '85 억' }
                            ].map(item => (
                                <div className="flex justify-between" key={item.name}>
                                    <span className="text-white font-medium"><span className="text-[#86868B] mr-[6px]">{item.n}</span> {item.name}</span>
                                    <span className="text-[#E5E5E5] font-medium tracking-wide">{item.amt}</span>
                                </div>
                            ))}
                        </div>

                        {/* Col 4 */}
                        <div className="flex flex-col gap-[12px] relative h-full">
                            <div className="flex justify-between mb-[2px]">
                                <span className="text-[#86868B] ml-1">Tr. C</span>
                                <span className="text-[#3b82f6] font-bold tracking-wider">970 억</span>
                            </div>
                            {[
                                { n: '1.', name: '대신증권', amt: '480 억' },
                                { n: '2.', name: '신한은행', amt: '290 억' },
                                { n: '3.', name: 'DB증권', amt: '200 억' }
                            ].map(item => (
                                <div className="flex justify-between" key={item.name}>
                                    <span className="text-white font-medium"><span className="text-[#86868B] mr-[6px]">{item.n}</span> {item.name}</span>
                                    <span className="text-[#E5E5E5] font-medium tracking-wide">{item.amt}</span>
                                </div>
                            ))}
                            <div className="absolute bottom-0 w-full flex justify-between items-center mb-0 border-t border-[#2C2C2E] pt-3">
                                <span className="text-[#86868B]">주주대여금</span>
                                <span className="text-[#3b82f6] font-bold tracking-wider text-[13px]">2,400 억</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>        </div>
    );
}
