import React, { useState, useEffect } from 'react';

export default function Section1() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 100); // 0.1초 후 바로 통통 튀어오르게
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="section min-h-screen bg-white flex flex-col items-center justify-center relative">
            <div className="logo-fade w-full flex justify-center pb-20">
                <div 
                    className={`flex text-black text-center px-4 antialiased transition-all duration-[800ms] ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
                    style={{ 
                        fontFamily: "'Sanomat Wp', 'Sanomat Web', 'Sanomat', sans-serif",
                        fontSize: "70px",
                        fontWeight: 500, 
                        letterSpacing: "-0.01em",
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" // 밑에서 뽕 뜨는 바운스 효과
                    }}
                >
                    IGIS Fund Production Data Platform
                </div>
            </div>
            <div id="keyboard-hint"
                className="absolute bottom-12 flex items-center gap-12 transition-opacity duration-1000 text-gray-400">
                <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    <span className="text-[12px] uppercase font-bold tracking-widest text-black">Prev</span>
                </div>
                <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <span className="text-[12px] uppercase font-bold tracking-widest text-black">Next</span>
                </div>
            </div>
        </section>
    );
}
