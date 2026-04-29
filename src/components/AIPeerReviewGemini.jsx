import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AIPeerReviewGemini() {
    const { lang } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full h-screen bg-white font-sans text-black flex flex-col items-center overflow-hidden">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1200px] mt-24 md:mt-32 shrink-0">
                <div className="mb-10">
                    <h1 className="text-[32px] md:text-[42px] font-extrabold tracking-[-0.03em] mb-4 font-inter">
                        AI Peer Review : <span className="font-light tracking-tight">Gemini 3.1 Pro</span>
                    </h1>
                    <p className="text-[16px] text-gray-500 font-light tracking-tight leading-relaxed max-w-2xl">
                        {lang === 'kr' ? "본 기획안에 대한 현 AI 최상위 모델의 객관적 평가 결과입니다." : "Objective cross-validation and evaluation results of the IFPDP Integrated Platform Proposal by global top-tier AI models."}
                    </p>
                </div>
            </div>

            <div className="w-full flex-1 overflow-y-auto pb-[150px] relative px-[24px] md:px-[50px] flex flex-col items-center">
                <div className="w-full max-w-[1200px] block">
                    <div className="bg-white border border-gray-200 p-8 md:p-12">
                        {lang === 'kr' ? (
                            <div className="font-sans text-[15px] md:text-[16px] text-[#222] leading-[25px] md:leading-[27px] font-light break-keep space-y-12">
                                {/* Section 1 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        1. 종합 의견 (Executive Summary)
                                    </h3>
                                    <ul className="space-y-2 ml-1 mb-6 text-gray-700">
                                        <li>• <strong className="font-bold text-black">긍정적 측면:</strong> 부동산 자산운용의 수익 창출 모델이 '자본 배치(Capital Allocation)'에서 '운영 효율성(Operational Efficiency)'으로 이동하는 시장 환경에 적절하게 대응하는 시스템 기획안입니다.</li>
                                        <li>• <strong className="font-bold text-black">아쉬운 측면:</strong> 기술적 아키텍처는 명확하나, 시스템 도입 초기에 실무진(PM)의 데이터 입력을 유도하거나 강제할 수 있는 거버넌스(Governance) 측면의 서술이 다소 부족합니다.</li>
                                    </ul>
                                </div>

                                {/* Section 2 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        2. 강점 (Strengths)
                                    </h3>
                                    <ul className="space-y-4 ml-1 mb-6 text-gray-700">
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[데이터 구조화의 타당성]</strong>
                                            금융업에서 AI 도입 시 가장 큰 허들은 레거시 시스템의 비정형 데이터(회의록, 이메일 등) 처리입니다. 본 기획안은 초기 설계 단계부터 정형 데이터(재무 모델)와 비정형 데이터(이벤트 로그)를 결합하는 스키마를 제안하고 있어, 향후 RAG(검색 증강 생성) 도입 시 데이터 정합성을 크게 높일 수 있습니다.
                                        </li>
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[업무 맥락의 자산화]</strong>
                                            개별 PM에게 귀속되어 있던 '딜(Deal) 단위의 경험'을 전사 시스템으로 중앙화하려는 접근은 전략적으로 타당합니다. 장기적으로 인력 이동에 따른 리스크를 줄이고 기관(Institutional) 차원의 지적 자본을 축적하는 데 기여할 것입니다.
                                        </li>
                                    </ul>
                                </div>

                                {/* Section 3 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        3. 약점 및 리스크 (Weaknesses & Risks)
                                    </h3>
                                    <ul className="space-y-4 ml-1 mb-6 text-gray-700">
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[비즈니스 마찰(Friction) 비용]</strong>
                                            현업 PM들은 단기적인 딜 클로징과 수익률 방어에 집중합니다. 시스템 데이터 입력 자체가 새로운 업무 부하(Load)로 인식될 경우, 양질의 데이터 확보는 실패합니다. 기획안 내 'Zero-Friction' 개념이 언급되었으나, 이를 실현하기 위한 구체적인 인센티브 구조나 KPI 연계 방안이 누락되어 있습니다.
                                        </li>
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[ROI 타당성 검증]</strong>
                                            대규모 전사 시스템 구축 전, 최소 기능 단위(MVP)를 통한 투자 대비 효과(ROI) 검증이 선행되어야 합니다. 파일럿 테스트를 진행할 대상 자산군과 성공 측정 지표(Success Metrics)가 명시될 필요가 있습니다.
                                        </li>
                                    </ul>
                                </div>

                                {/* Section 4 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        4. 제언 (Recommendations)
                                    </h3>
                                    <div className="pt-2">
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            기획안의 방향성은 현재 금융 및 프롭테크 업계의 디지털 전환(DX) 트렌드와 정확히 일치합니다. 
                                        </p>
                                        <p className="text-gray-700 leading-relaxed">
                                            성공적인 안착을 위해서는 기술적 인프라 구축과 동시에, 실무진이 이 시스템을 사용할 수밖에 없게 만드는 '제도적 장치' 마련이 동반되어야 합니다. 파일럿 부서를 선정하여 초기 3개월간의 운영 데이터를 집중적으로 축적하고, 그 결과물(보고서 자동화, 리스크 조기 탐지 등)을 전사에 시연하는 방식의 단계적 확장을 권장합니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="font-sans text-[15px] md:text-[16px] text-[#222] leading-[25px] md:leading-[27px] font-light break-keep space-y-12">
                                {/* Section 1 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        1. Executive Summary
                                    </h3>
                                    <ul className="space-y-2 ml-1 mb-6 text-gray-700">
                                        <li>• <strong className="font-bold text-black">Positive:</strong> A well-timed proposal that responds appropriately to the shift in the real estate asset management profit model from 'Capital Allocation' to 'Operational Efficiency'.</li>
                                        <li>• <strong className="font-bold text-black">Room for Improvement:</strong> While the technical architecture is clear, the proposal lacks a detailed governance strategy to enforce or incentivize data entry by field PMs during the initial deployment phase.</li>
                                    </ul>
                                </div>

                                {/* Section 2 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        2. Strengths
                                    </h3>
                                    <ul className="space-y-4 ml-1 mb-6 text-gray-700">
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[Validity of Data Structuring]</strong>
                                            The biggest hurdle in adopting AI in the financial sector is processing unstructured legacy data (meeting minutes, emails, etc.). This proposal introduces a schema that combines structured financial models with unstructured event logs from the design phase, significantly enhancing data integrity for future RAG (Retrieval-Augmented Generation) implementation.
                                        </li>
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[Capitalizing Operational Context]</strong>
                                            The approach to centralize 'deal-level experience,' previously isolated to individual PMs, into an enterprise system is strategically valid. Long-term, this will mitigate risks associated with personnel turnover and contribute to the accumulation of institutional intellectual capital.
                                        </li>
                                    </ul>
                                </div>

                                {/* Section 3 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        3. Weaknesses & Risks
                                    </h3>
                                    <ul className="space-y-4 ml-1 mb-6 text-gray-700">
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[Business Friction Costs]</strong>
                                            Field PMs focus on short-term deal closing and yield defense. If system data entry is perceived as an additional workload, securing high-quality data will fail. Although the concept of 'Zero-Friction' is mentioned, specific incentive structures or KPI linkages to realize this are currently missing.
                                        </li>
                                        <li>
                                            <strong className="font-bold text-black block mb-1">[ROI Validation]</strong>
                                            Before large-scale enterprise system development, an ROI validation through a Minimum Viable Product (MVP) must precede. The target asset class for the pilot test and the Success Metrics need to be clearly defined.
                                        </li>
                                    </ul>
                                </div>

                                {/* Section 4 */}
                                <div>
                                    <h3 className="font-extrabold text-[16px] md:text-[18px] mb-4 text-[#1a1a1a]">
                                        4. Recommendations
                                    </h3>
                                    <div className="pt-2">
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            The direction of this proposal perfectly aligns with the current digital transformation (DX) trends in the financial and proptech industries.
                                        </p>
                                        <p className="text-gray-700 leading-relaxed">
                                            For successful integration, technical infrastructure development must be accompanied by 'institutional mechanisms' that strongly incentivize practical use. We recommend a phased expansion: selecting a pilot department to aggressively accumulate operational data for the first three months, and then demonstrating the tangible outputs (e.g., automated reporting, early risk detection) to the entire organization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="fixed bottom-0 left-0 w-full h-[140px] bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-[40]"></div>
        </div>
    );
}
