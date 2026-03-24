import React, { useState, useEffect } from 'react';
import openclawImg from '../assets/openclaw.jpg';

export default function Section2({ isActive }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // Cinematic Sequencing
        const t1 = setTimeout(() => setStep(1), 500);  // "대표님은 알고계실 것입니다." 크게 뜸
        const t2 = setTimeout(() => setStep(2), 2200); // 텍스트 작아지며 위에 OpenClaw 등장
        const t3 = setTimeout(() => setStep(3), 3200); // 밑에 텍스트 등장

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-[#fbfbfd] overflow-y-auto relative px-4">
            <div className="w-full min-h-full flex flex-col items-center justify-center py-24 md:py-32">
                
                {/* 일반 Flex Flow로 변경하여 3페이지처럼 완벽하게 줄간격 밀착 */}
                <div className="flex flex-col items-center justify-center text-center max-w-[1000px] w-full gap-1 md:gap-2 relative">
                    
                    {/* 2. Top Logo & Text */}
                    <div 
                        className={`flex flex-col items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden ${step >= 2 ? 'opacity-100 max-h-[300px] mb-2' : 'opacity-0 max-h-0 mb-0'}`}
                    >
                        <img 
                            src={openclawImg} 
                            alt="OpenClaw Logo" 
                            className="h-[50px] md:h-[70px] object-contain mb-2 md:mb-3 mix-blend-multiply" 
                        />
                        <p className="text-[32px] md:text-[46px] font-bold text-gray-500 tracking-tight leading-tight">
                            OpenClaw를 쓰고 계신
                        </p>
                    </div>

                    {/* 1. Middle Text (Hero) - 크기가 작아지지 않게 고정 */}
                    <div 
                        className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                        <p className="text-[32px] md:text-[46px] font-bold text-[#1d1d1f] tracking-tight leading-tight">
                            대표님은 알고 계실 것입니다.
                        </p>
                    </div>

                    {/* 3. Bottom Text - 핵심 메시지 강조 칼라 (신뢰의 Blue) */}
                    <div 
                        className={`flex flex-col items-center transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden ${step >= 3 ? 'opacity-100 max-h-[200px] mt-2' : 'opacity-0 max-h-0 mt-0'}`}
                    >
                        <p className="text-[32px] md:text-[46px] font-bold text-blue-600 tracking-tight leading-tight">
                            내 PC에 들어와 모든 걸 할 수 있는 AI의 위력을.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
