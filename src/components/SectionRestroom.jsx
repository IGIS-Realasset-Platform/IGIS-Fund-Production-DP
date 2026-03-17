import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HoverImage from './HoverImage';

export default function SectionRestroom() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-white pt-[60px] pb-[100px]" id="section-restroom">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pt-12 bs-fade-up">

                {/* TITLES AREA */}
                <div className="w-full max-w-[1100px] mx-auto flex flex-col items-start bs-fade-up delay-100 mb-10">
                    {lang === 'kr' ? (
                        <div className="w-full flex flex-col items-start text-left">
                            <h2 className="text-[26px] md:text-[36px] lg:text-[42px] font-bold text-[#6B3F3A] tracking-[-0.03em] mb-2 break-keep">
                                프라이버시를 보장하는 화장실
                            </h2>
                            <h3 className="text-[18px] md:text-[22px] lg:text-[26px] font-bold text-[#333] tracking-[-0.01em] font-inter">
                                Privacy-Focused Restroom Design
                            </h3>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-start text-left">
                            <h2 className="text-[28px] md:text-[38px] lg:text-[46px] font-bold text-[#6B3F3A] tracking-[-0.03em] font-inter break-keep">
                                Privacy-Focused Restroom Design
                            </h2>
                        </div>
                    )}
                </div>

                {/* IMAGE 1 */}
                <div className="w-full max-w-[1400px] mx-auto flex items-center justify-center mb-16 bs-fade-up delay-200">
                    <HoverImage  src="./img/toilet1.webp" width="3000" height="1630" alt="Privacy-Focused Restroom" className="w-full h-auto object-contain shadow-sm" />
                </div>

                {/* DESCRIPTION TEXT AREA */}
                <div className="w-full max-w-[1100px] mx-auto flex flex-col bs-fade-up delay-300 mb-12">
                    {lang === 'kr' ? (
                        <div className="text-[17px] md:text-[19px]  font-semibold text-[#7b7b7d] font-inter leading-[1.57] tracking-[-0.01em] break-keep text-left">
                            <p className="mb-4">
                                IOTA One 화장실은 <strong className="font-extrabold text-[#6B3F3A]">프라이버시</strong>와 위생을 극대화하기 위해 <strong className="font-extrabold text-[#6B3F3A]">공간 분리</strong>와 공기 흐름을 정교하게 설계했습니다. 소변기와 대변기 칸막이가 교차 배치되어 사적인 공간을 확보하며, 하부에서 <strong className="font-extrabold text-[#6B3F3A]">신선한 공기</strong>를 끌어올려 상부로 배출하는 일방향 환기 시스템을 적용해 항상 깨끗하고 쾌적한 환경을 유지합니다.
                            </p>
                            <p>
                                또한 별도의 <strong className="font-extrabold text-[#6B3F3A]">Grooming Room(치카룸)</strong>을 두어 개인 위생과 사용 편의를 강화했습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.02em] font-inter text-left">
                            <p className="mb-4">
                                The restroom is designed to ensure <span className="font-bold">privacy</span> and hygiene through spatial <span className="font-bold">separation</span> and optimized ventilation. Alternating partitions separate urinals and toilet cubicles, while a one-way air circulation system introduces <span className="font-bold">fresh air</span> from below and exhausts it upward, maintaining a clean and pleasant environment.
                            </p>
                            <p>
                                An independent <span className="font-bold">Grooming Room</span> is also provided for personal hygiene and comfort.
                            </p>
                        </div>
                    )}
                </div>

                {/* IMAGE 2 & GROOMING ROOM CAPTION */}
                <div className="w-full max-w-[600px] mx-auto flex flex-col items-center justify-center bs-fade-up delay-400">
                    <HoverImage  src="./img/toilet2.webp" width="2065" height="1108" alt="Grooming Room" className="w-full h-auto object-contain mb-3" />
                    <span className="text-[13px] md:text-[15px] text-gray-500 font-medium tracking-tight">
                        {lang === 'kr' ? "Grooming Room (별도 치카룸)" : "Grooming Room"}
                    </span>
                </div>

            </div>
        </section>
    );
}
