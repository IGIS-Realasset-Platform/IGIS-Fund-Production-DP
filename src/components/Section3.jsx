import React, { useState, useEffect } from 'react';

export default function Section3({ isActive }) {
    const [step, setStep] = useState(0);
    const [bump, setBump] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            setBump(false);
            return;
        }
        
        // 0.8s 간격 (800ms)
        const t1 = setTimeout(() => setStep(1), 500);
        const t2 = setTimeout(() => setStep(2), 1300);
        const t3 = setTimeout(() => setStep(3), 2100);
        const t4 = setTimeout(() => setStep(4), 2900);
        const t5 = setTimeout(() => setStep(5), 3700);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [isActive]);

    // 새로운 텍스트가 뜰 때 기존 텍스트들이 살짝 위로 밀려올라가는 효과
    useEffect(() => {
        if (step > 1 && step <= 5) {
            setBump(true);
            const tm = setTimeout(() => setBump(false), 300); // 300ms 후에 다시 제자리로 리턴
            return () => clearTimeout(tm);
        }
    }, [step]);

    const getClasses = (index) => {
        const base = "transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]";
        if (step < index) {
            return `${base} opacity-0 translate-y-12`; // 처음엔 아래에 숨어있음
        }
        if (bump && step > index) {
            return `${base} opacity-100 -translate-y-3`; // 새 줄이 뜰 때 위로 살짝 들림
        }
        return `${base} opacity-100 translate-y-0`; // 평상시 제자리
    };

    return (
        <section className="section w-full h-full bg-white flex flex-col items-center justify-center relative px-4">
            <div 
                className="text-[40px] md:text-[46px] flex flex-col items-start justify-center text-[#999] font-sans tracking-tight leading-snug gap-8 relative"
                style={{ fontWeight: 700 }}
            >
                {/* Block 1 */}
                <div className={getClasses(1)}>
                    AI의 진짜 위력은<br />
                    내 PC 안의 <span className="text-black">'리치한 데이터(Rich Data)'</span>에서 나옵니다.
                </div>

                {/* Block 2 */}
                <div className={getClasses(2)}>
                    <span className="text-black">IGIS도 마찬가지입니다.</span>
                </div>

                {/* Block 3 */}
                <div className={getClasses(3)}>
                    직원들을 위한 거창한 AI 교육은 필요 없습니다.<br />
                    지금처럼 <span className="text-black">검색창에 필요한 질문</span>만 던지면 되니까요.
                </div>

                {/* Block 4 */}
                <div className={getClasses(4)}>
                    하지만 그 가벼운 질문에,<br />
                    AI가 얼마나 <span className="text-black">깊고 날카로운 정답</span>을 내놓을 수 있는가.
                </div>

                {/* Block 5 */}
                <div className={getClasses(5)}>
                    그것은 오직,<br />
                    이지스 내부에 흐르는 <span className="text-black">'데이터의 깊이'</span>에 달려있습니다.
                </div>
            </div>
        </section>
    );
}
