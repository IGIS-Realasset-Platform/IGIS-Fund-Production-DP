import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HoverImage from './HoverImage';

export default function SectionHVAC() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-white pt-[60px] pb-[100px] scroll-mt-[100px]" id="section-hvac">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pt-12 bs-fade-up">

                {/* TITLES AREA */}
                <div className="w-full max-w-[1400px] mx-auto flex flex-col items-start bs-fade-up delay-100 mb-10">
                    {lang === 'kr' ? (
                        <div className="w-full flex flex-col items-start text-left">
                            <h2 className="text-[26px] md:text-[36px] lg:text-[42px] font-bold text-[#4B7053] tracking-[-0.03em] mb-2 break-keep">
                                입주사 맞춤형 공조 인프라 제공
                            </h2>
                            <h3 className="text-[18px] md:text-[22px] lg:text-[24px] font-bold text-[#333] tracking-[-0.01em] font-inter">
                                AI-Driven Building HVAC +<br />Dedicated Zone Control Capabilities
                            </h3>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-start text-left">
                            <h2 className="text-[28px] md:text-[36px] lg:text-[42px] font-bold text-[#4B7053] tracking-[-0.03em] font-inter break-keep">
                                AI-Driven Building HVAC +<br />Dedicated Zone Control Capabilities
                            </h2>
                        </div>
                    )}
                </div>

                {/* IMAGE */}
                <div className="w-full max-w-[1400px] mx-auto flex items-center justify-center mb-16 bs-fade-up delay-200">
                    <HoverImage  src="./img/HVAC01.webp" width="3000" height="1559" alt="HVAC Infrastructure" className="w-full h-auto object-contain block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                </div>

                {/* DESCRIPTION TEXT AREA */}
                <div className="w-full max-w-[1400px] mx-auto flex flex-col items-end bs-fade-up delay-300">
                    {lang === 'kr' ? (
                        <div className="w-full max-w-[700px] text-[17px] md:text-[19px]  font-semibold text-[#7b7b7d] font-inter leading-[1.57] tracking-[-0.01em] break-keep text-left">
                            <p className="mb-4">
                                이오타 서울은 AI 기반 중앙 공조 시스템을 통해 실내 환경을 자동으로 최적화합니다.<br className="hidden lg:block" />
                                하지만, 입주사의 특수 수요를 반영하여 <span className="font-bold underline underline-offset-4 decoration-stone-300 transform decoration-2 block md:inline"><span class='text-black font-extrabold'>전용면적의 약 30%까지 별도 실외기 설치가 가능한 공간을 제공</span></span>함으로써, 임원 공간, 프라이빗 오피스, 서버룸 및 연구 공간 등<br className="hidden lg:block" />
                                개별 온도·환경 제어가 필요한 구역에도 완벽히 대응합니다. AI가 전체 환경을 관리하면서도, 입주사는 필요한 곳에 <span class='text-black font-extrabold'>독립적 컨트롤</span>을 더할 수 있는 오피스입니다.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-[700px] text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.02em] font-inter text-left">
                            <p className="mb-4">
                                IOTA Seoul's AI-driven central HVAC system automatically optimizes indoor comfort and energy efficiency.<br className="hidden lg:block" />
                                To support specialized tenant requirements, the building reserves <span className="font-bold underline underline-offset-4 decoration-stone-300 transform decoration-2 inline">outdoor unit allocation capacity equivalent to approximately 30% of each tenant's floor area</span>,<br className="hidden lg:block" />
                                allowing dedicated air-conditioning systems to be installed where needed— such as executive suites, private offices, server rooms, and specialized R&D zones.<br className="hidden lg:block" />
                                A building where AI manages the environment holistically, while tenants retain independent control where it matters most.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
