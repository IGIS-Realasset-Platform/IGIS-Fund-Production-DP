import React, { useState, useEffect } from 'react';

export default function Section2({ isActive }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // 1. 가운데 텍스트 등장 (0.5s)
        const t1 = setTimeout(() => setStep(1), 500);
        // 2. 그 위 텍스트 등장 (0.8s 간격 -> 1.3s)
        const t2 = setTimeout(() => setStep(2), 1300);
        // 3. 그 아래 텍스트 등장 (0.8s 간격 -> 2.1s)
        const t3 = setTimeout(() => setStep(3), 2100);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-white flex flex-col items-center justify-center relative px-4">
            <div 
                className="w-full max-w-[800px] text-[50px] flex flex-col items-start text-black font-sans tracking-tight leading-tight gap-1"
                style={{ fontWeight: 400 }}
            >
                {/* 2. Top */}
                <div className={`transition-all duration-500 ease-out ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    OpenClaw를 쓰고계신
                </div>

                {/* 1. Middle */}
                <div className={`font-bold transition-all duration-500 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    대표님은 알고계실 것입니다.
                </div>

                {/* 3. Bottom */}
                <div className={`transition-all duration-500 ease-out ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    내 PC에 들어와 모든걸 볼 수 있는 AI의 위력을
                </div>
            </div>
        </section>
    );
}
