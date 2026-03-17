import React from 'react';
import HoverImage from './HoverImage';

export default function SectionScale() {
    return (
        <section className="section w-full h-auto bg-black text-white pt-[100px] md:pt-[150px] pb-[100px] overflow-hidden" id="section-scale">

            <style>
                {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        display: inline-block;
                        white-space: nowrap;
                        animation: marquee 30s linear infinite;
                    }
                `}
            </style>

            {/* MARQUEE TEXT */}
            <div className="w-full relative mb-12 md:mb-20 bs-fade-up">
                <div className="flex w-fit animate-marquee">
                    <h2 className="text-[120px] md:text-[200px] lg:text-[250px] font-black text-white tracking-[-0.03em]er leading-none whitespace-nowrap">
                        Unmatched Scale Unmatched Scale Unmatched Scale Unmatched Scale Unmatched Scale&nbsp;
                    </h2>
                </div>
            </div>

            {/* LARGE SCALE IMAGE (FULL WIDTH ON MOBILE) */}
            <div className="w-full md:w-[calc(100%-100px)] max-w-[1000px] mx-auto mb-16 bs-fade-up delay-100">
                <HoverImage  src="./img/scale.webp" width="2000" height="2740" alt="IOTA Seoul Scale" className="w-full h-auto object-cover rounded-none block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
            </div>

            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center">

                {/* TEXT CONTENT */}
                <div className="w-full max-w-[1200px] flex flex-col items-center text-center bs-fade-up delay-200">

                    <h3 className="text-[32px] md:text-[45px] lg:text-[55px] font-extrabold text-white tracking-tight font-inter leading-tight mt-[30px]"
                        data-en="Iconic Trophy Asset in Seoul"
                        data-kr="도심 핵심지에서의<br class='md:hidden' /> 초대형 복합 사업">
                        Iconic Trophy Asset in Seoul
                    </h3>

                    <h4 className="text-[18px] md:text-[22px] lg:text-[26px] font-medium text-gray-300 my-5 md:my-7 tracking-tight leading-snug kr-target-text"
                        data-en="A flagship trophy mixed-use asset in the heart of Seoul"
                        data-kr="A flagship trophy mixed-use asset in the heart of Seoul">
                        A flagship trophy mixed-use asset in the heart of Seoul
                    </h4>

                    <div className="text-[15px] md:text-[17px] lg:text-[19px] font-medium text-gray-300 leading-[1.57] md:leading-[1.57] tracking-[-0.01em] max-w-[900px] mb-[30px]">
                        <p className="kr-target-text transition-all duration-300 break-keep"
                            data-kr="이오타 서울은 초대형 남산 녹지를 앞마당에 둔 대형 오피스 2개동과 6성급 호텔 1개동 (리츠칼튼 예정), 다양한 웰니스 리테일 시설이 결합된 초대형 복합시설로 서울을 대표하는 트로피 에셋을 지향합니다."
                            data-en="IOTA Seoul is a massive mixed-use development, made up of 2 state-of-the-art, custom-designed office spaces and 1 ultra-luxury hotel (The Ritz-Carlton).">
                            IOTA Seoul is a massive mixed-use development, made up of 2 state-of-the-art, custom-designed office spaces and 1 ultra-luxury hotel (The Ritz-Carlton).
                        </p>
                    </div>

                    {/* STATS TEXT BLOCK MOVED DOWN */}
                    <div className="w-full flex items-center justify-center mt-12 md:mt-16 font-inter text-white px-2">
                        <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 md:gap-16 lg:gap-24">

                            <div className="flex flex-col items-center bs-bounce-up delay-300">
                                <div className="flex items-baseline">
                                    <span className="text-[32px] sm:text-[40px] md:text-[70px] lg:text-[90px] leading-none tracking-tight font-bold">459,765</span>
                                    <span className="text-[16px] sm:text-[18px] md:text-[28px] lg:text-[36px] ml-1 font-bold">m²</span>
                                </div>
                                <div className="text-[13px] sm:text-[15px] md:text-[20px] lg:text-[24px] font-bold tracking-tight mt-1 md:mt-3 text-gray-400 text-center"
                                    data-en="Gross Floor Area"
                                    data-kr="Gross Floor Area">
                                    Gross Floor Area
                                </div>
                            </div>

                            <div className="w-px h-16 md:h-24 lg:h-32 bg-gray-600 bs-fade-up delay-400"></div>

                            <div className="flex flex-col items-center bs-bounce-up delay-500">
                                <div className="flex items-baseline">
                                    <span className="text-[32px] sm:text-[40px] md:text-[70px] lg:text-[90px] leading-none tracking-tight font-bold">27,537</span>
                                    <span className="text-[16px] sm:text-[18px] md:text-[28px] lg:text-[36px] ml-1 font-bold">m²</span>
                                </div>
                                <div className="text-[13px] sm:text-[15px] md:text-[20px] lg:text-[24px] font-bold tracking-tight mt-1 md:mt-3 text-gray-400 text-center"
                                    data-en="Site Area"
                                    data-kr="Site Area">
                                    Site Area
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* CBD ASSETS IMAGE */}
                <div className="w-full mt-24 md:mt-32 max-w-[1000px] mx-auto flex flex-col bs-fade-up delay-300 pb-12">

                    <div className="w-full flex justify-between items-end mb-4 px-2 space-x-2">
                        <div className="flex flex-col text-left">
                            <h4 className="font-bold text-white text-[17px] md:text-[20px] tracking-tight break-keep"
                                data-kr="2025년 5월 현재 CBD 최대규모 자산 &amp; 2032년까지 개발예정 자산 규모 비교"
                                data-en="Largest Asset in CBD as of May 2025 &amp; Comparison with Future Pipelines through 2032"
                            >
                                Largest Asset in CBD as of May 2025 &amp; Comparison with Future Pipelines through 2032
                            </h4>
                            <p className="text-[12px] md:text-[14px] text-gray-300 mt-1 kr-target-text leading-[1.57] md:leading-[1.57]"
                                data-en="Scheduled for Completion in H1 2032<br/>As of May 2025, IOTA Seoul is the largest asset under development in the CBD, both in current and projected scale through 2032."
                                data-kr="Scheduled for Completion in H1 2032<br/>As of May 2025, IOTA Seoul is the largest asset under development in the CBD, both in current and projected scale through 2032.">
                                Scheduled for Completion in H1 2032<br className="hidden sm:block" />
                                As of May 2025, IOTA Seoul is the largest asset under development in the CBD, both in current and projected scale through 2032.
                            </p>
                        </div>
                        <div className="text-[12px] md:text-[14px] text-gray-300 mb-1 whitespace-nowrap mt-auto">
                            (MSF)
                        </div>
                    </div>

                    <div className="w-full bg-white p-4 md:p-6 lg:p-8 rounded-none shadow-xl">
                        <img  src="./img/CBD_assets.webp" width="2080" height="674" alt="CBD Assets Comparison" className="w-full h-auto object-contain" />
                    </div>
                </div>

            </div>
        </section>
    );
}
