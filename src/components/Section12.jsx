import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section12({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // Staggered fade-in animations
        const t1 = setTimeout(() => setStep(1), 100);  // Heading
        const t2 = setTimeout(() => setStep(2), 500);  // Quote
        const t3 = setTimeout(() => setStep(3), 900);  // Paragraph 1
        const t4 = setTimeout(() => setStep(4), 1300); // Paragraph 2 (Bold)
        const t5 = setTimeout(() => setStep(5), 1700); // Paragraph 3
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [isActive]);

    return (
        <section className="relative section w-full h-full flex flex-col justify-center items-center overflow-hidden">
            
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 transform transition-transform duration-[10000ms] ease-out"
                style={{ 
                    backgroundImage: `url('${import.meta.env.BASE_URL}car.jpg')`,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
            />
            {/* Dimming Overlay to ensure text readability */}
            <div className={`absolute inset-0 bg-black/65 z-10 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            {/* Content Container */}
            <div className={`relative z-20 w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1200px] mx-auto text-white flex flex-col font-sans break-keep pt-10`}>
                
                {/* 1. Main Heading */}
                <h2 
                    className={`text-[28px] md:text-[36px] lg:text-[45px] font-bold tracking-tight mb-10 transition-all duration-1000 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    {lang === 'kr' ? (
                        <>맥락 없는 데이터는 쓰레기와 같습니다.</>
                    ) : (
                        <>Contextless data is garbage.</>
                    )}
                </h2>

                {/* 2. Emphasized Quote */}
                <h3 
                    className={`text-[20px] md:text-[26px] lg:text-[30px] font-bold text-[#f5f5f7] leading-[1.4] mb-10 transition-all duration-1000 ease-out ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    {lang === 'kr' ? (
                        <>
                            "얼마 전, AI 에이전트가 한 기업의 주요 데이터를 완전히 날려버렸습니다."
                        </>
                    ) : (
                        <>
                            "Recently, an AI agent completely wiped out a company's critical data."
                        </>
                    )}
                </h3>

                {/* 3. Paragraph 1 */}
                <p 
                    className={`text-[16px] md:text-[18px] lg:text-[20px] font-medium text-[#d2d2d7] leading-[1.65] mb-10 transition-all duration-1000 ease-out ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    {lang === 'kr' ? (
                        <>
                            AI는 유능했습니다. 단지, 자신이 부수고 있는 것이 테스트 서버인지 실제 비즈니스 서버인지 구분할<br className="hidden lg:block"/>
                            <strong className="text-white font-bold">'조직의 맥락'</strong>이 시스템에 입력되어 있지 않았을 뿐입니다.
                        </>
                    ) : (
                        <>
                            The AI was highly capable. It simply lacked the <strong className="text-white font-bold">'organizational context'</strong> to distinguish<br className="hidden lg:block"/>
                            whether it was destroying a test server or a live production server.
                        </>
                    )}
                </p>

                {/* 4. Paragraph 2 (Bold core message) */}
                <p 
                    className={`text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white leading-[1.65] mb-10 transition-all duration-1000 ease-out ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    {lang === 'kr' ? (
                        <>
                            AI의 능력은 '맥락 (Context)'에 좌우됩니다.<br/>
                            맥락 없는 데이터는 AI라는 운전자를 최고급 엔진만 있고 운전대가 없는 포르쉐에 태운 것과 같습니다.
                        </>
                    ) : (
                        <>
                            An AI's true ability is solely dependent on 'Context'.<br/>
                            Contextless data is like putting an AI driver in a Porsche with a top-tier engine, but no steering wheel.
                        </>
                    )}
                </p>

                {/* 5. Paragraph 3 (Conclusion point) */}
                <p 
                    className={`text-[16px] md:text-[18px] lg:text-[20px] font-medium text-[#d2d2d7] leading-[1.65] transition-all duration-1000 ease-out ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    {lang === 'kr' ? (
                        <>
                            이것이 전세계 95%의 기업이 AI 도입에 실패하고 치명적인 리스크를 안게 되는 이유입니다.
                        </>
                    ) : (
                        <>
                            This is why 95% of companies worldwide fail at AI adoption and face fatal risks.
                        </>
                    )}
                </p>

            </div>
        </section>
    );
}
