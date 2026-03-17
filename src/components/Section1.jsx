import React from 'react';

export default function Section1() {
    return (
        <section className="section min-h-screen bg-black flex flex-col items-center justify-center relative">
            <div className="logo-fade w-full flex justify-center pb-20">
                <img  src="./img/logo_white.webp" width="856" height="286" alt="IOTA Logo" className="h-20 md:h-28 object-contain" fetchPriority="high" loading="eager" />
            </div>
            <div id="scroll-arrow"
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity duration-1000">
                <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </div>
        </section>
    );
}
