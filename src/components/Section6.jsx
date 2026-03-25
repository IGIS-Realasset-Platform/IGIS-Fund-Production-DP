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
        <section className="section w-full h-full bg-black flex flex-col items-center justify-center relative px-6 md:px-12">
            
            <div className="w-full max-w-[1280px] flex flex-col md:flex-row items-center justify-center gap-[40px] md:gap-[80px] lg:gap-[120px]">
                
                {/* Left: Portrait Image */}
                <div 
                    className={`w-[240px] h-[300px] md:w-[320px] md:h-[400px] lg:w-[360px] lg:h-[450px] shrink-0 overflow-hidden bg-[#1a1a1a] transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
                >
                    {/* Placeholder for Josh Panknin's Portrait. User needs to replace src */}
                    <img 
                        src="/josh_panknin.jpg" 
                        alt="Josh Panknin" 
                        className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-gray-500 font-sans tracking-widest text-[11px] md:text-[13px] border border-[#333] p-4 text-center leading-relaxed"><span class="block mb-2 text-white">IMAGE PLACEHOLDER</span>첨부해주신 이미지를<br/>public/josh_panknin.jpg<br/>경로에 저장해주세요.</div>';
                        }}
                    />
                </div>

                {/* Right: Quote Content */}
                <div className="flex flex-col flex-1 max-w-[700px]">
                    
                    {/* Main Quote */}
                    <div className="overflow-hidden">
                        <p 
                            className={`text-[22px] md:text-[32px] lg:text-[40px] leading-[1.3] text-white font-light tracking-tight transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] break-keep ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ fontFamily: "'Sanomat Wp', 'Sanomat Web', 'Sanomat', 'Apple SD Gothic Neo', sans-serif" }}
                        >
                            {lang === 'kr' ? (
                                <>“AI는 IT의 문제가 아니라 <span className="font-semibold" style={{ color: '#fff' }}>데이터의 문제</span>입니다. 부동산 업계가 AI를 도입하고 싶어 하지만, 과거 수십 년간 쌓인 로컬 데이터가 표준화되지 않았기에 AI는 제대로 작동할 수 없습니다.”</>
                            ) : (
                                <>"AI is not an IT problem, it's a <span className="font-semibold" style={{ color: '#fff' }}>Data problem</span>. The real estate industry wants AI, but because decades of local data remain unstructured, AI simply cannot function."</>
                            )}
                        </p>
                    </div>

                    <div className="overflow-hidden mt-6 md:mt-8">
                        <p 
                            className={`text-[17px] md:text-[22px] lg:text-[26px] leading-[1.35] text-[#a1a1aa] font-light tracking-tight transition-all duration-[1500ms] delay-[200ms] ease-[cubic-bezier(0.19,1,0.22,1)] break-keep ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ fontFamily: "'Sanomat Wp', 'Sanomat Web', 'Sanomat', 'Apple SD Gothic Neo', sans-serif" }}
                        >
                            {lang === 'kr' ? (
                                <>“현재 글로벌 최상위 운용사들만이 <strong className="text-white font-medium">데이터 정제 및 파이프라인 구축</strong>에 천문학적인 자본을 쏟고 있습니다. 향후 그 결과에 따라 투자 성과의 격차는 극명하게 갈릴 것입니다.”</>
                            ) : (
                                <>"Currently, only top-tier global operators are pouring astronomical capital into <strong className="text-white font-medium">data cleansing and pipelines</strong>. The future performance gap will be stark."</>
                            )}
                        </p>
                    </div>

                    {/* Name and Title (Right Aligned under the quote) */}
                    <div 
                        className={`flex flex-col items-end mt-12 md:mt-16 text-right transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <span className="text-white text-[16px] md:text-[20px] font-bold tracking-wide mb-1" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                            Josh Panknin
                        </span>
                        <span className="text-gray-400 text-[12px] md:text-[14px] font-light tracking-wider opacity-80 max-w-[300px] leading-snug" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                            {lang === 'kr' ? "Columbia Univ. 부동산 AI 연구 및 혁신 디렉터" : "Director of Real Estate AI Research & Innovation, Columbia Univ."}
                        </span>
                    </div>

                </div>
            </div>
        </section>
    );
}
