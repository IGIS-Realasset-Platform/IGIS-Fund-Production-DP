import React from 'react';
import HoverImage from './HoverImage';

export default function SectionGreen() {
    return (
        <section className="section w-full h-auto bg-white pt-[100px] md:pt-[150px] pb-[100px] overflow-hidden" id="section-green">
            <style>
                {`
                    @keyframes panXSlow {
                        0%, 100% { transform: translateX(0); }
                        50% { transform: translateX(calc(-100% + 100vw)); }
                    }
                    .animate-pan-x-slow {
                        animation: panXSlow 40s ease-in-out infinite;
                    }
                `}
            </style>
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col">

                {/* TEXT CONTENT */}
                <div className="w-full flex flex-col items-center mb-12 bs-fade-up">
                    <h2 className="text-[40px] md:text-[50px] lg:text-[59px] font-extrabold text-[#2F4F4F] mb-2 leading-tight tracking-[-0.03em] font-inter text-center"
                        data-en="Directly Connected to Namsan Park"
                        data-kr="Directly Connected to Namsan Park">
                        Directly Connected to Namsan Park
                    </h2>

                    <h3 className="text-[17px] md:text-[20px] lg:text-[22px] font-bold text-[#3B7062] mb-12 tracking-tight leading-[1.1] md:leading-snug text-center"
                        data-kr="서울의 심장이자, 최대 녹지(87만평) 남산공원과 연결"
                        data-en="Connected to Seoul's Heart and Its Largest Green Space – Namsan Park">
                        Connected to Seoul's Heart and Its Largest Green Space – Namsan Park
                    </h3>

                    {/* TWO COLUMN LAYOUT: Text on Left, Stats on Right */}
                    <div className="w-full max-w-[1420px] flex flex-col xl:flex-row justify-between items-center pt-8 pb-4">

                        {/* LEFT COLUMN: Description Text */}
                        <div className="flex-1 text-[18px] md:text-[20px] font-medium text-gray-800 leading-[1.57] md:leading-[1.57] tracking-[-0.02em] break-keep text-left md:text-center xl:text-left">
                            <p className="kr-target-text transition-all duration-300"
                                data-kr="<span class='font-semibold tracking-[-0.01em]'>이오타서울은 87만 평 규모의 서울 최대 녹지, 남산공원과 직접 연결되는 <span class='text-[#3B7062] font-semibold tracking-[-0.01em]'>유일한 트로피 복합자산입니다.</span><br/>서울의 심장부인 서울역권 중심에 위치하면서도, 도심 속에서 누릴 수 있는 가장 넓고 쾌적한 자연환경과의 연결성을 제공합니다.<br/><br/>이러한 자연 인프라는 웰니스 중심의 업무 환경을 지향하는 <span class='text-[#3B7062] font-semibold tracking-[-0.01em]'>글로벌 기업에게 탁월한 가치를</span> 제공하며, &quot;도심 속 그린 리트리트(Green Retreat)&quot;로서의 독보적 차별성을 만듭니다.</span>"
                                data-en="IOTA Seoul is the only trophy-grade mixed-use development directly connected to<br class='hidden md:block' />Namsan Park, <span class='text-[#3B7062] font-bold'>Seoul's largest urban green space</span> spanning 710 AC.<br/><br/>Located in the city's urban core near Seoul Station, it uniquely combines metropolitan<br class='hidden md:block' />accessibility with immersive natural surroundings rarely found in major capital cities.<br/><br/>This proximity to nature offers <span class='text-[#3B7062] font-bold'>exceptional value to global companies</span> seeking<br class='hidden md:block' />wellness-focused, productivity-enhancing work environments, positioning IOTA as a<br class='hidden md:block' />true &quot;Green Retreat in the City&quot; with unmatched differentiation.">
                                IOTA Seoul is the only trophy-grade mixed-use development directly connected to<br className="hidden md:block" />
                                Namsan Park, <span className="text-[#3B7062] font-bold">Seoul's largest urban green space</span> spanning 710 AC.<br /><br />
                                Located in the city's urban core near Seoul Station, it uniquely combines metropolitan<br className="hidden md:block" />
                                accessibility with immersive natural surroundings rarely found in major capital cities.<br /><br />
                                This proximity to nature offers <span className="text-[#3B7062] font-bold">exceptional value to global companies</span> seeking<br className="hidden md:block" />
                                wellness-focused, productivity-enhancing work environments, positioning IOTA as a<br className="hidden md:block" />
                                true "Green Retreat in the City" with unmatched differentiation.
                            </p>
                        </div>

                        {/* RIGHT COLUMN: Statistics */}
                        <div className="w-full xl:w-auto mt-16 xl:mt-0 flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0 text-gray-800 font-inter self-center xl:self-center xl:ml-auto">

                            {/* Stat 1 */}
                            <div className="flex flex-col items-center text-center px-4 md:px-12 bs-bounce-up delay-200">
                                <div className="flex items-baseline mb-2">
                                    <span className="text-[55px] md:text-[65px] lg:text-[75px] leading-none font-bold tracking-[-0.03em]" data-en="710" data-kr="87만">710</span>
                                    <span className="text-[22px] md:text-[26px] lg:text-[30px] leading-none ml-2 tracking-[-0.02em]" data-en="AC" data-kr="평">AC</span>
                                </div>
                                <span className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-gray-800 tracking-[-0.01em]">Namsan Park</span>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-[1px] h-[60px] bg-gray-300"></div>

                            {/* Stat 2 */}
                            <div className="flex flex-col items-center text-center px-4 md:px-12 mt-8 md:mt-0 bs-bounce-up delay-400">
                                <div className="flex items-baseline mb-2">
                                    <span className="text-[55px] md:text-[65px] lg:text-[75px] leading-none font-bold tracking-[-0.03em]" data-en="111,375" data-kr="3,130">111,375</span>
                                    <span className="text-[22px] md:text-[26px] lg:text-[30px] leading-none ml-2 tracking-[-0.02em]" data-en="SF" data-kr="평">SF</span>
                                </div>
                                <span className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-gray-800 tracking-[-0.01em]">Green Area of IOTA Seoul</span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* IMAGES CONTAINER with crossfade (Desktop Only) */}
                <div id="green-scroll-area" className="hidden md:block w-full relative bs-fade-up delay-200 mt-4 h-auto min-h-[500px]">
                    <img  src="./img/namsan_map1.webp" width="2500" height="1194" alt="Namsan Map 1" id="green-img-1"
                        className="w-full h-auto object-contain transition-opacity duration-1000 ease-in-out" />
                    <HoverImage  src="./img/namsan_map2.webp" width="2500" height="1194" alt="Namsan Map 2" id="green-img-2"
                        className="w-full h-full object-contain block" wrapperClassName="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity duration-1000 ease-in-out group cursor-pointer" />
                </div>

            </div>

            {/* Mobile Panning Image - OUTSIDE padding wrapper to be full width */}
            <div className="md:hidden w-full relative overflow-x-auto overflow-y-hidden scrollbar-hide mt-4 bs-fade-up delay-200">
                <div className="relative w-[1400px]">
                    <HoverImage  src="./img/namsan_map2.webp" width="2500" height="1194" alt="Namsan Map Mobile" className="w-full h-auto object-cover animate-pan-x-slow block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                </div>
            </div>

        </section>
    );
}
