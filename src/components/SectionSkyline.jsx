import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SectionSkyline() {
    const scrollRef = useRef(null);
    const { lang } = useLanguage();

    // Option 2 Revised: Static simple white circles with dry text
    const pins = [
        { id: 'seoul-station', title: 'Seoul Station', left: '16.5%', top: '22%' },
        { id: 'iota-two', title: 'IOTA Two', left: '60.5%', top: '20%' },
        { id: 'iota-one', title: 'IOTA One', left: '78.5%', top: '8%' }
    ];

    return (
        <section className="section content-section w-full h-auto bg-white text-black py-[100px] md:py-[150px]" id="section-skyline">

            {/* Text Description Box */}
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-0 flex flex-col items-center text-center mb-12 bs-fade-up">

                {/* Title styled identical to other pages without kr-target-text which removes boldness */}
                <h2 className="text-[35px] md:text-[50px] lg:text-[60px] font-extrabold leading-tight tracking-[-0.03em] font-inter mb-8 text-black"
                    data-en="2032 Projected Skyline"
                    data-kr="2032 Projected Skyline">
                    2032 Projected Skyline
                </h2>

                <div className="text-[21px] md:text-[23px] font-light text-[#8d8d94] leading-[1.57] tracking-[-0.02em] space-y-6 w-full mt-8 mb-[20px] max-w-[1200px]">
                    <p className="transition-all duration-300"
                        data-kr="2032년, 서울역을 중심으로 형성되는 새로운 도심 스카이라인은<br/><span class='text-black font-semibold tracking-[-0.01em]'>'IOTA ONE'과 'IOTA TWO'를 핵심 축으로 새로운 비즈니스 클러스터로 완성됩니다.</span><br/><br/>IOTA 서울은 서울역을 기점으로 CBD, YBD, GBD를 연결하는 3대 업무 축의 중심에 위치하며,<br/><span class='text-black font-semibold tracking-[-0.01em]'>서울 도심의 새로운 스카이라인과 경제 흐름을 선도하는 핵심 앵커 자산으로 자리 잡을 것입니다.</span>"
                        data-en="By 2032, the Seoul Station district will redefine the city's skyline<br/><span class='text-black font-bold'>anchored by IOTA One and IOTA Two, forming the core of a next-generation business cluster.</span><br/><br/>Situated at the intersection of Seoul's three major business axes<br/><span class='text-black font-bold'>CBD, YBD, and GBD — IOTA Seoul stands at the heart of the capital's new economic network.</span><br/><br/>At the meeting point of heritage, innovation, and global enterprise,<br/><span class='text-black font-bold'>IOTA Seoul emerges as the new center of gravity for Seoul's future business landscape.</span>">
                        2032년, 서울역을 중심으로 형성되는 새로운 도심 스카이라인은<br /><span className="text-black font-bold">'IOTA ONE'과 'IOTA TWO'를 핵심 축으로 새로운 비즈니스 클러스터로 완성됩니다.</span><br /><br />
                        IOTA 서울은 서울역을 기점으로 CBD, YBD, GBD를 연결하는 3대 업무 축의 중심에 위치하며,<br /><span className="text-black font-bold">서울 도심의 새로운 스카이라인과 경제 흐름을 선도하는 핵심 앵커 자산으로 자리 잡을 것입니다.</span>
                    </p>
                </div>
            </div>

            {/* Mobile Swipe Container (Native scroll only to avoid disappearance bug) */}
            <div
                ref={scrollRef}
                className="w-full relative overflow-x-auto overflow-y-hidden scrollbar-hide bs-fade-up delay-200"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div className="relative w-[1500px] lg:w-full mx-auto">
                    <img
                        src="./img/2032_seoulstation.jpg" width="1700" height="956"
                        alt="2032 Seoul Station Skyline Projected View"
                        className="w-full h-auto object-contain block"
                        draggable="false"
                    />

                    {/* Static, dry white circles with text */}
                    {pins.map((pin) => (
                        <div
                            key={pin.id}
                            className="absolute flex items-center space-x-2 transform -translate-y-1/2 z-10"
                            style={{ left: pin.left, top: pin.top }}
                        >
                            {/* Simple white circle */}
                            <div className="w-3 h-3 md:w-4 md:h-4 bg-white border border-gray-300 rounded-full shadow-sm"></div>
                            {/* Dry content exposure */}
                            <div className="bg-black/80 px-2 py-1 text-white text-[12px] md:text-[14px] font-bold tracking-tight rounded-sm whitespace-nowrap">
                                {pin.title}
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* Image Source / Description */}
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-0 text-right mt-3 text-[11px] md:text-[13px] text-gray-500 font-light tracking-tight font-inter bs-fade-up">
                {lang === 'kr' ? "*2032년 서울역 인근 예상 조감도" : "*Projected aerial view near Seoul Station in 2032"}
            </div>

            {/* Mobile/Tablet Tip */}
            <div className="w-full text-center mt-6 text-[13px] text-gray-500 lg:hidden px-6 animate-pulse select-none font-inter tracking-tight">
                ← Swipe to explore the skyline →
            </div>

        </section>
    );
}
