import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import openclawImg from '../assets/openclaw.jpg';

export default function Section2({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // Cinematic Sequencing for the new Employee-facing text
        const t1 = setTimeout(() => setStep(1), 500);  // Line 1
        const t2 = setTimeout(() => setStep(2), 1500); // Line 2
        const t3 = setTimeout(() => setStep(3), 2500); // Line 3
        const t4 = setTimeout(() => setStep(4), 4200); // Small text
        const t5 = setTimeout(() => setStep(5), 5200); // OpenClaw Box

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-white overflow-y-auto relative px-4 flex flex-col">
            <div className="w-full flex flex-col items-center justify-center py-24 md:py-32 my-auto">
                
                <div className="flex flex-col items-start justify-center text-left max-w-[1100px] w-full gap-0 relative border-l-0 pl-0 -translate-y-[20px] md:-translate-y-[30px]">
                    
                    {/* Line 1 */}
                    <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <p className="text-[28px] md:text-[38px] font-bold text-[#666] tracking-tight leading-[1.2]">
                            {lang === 'kr' ? "바깥 세상의 지식만 읊어대는 평범한 AI를 넘어," : "Beyond ordinary AI merely reciting worldly knowledge,"}
                        </p>
                    </div>

                    {/* Line 2 */}
                    <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] mt-2 md:mt-4 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <p className="text-[34px] md:text-[48px] font-bold text-[#1d1d1f] tracking-tight leading-[1.15] break-keep">
                            {lang === 'kr' ? "내 PC 안의 수많은 파일과 문서들을 통째로 꿰뚫어 보고 분석하는" : "an exclusive AI that perfectly penetrates and analyzes all files and documents in your PC,"}
                        </p>
                    </div>

                    {/* Line 3 */}
                    <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] mt-2 md:mt-4 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <p className="text-[34px] md:text-[48px] font-bold text-[#1d1d1f] tracking-tight leading-[1.15] break-keep">
                            <span className="text-[#297cf6]">{lang === 'kr' ? "나만의 전용 AI" : "your own dedicated AI"}</span>
                            {lang === 'kr' ? "가 쏟아낼 압도적인 결과물들을 상상해 보신 적 있습니까?" : " – have you ever imagined the overwhelming results it could produce?"}
                        </p>
                    </div>

                    {/* Sub Text 1 */}
                    <div className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] mt-16 md:mt-24 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <p className="text-[20px] md:text-[24px] font-medium text-[#555] tracking-tight border-l-[3px] border-[#297cf6] pl-4 leading-[1.4]">
                            {lang === 'kr' ? "그런 AI들이 이미 작동하고 사용되어지고 있습니다." : "Such AIs are actually already operating and being utilized today."}
                        </p>
                    </div>

                    {/* OpenClaw Reveal Box */}
                    <div className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] mt-6 w-full ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-[#f8f9fa] border border-[#e2e8f0] rounded-2xl p-6 md:px-8 md:py-6 w-full max-w-[950px] shadow-sm hover:shadow-md transition-shadow duration-500">
                            <img src={openclawImg} alt="OpenClaw Logo" className="h-[28px] md:h-[34px] object-contain mix-blend-multiply opacity-90 shrink-0" />
                            <p className="text-[17px] md:text-[19px] text-[#444] leading-[1.6] break-keep font-medium">
                                {lang === 'kr' ? 
                                "오픈클로(OpenClaw)는 내 PC 내의 엑셀, 문서, PPT 등 산재된 실무 데이터를 직접 읽고 맥락을 융합하여 기안서 초안과 인사이트를 실시간으로 작성해 주는 이지스 전용 업무 인프라 AI입니다." : 
                                "OpenClaw is an exclusive business AI infrastructure that directly reads and fuses practical data from your PC history to draft documents and provide core insights in real-time."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
