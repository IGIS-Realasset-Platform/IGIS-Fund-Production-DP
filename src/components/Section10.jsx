import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section10({ isActive }) {
    const { lang } = useLanguage();
    
    // Staggered animation states for a formal, 'dry' presentation feel
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isActive) {
            const t1 = setTimeout(() => setStep(1), 300);
            const t2 = setTimeout(() => setStep(2), 1100);
            const t3 = setTimeout(() => setStep(3), 1900);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        } else {
            setStep(0);
        }
    }, [isActive]);

    return (
        <section className="relative w-full h-full bg-[#fbfbfd] flex flex-col justify-center items-center overflow-hidden">
            <div className="w-full max-w-[1200px] px-6 md:px-12 lg:px-24 mx-auto flex flex-col justify-center h-full pt-[60px] md:pt-0">
                
                {/* Structural left border for an editorial, non-advertising, professional aesthetic */}
                <div className={`w-full max-w-[900px] border-l-[3px] border-[#1d1d1f] pl-6 md:pl-10 lg:pl-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                    
                    <h2 className="text-[28px] md:text-[45px] lg:text-[56px] font-bold leading-[1.25] text-[#1d1d1f] tracking-tight mb-8 md:mb-12 break-keep">
                        {lang === 'kr' ? (
                            <>
                                산업혁명 시대의 <span className="text-[#86868b] font-medium">증기기관</span>,<br/>
                                정보화 시대의 <span className="text-[#86868b] font-medium">World Wide Web</span>.<br/>
                                <span className={`inline-block mt-6 md:mt-8 font-extrabold text-[#1d1d1f] text-[40px] md:text-[64px] lg:text-[80px] tracking-tighter transition-all duration-[1200ms] ease-out transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                    그리고 AI.
                                </span>
                            </>
                        ) : (
                            <>
                                The <span className="text-[#86868b] font-medium">Steam Engine</span> of the Industrial Revolution,<br/>
                                The <span className="text-[#86868b] font-medium">World Wide Web</span> of the Information Age.<br/>
                                <span className={`inline-block mt-6 md:mt-8 font-extrabold text-[#1d1d1f] text-[40px] md:text-[64px] lg:text-[80px] tracking-tighter transition-all duration-[1200ms] ease-out transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                    And AI.
                                </span>
                            </>
                        )}
                    </h2>

                    <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <p className="text-[15px] md:text-[18px] lg:text-[20px] font-medium leading-[1.7] text-[#1d1d1f] mb-12 md:mb-16 break-keep max-w-[750px]">
                            {lang === 'kr' ? (
                                <>특정 시대를 관통하는 필수재(Infrastructure)가 존재했듯, IFPDP는 AI 시대에 이지스를 움직이는 근본적인 '엔진(The Engine)'으로 기능합니다. 단순한 데이터 저장 공간을 넘어, 조직의 <span className="font-bold">의사결정과 밸류체인을 하나로 연결하는</span> 대체 불가능한 핵심 동력입니다.</>
                            ) : (
                                <>Just as indispensable infrastructures have defined specific eras, IFPDP functions as the fundamental 'Engine' that drives IGIS in the AI era. Beyond a mere data repository, it is an irreplaceable core dynamic connecting <span className="font-bold">organizational decision-making and value chains as one</span>.</>
                            )}
                        </p>

                        {/* 사용자 검토용 3가지 대안 렌더링 영역 */}
                        <div className="flex flex-col gap-16 mt-4 w-full">
                            
                            {/* 대안 1: 매니페스토 스탬프 */}
                            <div className="relative">
                                <span className="absolute -top-6 left-0 text-[11px] text-red-500 font-bold">OPTION 1. 매니페스토 스탬프 (드라이 & 공문서 스타일)</span>
                                <div className="border-l-[4px] border-[#1d1d1f] pl-5 py-2">
                                    <p className="font-mono text-[11px] md:text-[13px] text-[#86868b] tracking-widest uppercase mb-1">System Status</p>
                                    <p className="text-[16px] md:text-[20px] font-extrabold text-[#1d1d1f] tracking-tight">INITIALIZED: THE ENGINE OF IGIS</p>
                                </div>
                            </div>

                            {/* 대안 2: 엔진 가동 마이크로 애니메이션 */}
                            <div className="relative">
                                <span className="absolute -top-6 left-0 text-[11px] text-red-500 font-bold">OPTION 2. 인디케이터 애니메이션 (시스템 가동 메타포)</span>
                                <div className="flex items-center gap-4 bg-[#f2f2f7] px-6 py-4 inline-flex">
                                    <div className="text-[12px] md:text-[14px] font-bold text-[#1d1d1f] uppercase tracking-widest">Core Engine Active</div>
                                    <div className="flex gap-[3px] items-center h-[14px]">
                                        <div className="w-[3px] bg-[#1d1d1f] animate-pulse h-full"></div>
                                        <div className="w-[3px] bg-[#86868b] animate-pulse delay-100 h-3/4"></div>
                                        <div className="w-[3px] bg-[#1d1d1f] animate-pulse delay-200 h-full"></div>
                                        <div className="w-[3px] bg-[#86868b] animate-pulse delay-300 h-2/4"></div>
                                    </div>
                                </div>
                            </div>

                            {/* 대안 3: 넥스트 스텝 선언문 */}
                            <div className="relative">
                                <span className="absolute -top-6 left-0 text-[11px] text-red-500 font-bold">OPTION 3. 비저너리 텍스트 블록 (단호한 선언 스타일)</span>
                                <div className="bg-[#1d1d1f] text-white px-8 py-5 md:px-12 md:py-6 inline-block">
                                    <p className="text-[14px] md:text-[16px] font-bold tracking-widest uppercase break-keep">
                                        {lang === 'kr' ? "지금, 전사적 엔진이 가동됩니다." : "NOW, THE CORPORATE ENGINE STARTS."}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
