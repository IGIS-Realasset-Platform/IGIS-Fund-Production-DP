import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SectionDesign() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-black pt-[80px] md:pt-[120px] pb-[100px] md:pb-[150px]" id="section-design">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center pt-12 bs-fade-up">

                {/* TEXT AREA */}
                <div className="text-center mb-16 px-4">
                    <h2 className="text-[52px] md:text-[70px] lg:text-[80px] font-extrabold text-[#e2d5c3] tracking-[-0.03em] leading-tight font-inter mb-4 mt-[200px] md:mt-[300px]">
                        DESIGNED BY THE<br />WORLD'S FINEST EXPERT
                    </h2>

                    {lang === 'kr' && (
                        <p className="text-[15px] md:text-[18px] text-stone-300 font-medium tracking-tight break-keep">
                            세계 최고의 설계 철학과 시공 기술력
                        </p>
                    )}
                </div>

                {/* IMAGE AREA (Image removed, space preserved) */}
                <div className="w-full max-w-[600px] mx-auto flex items-center justify-center bs-fade-up delay-200 aspect-[1500/1011]">
                    {/* img tag removed as requested */}
                </div>

                {/* --- ARCHITECTS SHOWCASE NEW SECTION --- */}
                {/* 1. White Dividing Line */}
                <div className="w-full h-[1px] bg-white/20 mt-0 mb-[80px] md:mb-[120px]"></div>

                {/* 2. Title & Intro */}
                <div className="w-full max-w-[1600px] mx-auto flex flex-col items-start bs-fade-up">
                    <h3 className="text-[28px] md:text-[38px] lg:text-[46px] font-bold text-white tracking-[-0.01em] leading-tight mb-4 font-inter break-keep">
                        Where Architectural Legends Shape the Future of Seoul
                    </h3>

                    {lang === 'kr' ? (
                        <>
                            <h4 className="text-[17px] md:text-[20px] lg:text-[24px] font-medium text-[#c0a888] tracking-[-0.01em] mb-8 break-keep">
                                세계 최고 설계사 Foster + Partners와 SOM의 디자인
                            </h4>
                            <div className="text-[17px] md:text-[19px] font-semibold text-stone-300 leading-[1.57] tracking-[-0.01em] break-keep max-w-[1200px]">
                                <p className="mb-4">
                                    이오타 서울은 전 세계에서 가장 영향력 있는 두 설계사, Foster + Partners와 Skidmore, Owings & Merrill (SOM)이 각각의 타워를 맡아 설계한 전례 없는 트로피 프로젝트입니다.
                                </p>
                                <p>
                                    런던의 디자인 아이콘 포스터와 뉴욕 마천루의 대명사 SOM이 동일한 프로젝트 내에서 각각의 건축 미학과 철학을 구현한 사례는 극히 드뭅니다. 이것은 단순한 설계가 아닌, 서울의 미래를 정의할 건축적 유산을 세우는 일입니다.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h4 className="text-[17px] md:text-[20px] lg:text-[24px] font-medium text-[#c0a888] tracking-[-0.01em] mb-8 font-inter break-keep">
                                Design by the World's Leading Architects: Foster + Partners and SOM
                            </h4>
                            <div className="text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter max-w-[1200px]">
                                <p className="mb-4">
                                    IOTA Seoul is an unprecedented trophy project designed by two of the most influential architectural firms in the world—Foster + Partners and Skidmore, Owings & Merrill (SOM)—each responsible for one of the two towers.
                                </p>
                                <p className="mb-4">
                                    It is extremely rare for London’s design icon Foster and New York’s skyscraper specialist SOM to express their distinct architectural philosophies within a single development.
                                </p>
                                <p>
                                    This is more than just design—it is the creation of an architectural legacy that will define the future of Seoul.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Projects Rows Layout */}
                <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-12 md:gap-[100px] mt-[60px] md:mt-[100px] bs-fade-up delay-200">

                    {/* Foster + Partners Row */}
                    <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12 lg:gap-16">
                        {/* Left Image */}
                        <div className="w-full md:w-[60%] shrink-0 relative overflow-hidden group">
                            <img src="./img/Applepark.webp" width="2098" height="1116" alt="Apple Park by Foster + Partners" className="w-full h-auto object-cover transform transition-transform duration-[2s] group-hover:scale-105" />
                            <div className="absolute bottom-2 right-3 md:bottom-4 md:right-4 text-white/70 text-[10px] md:text-[12px] font-light tracking-wide pointer-events-none z-10 font-inter">
                                Apple Park - Cupertino 미국 (fosterandpartners.com)
                            </div>
                        </div>
                        {/* Right Content */}
                        <div className="w-full md:w-[40%] flex flex-col items-start md:pt-[2%]">
                            <div className="mb-6">
                                <img src="./img/foster-partners.webp" width="394" height="54" alt="Foster + Partners Logo" className="h-[25px] md:h-[35px] lg:h-[40px] object-contain object-left block" />
                            </div>
                            {lang === 'kr' ? (
                                <div className="text-[17px] md:text-[19px] font-semibold text-stone-300 leading-[1.57] tracking-[-0.01em] break-keep">
                                    <p className="mb-4">
                                        런던에 본사를 둔 세계적인 건축 설계사로, 혁신적인 디자인과 지속 가능한 건축물을 창조하는 것으로 잘 알려져 있습니다.
                                    </p>
                                    <p>
                                        Apple Park와 Bloomberg London HQ와 같은 프로젝트를 통해 건축설계의 탁월함을 입증했습니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter">
                                    <p className="mb-4">
                                        A world-renowned architectural firm based in London, known for creating innovative designs and sustainable buildings.
                                    </p>
                                    <p>
                                        Their excellence has been demonstrated through projects such as Apple Park and Bloomberg London HQ.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SOM Row */}
                    <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12 lg:gap-16">
                        {/* Left Image */}
                        <div className="w-full md:w-[60%] shrink-0 relative overflow-hidden group">
                            <img src="./img/Burjkhalifa.webp" width="2104" height="1110" alt="Burj Khalifa by SOM" className="w-full h-auto object-cover transform transition-transform duration-[2s] group-hover:scale-105" />
                            <div className="absolute bottom-2 right-3 md:bottom-4 md:right-4 text-white/70 text-[10px] md:text-[12px] font-light tracking-wide pointer-events-none z-10 font-inter">
                                Burj Khalifa - Dubai, United 아랍 에미레이트 (som.com)
                            </div>
                        </div>
                        {/* Right Content */}
                        <div className="w-full md:w-[40%] flex flex-col items-start md:pt-[2%]">
                            <div className="mb-6">
                                <img src="./img/som.webp" width="192" height="72" alt="SOM Logo" className="h-[30px] md:h-[45px] lg:h-[50px] object-contain object-left block" />
                            </div>
                            {lang === 'kr' ? (
                                <div className="text-[17px] md:text-[19px] font-semibold text-stone-300 leading-[1.57] tracking-[-0.01em] break-keep">
                                    <p className="mb-4">
                                        뉴욕과 시카고에 본사를 둔 글로벌 건축 설계사로, John Hancock Tower와 Burj Khalifa와 같은 세계적으로 유명한 랜드마크를 설계한 경험을 보유하고 있습니다.
                                    </p>
                                    <p>
                                        SOM은 고층 건물 설계와 혁신적인 구조 엔지니어링 분야에서 선도적인 위치를 차지하고 있습니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter">
                                    <p className="mb-4">
                                        A global architecture firm based in New York and Chicago, with experience in designing world-renowned landmarks such as the John Hancock Tower and Burj Khalifa.
                                    </p>
                                    <p>
                                        They are leaders in high-rise building design and innovative structural engineering.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
