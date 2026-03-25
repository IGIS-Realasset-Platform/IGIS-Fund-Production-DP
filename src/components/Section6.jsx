import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section6({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        const t1 = setTimeout(() => setStep(1), 500); // Image fade in
        const t2 = setTimeout(() => setStep(2), 1000); // Quote text fade in
        const t3 = setTimeout(() => setStep(3), 1800); // Name and title fade in
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-black flex flex-col items-center justify-center relative px-6 md:px-16 lg:px-24">
            
            <div className="w-full max-w-[1400px] flex flex-col md:flex-row items-center md:items-start justify-between gap-[40px] md:gap-[80px] lg:gap-[100px]">
                
                {/* Left: Portrait Image */}
                <div 
                    className={`w-[260px] md:w-[340px] lg:w-[400px] shrink-0 overflow-hidden bg-[#1a1a1a] transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
                    style={{ aspectRatio: '3 / 4' }}
                >
                    <img 
                        src="/josh_panknin.jpg" 
                        alt="Josh Panknin" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-gray-500 font-sans tracking-widest text-[13px] border border-[#333] p-4 text-center leading-relaxed"><span class="block text-white">IMAGE</span></div>';
                        }}
                    />
                </div>

                {/* Right: Quote Content */}
                <div className="flex flex-col flex-1 max-w-[850px] md:pt-[20px] lg:pt-[40px]">
                    
                    {/* Main Quote */}
                    <div className="overflow-visible">
                        <p 
                            className={`text-[24px] md:text-[36px] lg:text-[42px] xl:text-[46px] leading-[1.4] text-[#f4f4f5] font-light transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] break-keep ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ 
                                fontFamily: "'Guardian Sans', 'Apple SD Gothic Neo', 'Helvetica Neue', sans-serif",
                                letterSpacing: "-0.01em"
                            }}
                        >
                            {lang === 'kr' ? (
                                <>“AI는 IT의 문제가 아니라 데이터의 문제입니다. 과거 수십 년간 쌓인 로컬 데이터가 정리되지 않았기에, 오직 글로벌 최상위 운용사들만이 데이터 파이프라인 구축에 천문학적인 자본을 쏟고 있습니다. 향후 투자 성과의 격차는 여기서 극명하게 갈릴 것입니다.”</>
                            ) : (
                                <>“AI is not an IT problem; it's a data problem. Because decades of local data remain unstructured, only top-tier global operators are pouring astronomical capital into data pipelines. The future performance gap will be stark.”</>
                            )}
                        </p>
                    </div>

                    {/* Name and Title (Left aligned inner text, aligned to right side of parent box) */}
                    <div 
                        className={`flex w-full mt-12 md:mt-16 lg:mt-24 transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="flex flex-col text-left ml-auto w-full md:w-[60%] lg:w-[50%]">
                            <span 
                                className="text-white text-[18px] md:text-[20px] font-semibold mb-1" 
                                style={{ fontFamily: "'Guardian Sans', 'Helvetica Neue', sans-serif" }}
                            >
                                Josh Panknin
                            </span>
                            <span 
                                className="text-[#e4e4e7] text-[15px] md:text-[17px] font-light tracking-wide" 
                                style={{ fontFamily: "'Guardian Sans', 'Apple SD Gothic Neo', 'Helvetica Neue', sans-serif" }}
                            >
                                {lang === 'kr' ? "Columbia Univ. 부동산 AI 연구 및 혁신 디렉터" : "Director of Real Estate AI Research & Innovation, Columbia Univ."}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
