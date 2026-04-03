import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section16({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }

        let timers = [];
        timers.push(setTimeout(() => setStep(1), 500));  // Headers
        timers.push(setTimeout(() => setStep(2), 1200)); // Dashboard Wireframe & Green Dots
        timers.push(setTimeout(() => setStep(3), 2000)); // Red Flag
        timers.push(setTimeout(() => setStep(4), 2800)); // Exception Box
        timers.push(setTimeout(() => setStep(5), 3800)); // Approve Button

        return () => timers.forEach(t => clearTimeout(t));
    }, [isActive]);

    // Generate random stable coordinates for the "normal" green dots
    const [normalDots, setNormalDots] = useState([]);
    useEffect(() => {
        const dots = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            top: `${Math.floor(Math.random() * 85) + 5}%`,
            left: `${Math.floor(Math.random() * 85) + 5}%`,
            // Random opacity for realistic dashboard noise
            opacity: Math.random() * 0.4 + 0.1
        }));
        setNormalDots(dots);
    }, []);

    return (
        <section className={`relative section w-full h-full flex flex-col justify-center items-center overflow-hidden bg-[#0a0a0c] text-white transition-colors duration-1000`}>
            
            <style>
                {`
                    @keyframes purePulse {
                        0% { box-shadow: 0 0 0 0 rgba(255, 59, 59, 0.7); }
                        70% { box-shadow: 0 0 0 15px rgba(255, 59, 59, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 59, 59, 0); }
                    }
                `}
            </style>

            <div className="w-full max-w-[1400px] px-6 md:px-12 h-full flex flex-col pt-24 pb-16 relative">
                
                {/* 1. Executive Headers */}
                <div className={`relative z-30 mb-8 md:mb-12 transition-all duration-1000 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="text-white/40 font-bold text-[13px] tracking-[0.2em] uppercase mb-4 block">
                        Executive View
                    </span>
                    <h2 className="text-[40px] md:text-[54px] font-bold text-white leading-[1.1] tracking-tight mb-4">
                        {lang === 'kr' ? '데이터 기반의 권한 위임(DA)' : 'Data-Driven Delegation of Authority'}
                    </h2>
                    <p className="text-[18px] md:text-[21px] font-medium text-white/50 leading-[1.6] break-keep max-w-[800px]">
                        {lang === 'kr' ? '마이크로매니지먼트는 이제 플랫폼이 대체합니다. 경영진은 오직 핵심적인 전략 판단과 승인(Approval)에만 집중하십시오.' : 'Micromanagement is replaced by the platform. Executives focus solely on strategic judgments and approvals.'}
                    </p>
                </div>

                {/* 2. Minimalist Wireframe Dashboard Matrix */}
                <div className={`w-full flex-1 relative flex items-center justify-center transition-all duration-1000 ease-out delay-300 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    
                    {/* Dark Minimalist Grid Background */}
                    <div className="absolute inset-0 bg-[#0d0d10] border border-white/5 rounded-sm overflow-hidden flex justify-center items-center">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
                        
                        {/* Subdued Normal Green Dots */}
                        <div className="absolute w-full h-full">
                            {normalDots.map(dot => (
                                <div 
                                    key={dot.id}
                                    className="absolute w-[4px] h-[4px] bg-[#34d399] rounded-full"
                                    style={{
                                        top: dot.top,
                                        left: dot.left,
                                        opacity: dot.opacity
                                    }}
                                />
                            ))}
                        </div>

                        {/* Centered Dashboard Abstraction Lines */}
                        <div className="absolute w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent top-[30%]" />
                        <div className="absolute w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent bottom-[30%]" />
                        <div className="absolute h-[80%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent left-[35%]" />
                    </div>

                    {/* 3. The Red Flag Risk Indicator */}
                    <div className="absolute top-[42%] left-[45%] z-20">
                        {/* Flashing Dot */}
                        <div className={`relative flex justify-center items-center transition-opacity duration-1000 ease-out ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                            <div className="w-[12px] h-[12px] bg-[#ff3b3b] rounded-full" style={{ animation: 'purePulse 2s infinite' }} />
                        </div>

                        {/* 4. Strategic Exception Box */}
                        <div className={`absolute left-[30px] top-[-30px] w-[340px] md:w-[420px] bg-[#141417]/95 backdrop-blur-md border border-[#ffffff15] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out origin-left ${step >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-[6px] h-[6px] bg-[#ff3b3b] rounded-full animate-pulse" />
                                <h4 className="text-[#ff3b3b] text-[11px] md:text-[13px] font-bold tracking-[0.15em] uppercase">
                                    Critical Exception
                                </h4>
                                <span className="ml-auto text-white/30 text-[11px] font-mono">ID: PF-A29-8X</span>
                            </div>
                            
                            <h3 className="text-white text-[20px] md:text-[23px] font-bold leading-[1.3] tracking-tight mb-3 break-keep">
                                {lang === 'kr' ? '공사비 증액 2차 리스크 발동' : 'Phase 2 Construction Cost Risk Triggered'}
                            </h3>
                            
                            <p className="text-white/60 text-[14px] md:text-[15px] font-medium leading-[1.6] break-keep mb-5">
                                {lang === 'kr' ? 'B-04 구역 철근 자재 단가 폭등으로 인한 공사비 한도 초과 위험이 감지되었습니다. 현장 조율 프로세스가 한계에 도달하여, 추가 예산 집행에 대한 경영진의 전략적 승인이 즉시 요구됩니다.' : 'Severe risk of exceeding construction budget due to material cost surges in Zone B-04. Field negotiation processes have reached capacity; immediate executive strategic approval required.'}
                            </p>

                            <div className="w-full h-[1px] bg-white/10 mb-4" />

                            <div className="flex justify-between items-center w-full text-[13px] font-bold text-white/40">
                                <span>Impact: High Severity</span>
                                <span>Action Req: Execute</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 5. Minimalist Approval Button (Absolute Bottom Right) */}
            <div className={`absolute bottom-10 right-10 md:bottom-20 md:right-20 z-40 transition-all duration-[1500ms] ease-out ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <button className="group relative flex items-center justify-center px-10 md:px-14 py-4 md:py-5 border border-white/20 bg-black/50 hover:bg-white transition-all duration-700 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.0)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    <span className="relative z-10 text-[14px] md:text-[16px] font-bold tracking-[0.2em] uppercase text-white group-hover:text-black transition-colors duration-700">
                        {lang === 'kr' ? 'Approve' : 'Approve'}
                    </span>
                    <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                </button>
            </div>

        </section>
    );
}
