import React from 'react';

export default function StakeInternal() {
    const renderLeader = (imgSrc, name, title) => (
        <div className="flex items-center gap-3">
            <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden flex items-center justify-center border border-[#555]">
                {imgSrc ? (
                    <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[#A1A1AA] text-[14px] font-bold">{name.charAt(0)}</span>
                )}
            </div>
            <div className="flex flex-col text-left">
                <span className="text-white font-bold text-[15px] cursor-pointer hover:underline underline-offset-4 decoration-white/30 transition-all">{name}</span>
                <span className="text-[#A1A1AA] text-[13px] mt-[1px]">{title}</span>
            </div>
        </div>
    );

    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[60px] max-w-[1112px] mx-auto">
            <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">IGIS 내부인력</h1>
            <p className="text-[15px] text-[#86868B] mb-[36px]">이오타서울 통합 업무수행 조직(CFT)의 핵심 책임/실무 인력 명단입니다.</p>
            
            <div className="w-full border border-[#333] rounded-[24px] overflow-hidden">
                <table className="w-full text-left bg-transparent border-collapse table-fixed">
                    <thead>
                        <tr>
                            <th className="px-[24px] py-[16px] text-[14px] font-normal text-[#86868B] border-b border-[#333] border-r border-[#333] w-[140px] bg-[#1a1a1a]">기능셀</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-normal text-[#86868B] border-b border-[#333] border-r border-[#333] w-[260px] bg-[#1a1a1a]">책임인력</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-normal text-[#86868B] border-b border-[#333] border-r border-[#333] w-[280px] bg-[#1a1a1a]">실무인력</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-normal text-[#86868B] border-b border-[#333] border-r border-[#333] bg-[#1a1a1a]">핵심 책임</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-normal text-[#86868B] border-b border-[#333] w-[150px] bg-[#1a1a1a]">부문 내 소속</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {/* CFT 총괄 */}
                        <tr className="hover:bg-[#292928] transition-colors">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">CFT 총괄</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('/이철승.jpg', '이철승', '부문대표')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333]">CFT 사무국 (신설 / 기획추진센터 IEC 협업)</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333]">CFT 총괄 책임</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af]">부문직속</td>
                        </tr>

                        {/* 사업 PM */}
                        <tr className="hover:bg-[#292928] transition-colors">
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333] border-b border-[#333]">사업 PM</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '권순일', '사업1파트장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">윤주형 김제익 류홍 박만진 박일훈 이정원 전무경</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] border-b border-[#333] leading-[26px]">전체 일정·예산 통제<br/>변경관리 결정<br/>PFV 외부 단일 창구</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-b border-[#333]">사업그룹</td>
                        </tr>
                        <tr className="hover:bg-[#292928] transition-colors">
                            <td className="px-[24px] pb-[22px] pt-[0px] border-r border-[#333]">
                                {renderLeader('', '강순용', '사업2파트장')}
                            </td>
                            <td className="px-[24px] pb-[22px] pt-[0px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">한찬호 박석제 박채현 소현준 이수정 조영비 한수정</td>
                        </tr>

                        {/* 파이낸싱 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">파이낸싱</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '박준호', 'LFC 센터장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">강석민 정리훈 손유정 김지우 박현승 이성민 한승환</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">본PF·통합PF 구조, 대주단 모니터링<br/>리파이낸싱 옵션 상시 검토</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af]">LFC</td>
                        </tr>

                        {/* 개발관리 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">개발관리</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333] align-top">
                                {renderLeader('', '홍장군', '개발솔루션센터장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">
                                <span className="inline-block w-[60px] text-[#86868B]">건설담당</span> 채원 김보성 전승희<br/>
                                <span className="inline-block w-[60px] text-[#86868B]">설계담당</span> 김대익 장성진<br/>
                                <span className="inline-block w-[60px] text-[#86868B]">인허가</span> 이정훈<br/>
                                <span className="inline-block w-[60px] text-[#86868B]">전문위원</span> 박봉서
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">설계·시공·CM·감리 통제<br/>인허가/명도 대응<br/>공정·품질·안전 KPI</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af]">개발솔루션센터</td>
                        </tr>

                        {/* 기업마케팅 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">기업마케팅</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333] align-top">
                                {renderLeader('', '김민지', '기업마케팅담당')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">
                                <span className="inline-block w-[40px] text-[#86868B]">EMC</span> 고아라<br/>
                                <span className="inline-block w-[40px] text-[#86868B]">SSC</span> 이가현 정수명<br/>
                                <span className="inline-block w-[40px] text-[#86868B]">사업1</span> 권순일(자문)
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">LM 전략·잠재 임차인 피칭<br/>임대차 조건 협의<br/>LM사 관리</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] leading-[26px]">EMC<br/>SSC</td>
                        </tr>

                        {/* 상품·디지털 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333] border-b border-[#333]">상품·디지털</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '김현수', '공간솔루션센터장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">이가현 정수명</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] border-b border-[#333] leading-[26px]">상품 차별화 전략·POC<br/>테넌트 경험 설계<br/>디지털 인프라(보안·통신·DC 등)</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-b border-[#333] leading-[26px]">SSC<br/>디지털사업그룹</td>
                        </tr>
                        <tr className="hover:bg-[#292928] transition-colors">
                            <td className="px-[24px] pb-[22px] pt-[0px] border-r border-[#333]">
                                {renderLeader('', '현철호', '디지털사업그룹장')}
                            </td>
                            <td className="px-[24px] pb-[22px] pt-[0px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">신민호</td>
                        </tr>

                        {/* 펀드운용 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">펀드운용</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '김행단', 'KAM그룹장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">KAM 1파트 실무진</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">421 펀드 운용</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af]">KAM그룹</td>
                        </tr>

                        {/* IPR */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333] border-b border-[#333]">IPR</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '권순일', '(투자) 사업1파트장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">사업1파트 실무진</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] border-b border-[#333] leading-[26px]">프로젝트리츠 TFT 운영<br/>투자자 대응<br/>외부 자문사 선정</td>
                            <td rowSpan={2} className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-b border-[#333] leading-[26px]">부문직속<br/>신설TFT</td>
                        </tr>
                        <tr className="hover:bg-[#292928] transition-colors">
                            <td className="px-[24px] pb-[22px] pt-[0px] border-r border-[#333]">
                                {renderLeader('', '윤용택', '(관리) 사업3파트')}
                            </td>
                            <td className="px-[24px] pb-[22px] pt-[0px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">신규 영입 예정</td>
                        </tr>

                        {/* 전략자문 */}
                        <tr className="hover:bg-[#292928] transition-colors border-t border-[#333]">
                            <td className="px-[24px] py-[22px] text-[15px] font-medium text-[#bbb9af] border-r border-[#333]">전략자문</td>
                            <td className="px-[24px] py-[22px] border-r border-[#333]">
                                {renderLeader('', '권순일', '사업1파트장')}
                            </td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">사업1파트 실무진</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af] border-r border-[#333] leading-[26px]">거시경제 분석 및 자본시장 전략 자문</td>
                            <td className="px-[24px] py-[22px] text-[15px] text-[#bbb9af]">사업그룹</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
