import React from 'react';

export default function SectionLargePlate() {
    return (
        <section className="section w-full h-auto bg-white pt-[100px] md:pt-[150px] pb-[100px] text-[#111]" id="section-largeplate">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center">

                {/* LARGE PLATE IMAGE */}
                <div className="w-full max-w-[1400px] mx-auto mb-16 md:mb-20 bs-fade-up">
                    <img  src="./img/largeplate.webp" width="2000" height="906" alt="IOTA Seoul Large Plate" className="w-full h-auto object-cover" />
                </div>

                {/* TEXT CONTENT */}
                <div className="w-full max-w-[1200px] flex flex-col items-center">

                    <div className="text-center flex flex-col items-center mb-10 md:mb-14">
                        <span className="text-[14px] md:text-[16px] font-bold tracking-[0.05em] text-[#333] uppercase mb-4 font-inter bs-fade-up delay-200"
                            data-en="LARGE PLATE"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>LARGE PLATE</span>">
                            LARGE PLATE
                        </span>

                        <h3 className="text-[28px] md:text-[40px] lg:text-[60px] font-bold text-[#1A2A3A] leading-tight tracking-tight mb-[6px] kr-target-text break-keep bs-fade-up delay-300"
                            style={{ fontWeight: 'bold' }}
                            data-en="The Most Spacious Floor Area in CBD"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#0f294a]'>The Most Spacious Floor Area in CBD<br/><span class='text-[22px] md:text-[32px] lg:text-[40px] mt-6 md:mt-8 block tracking-[-0.03em]' style='font-weight: bold;'><span class='text-black font-bold'>서울 주요 업무 권역에서 가장 넓은 오피스 바닥에서 협업과 혁신 촉진</span></span></span>">
                            The Most Spacious Floor Area in CBD
                        </h3>

                        <h4 className="text-[17px] md:text-[20px] lg:text-[24px] font-bold text-[#111] tracking-tight leading-snug kr-target-text break-keep font-inter bs-fade-up delay-400"
                            data-en="Empowering Teamwork and Creativity on the City's Most Expansive Office Floors"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>Empowering Teamwork and Creativity on the City's Most Expansive Office Floors</span>">
                            Empowering Teamwork and Creativity on the City's Most Expansive Office Floors
                        </h4>
                    </div>

                    <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] w-full max-w-[1000px] text-center bs-fade-up delay-500">
                        <p className="kr-target-text transition-all duration-300 break-keep"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>IOTA One은 <strong class='font-bold text-black'>1,149평 규모</strong>의 압도적인 오피스 바닥면적을 확보하여,<br class='hidden md:block' />서울 주요 프라임 빌딩들과 비교해도 독보적인 스케일을 자랑합니다.<br/><br/>IOTA One과 Two에서 모두 제공되는 기둥 없는 <strong class='font-bold text-black'>18m 리스 스팬 구조</strong>는 공간 활용의 유연성과 효율성을 극대화하여,<br class='hidden md:block' />팀 간 협업과 창의적 업무 환경을 촉진하는 최적의 레이아웃을 제공합니다.</span>"
                            data-en="IOTA One features an <span class='font-bold'>impressive floorplate of 3,798 m²</span>,<br class='hidden md:block'/>setting a new benchmark in scale even among Seoul's prime office towers.<br/><br/>Both IOTA One and IOTA Two are designed with a <span class='font-bold'>column-free 18-meter lease span</span>,<br class='hidden md:block'/>maximizing spatial flexibility and efficiency to foster collaboration and creativity within the workplace.">
                            IOTA One features an <span className="font-bold">impressive floorplate of 3,798 m²</span>,<br className="hidden md:block" />
                            setting a new benchmark in scale even among Seoul's prime office towers.<br /><br />
                            Both IOTA One and IOTA Two are designed with a <span className="font-bold">column-free 18-meter lease span</span>,<br className="hidden md:block" />
                            maximizing spatial flexibility and efficiency to foster collaboration and creativity within the workplace.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}
