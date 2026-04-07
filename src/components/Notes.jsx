import React, { useEffect } from 'react';

export default function Notes() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#f9f9fb] flex justify-center py-20 px-6 font-sans text-[#1d1d1f]">
            <article className="w-full max-w-[800px] bg-white p-10 md:p-16 shadow-sm border border-neutral-200">
                
                <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-tight mb-12 border-b-[3px] border-black pb-6">
                    IFPDP_데이터 취합 주요 고려사항
                </h1>

                {/* Section 1 */}
                <div className="mb-14">
                    <h2 className="text-[20px] font-bold mb-4 flex items-center">
                        <span className="w-6 h-6 bg-black text-white text-[13px] flex items-center justify-center rounded-full mr-3">1</span>
                        크게 이지스의 외부 / 내부 데이터로 나뉜다.
                    </h2>
                    <p className="text-[15px] text-[#555] mb-4 ml-9 font-medium">
                        (완벽한 플랫폼 모델로써 작동하는데에 내부 데이터만으로는 한계가 있기 때문이다)
                    </p>
                    <ul className="list-disc pl-14 text-[16px] leading-[1.8] text-[#333] space-y-2">
                        <li>최초 외부데이터는 리서치센터에서 주관하는 데이터(알스퀘어 등) raw파일을 쓰고 가공한다.</li>
                        <li>내부데이터셋은 처음부터 만든다.</li>
                        <li><strong>매핑기준 :</strong> 내/외부 데이터 결합을 위한 '표준 자산 식별 코드(Asset ID)'를 우선 정의</li>
                        <li className="text-neutral-500 italic">아래부터는 내부 데이터셋의 구축 방향성이다.</li>
                    </ul>
                </div>

                {/* Section 2 */}
                <div className="mb-14">
                    <h2 className="text-[20px] font-bold mb-4 flex items-center">
                        <span className="w-6 h-6 bg-black text-white text-[13px] flex items-center justify-center rounded-full mr-3">2</span>
                        시계열로 관리할 데이터를 따로 분류한다.
                    </h2>
                    <ul className="list-disc pl-14 text-[16px] leading-[1.8] text-[#333] space-y-2">
                        <li>e.g. 언더라이팅시와 지금의 데이터 변화</li>
                        <li>e.g. 티저때의 원가와 중간, 지금의 원가 변화 (왜 그랬는지)</li>
                        <li>시계열 데이터의 취합과 셑과 저장소를 따로 분류</li>
                        <li><strong>스냅샷 :</strong> 데이터 변화의 기준점 마일스톤(예: 초기 티저, 투자심의위원회 승인, 본 PF 기표, 준공) 시점의 데이터 스냅샷 락인(Lock-in) 기능 구현</li>
                    </ul>
                </div>

                {/* Section 3 */}
                <div className="mb-14">
                    <h2 className="text-[20px] font-bold mb-4 flex items-center">
                        <span className="w-6 h-6 bg-black text-white text-[13px] flex items-center justify-center rounded-full mr-3">3</span>
                        데이터베이스는 물리적으로 하나(Single Source of Truth)로 통합. 하지만 사용자(부서)에 따른 최적 화면은 따로 구성된다.
                    </h2>
                    <div className="pl-9 space-y-3">
                        <div className="flex">
                            <span className="text-neutral-400 mr-3">ㄴ</span>
                            <p className="text-[16px] leading-[1.7] text-[#333]">각 부서의 니즈에 맞게 부서별 기본 상세페이지를 모두 따로 구성한다.</p>
                        </div>
                        <div className="flex">
                            <span className="text-neutral-400 mr-3">ㄴ</span>
                            <p className="text-[16px] leading-[1.7] text-[#333]">최종 상세페이지에는 모든 부서에서 취합된 정보가 담기고, 이 페이지는 최고 권한자만 열람할 수 있게 한다.</p>
                        </div>
                        <div className="flex">
                            <span className="text-neutral-400 mr-3">ㄴ</span>
                            <p className="text-[16px] leading-[1.7] text-[#333]">사용자 권한 설정 (데이터 열람 권한 부여, 읽기/쓰기 권한 부여)</p>
                        </div>
                    </div>
                </div>

                {/* Section 4 */}
                <div className="mb-14 border-t border-dashed border-neutral-300 pt-10">
                    <h2 className="text-[20px] font-bold mb-6 text-[#1d1d1f]">
                        데이터 취합의 방법론
                    </h2>
                    <p className="text-[16px] leading-[1.7] text-[#333] mb-6 bg-[#f4f4f5] p-5">
                        각각의 부서간 조직장 및 실무자와 협의/합의하여 최초 등록할 프로젝트/자산에 대해 설정하고, 그들과 긴밀하게 협력하여 최초 데이터셋을 구축한다.
                    </p>
                    
                    <h3 className="font-bold text-[15px] mb-4 text-[#555] uppercase tracking-wide">예상 데이터 구축 협업 부서와 실무자</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pl-2">
                        {[
                            { name: "기업마케팅센터", people: "고아라/김민지" },
                            { name: "투자그룹", people: "신용우/송기석/홍봉석" },
                            { name: "글로벌투자그룹", people: "미정" },
                            { name: "스페셜시츄에이션그룹", people: "미정" },
                            { name: "사업그룹", people: "이수정/강순용" },
                            { name: "디지털사업그룹", people: "홍창의 (미정)" },
                            { name: "개발솔루션", people: "김대익/미정" },
                            { name: "관리/운영", people: "미정" },
                            { name: "글로벌자산관리", people: "미정" },
                            { name: "리빙그룹", people: "미정" },
                            { name: "리테일솔루션센터", people: "미정" },
                            { name: "LFC", people: "미정" },
                            { name: "공간솔루션센터", people: "미정" },
                            { name: "CM", people: "미정" }
                        ].map((dept, i) => (
                            <div key={i} className="flex items-center text-[15px] border-b border-neutral-100 pb-2">
                                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full mr-3"></span>
                                <span className="font-bold w-[150px]">{dept.name}</span>
                                <span className="text-[#666]">{dept.people}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 5 */}
                <div className="mb-8 pt-10 border-t border-black">
                    <h2 className="text-[20px] font-bold mb-6 text-[#1d1d1f]">
                        플랫폼 서비스 (맥락) 구축의 방법론
                    </h2>
                    
                    <div className="mb-8">
                        <h3 className="text-[17px] font-bold mb-2 text-black flex items-center">
                            <span className="w-1.5 h-4 bg-black mr-2"></span>
                            스키마 유연화
                        </h3>
                        <p className="text-[16px] leading-[1.7] text-[#333] pl-3.5">
                            전체 풀셑 항목을 만드는데 너무 집중하지 말고 지속적으로 바꿔가며 업데이트 한다. (AI 덕분에 항목을 바꾸고 업데이트 하는 비용이 기하급수적으로 자유로워졌기 때문이다.)
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[17px] font-bold mb-4 text-black flex items-center">
                            <span className="w-1.5 h-4 bg-black mr-2"></span>
                            AI 트리거용 맥락데이터
                        </h3>
                        <p className="text-[16px] leading-[1.7] text-[#333] pl-3.5 mb-6">
                            가장 중요한 것은, AI에게 어떤 상태값(이슈)일때 어떻게 대응하는지에 대한 맥락 데이터셋을 구성하고 지속 업데이트 하는 것이다. <br/><br/>
                            <span className="underline decoration-2 underline-offset-4 font-bold">이런 것들을 각개 10개의 가치사슬에서 미리 구현해 놓아야 한다.</span>
                        </p>
                        
                        <div className="space-y-4 pl-3.5">
                            <div className="bg-[#f9f9fb] p-5 border-l-2 border-black">
                                <p className="font-bold text-[14px] text-black mb-2 uppercase tracking-tight">e.g.1 전력 인입 단계</p>
                                <p className="text-[15px] leading-[1.6] text-[#444]">
                                    주의해야 할 것: 예비수전-본수전-계약수전 으로 나뉘어지는데, 예비수전은 그냥 있냐고 물어보는 수준이며 금방 날라갈 수 있음. 이제는 전기가 없음. 옛날에는 신청하면 다 줬지만 지금은 아예 불가능. 예비수전 후 본수전 바로 신청 필요 & 전력은 홍장군 센터장님에게 모든 정보/커뮤니케이션 조율할 수 있도록 바로 공유 필요.
                                </p>
                            </div>
                            
                            <div className="bg-[#f9f9fb] p-5 border-l-2 border-black">
                                <p className="font-bold text-[14px] text-black mb-2 uppercase tracking-tight">e.g.2 앵커 리테일의 역할</p>
                                <p className="text-[15px] leading-[1.6] text-[#444]">
                                    복합단지에서 앵커 리테일은 브랜딩(자산인지도)를 강화시키고 결과적으로 오피스 공실률을 드라마틱하게 개선시키는 매우 중요한 역할을 한다. (예: IFC몰 사례)
                                </p>
                            </div>

                            <div className="bg-[#f9f9fb] p-5 border-l-2 border-black">
                                <p className="font-bold text-[14px] text-black mb-2 uppercase tracking-tight">e.g.3 공기질 계획</p>
                                <p className="text-[15px] leading-[1.6] text-[#444]">
                                    자산의 공기의 질을 계획하기 위해서는 건축 설계시부터 공조방식, 설비, 자재와 운영방식에 대해 건축 초반부터 구체적으로 고려하고 예산과 비용에 태워야 한다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
            </article>
        </div>
    );
}
