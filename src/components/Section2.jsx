import React from 'react';
import HoverImage from './HoverImage';

export default function Section2() {
    return (
        <section className="section content-section h-auto mb-0 md:mb-[200px] pt-[30px] md:pt-[60px]" id="section2" style={{ minHeight: 'auto', paddingBottom: '0' }}>
            {/* Header Spacer */}
            <div className="h-[50px] md:h-[100px] w-full invisible"></div>
            <div className="w-full max-w-[1600px] mx-auto">
                <div className="w-full px-6 md:px-0 flex flex-col md:flex-row items-center mb-12">
                    {/* Left: Title and Description */}
                    <div className="w-full md:w-[60%] flex flex-col items-start justify-start">
                        <h1 className="text-[31px] md:text-[55px] lg:text-[67px] font-bold leading-tight text-black tracking-[-0.02em] font-inter bs-fade-up delay-100"
                            data-en="New Heart of Seoul" data-kr="New Heart of Seoul">New Heart of Seoul</h1>
                        <div id="desc-text"
                            className="font-inter w-full mt-6 md:mt-8 text-[17px] md:text-[19px] tracking-[-0.02em] font-light text-black leading-[1.57] space-y-6 bs-fade-up delay-200">
                            <p className="kr-target-text transition-all duration-300"
                                data-en="<strong class='font-bold text-black'>IOTA Seoul</strong> is the <strong class='font-bold text-black'>next-generation landmark</strong> redefining the heart of Korea’s capital. Perfectly positioned between the iconic Namsan and Seoul Station, this architectural masterpiece seamlessly bridges Seoul’s rich heritage with its <strong class='font-bold text-black'>dynamic future.</strong>"
                                data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><strong class='font-semibold tracking-[-0.01em] text-black'>이오타 서울</strong>은 최첨단 오피스와 최고급 호텔, 프리미엄 주거가 결합된 연면적 14만 평 규모의 <strong class='font-semibold tracking-[-0.01em] text-black'>대규모 복합개발 프로젝트</strong>입니다. 남산의 광활한 녹지와 광역 교통의 허브인 서울역과 인접한 입지에 자리하며, 지속가능한 설계를 기반으로 문화, 미식, 리테일, 엔터테인먼트가 유기적으로 어우러진 복합 환경을 구현합니다. 이를 통해 글로벌 기업과 인재들에게 <strong class='font-semibold tracking-[-0.01em] text-black'>비즈니스와 라이프스타일이 자연스럽게 연결되는 최적의 업무 생활 플랫폼</strong>을 제공합니다.</span>">
                                <strong className='font-bold text-black'>IOTA Seoul</strong> is the <strong className='font-bold text-black'>next-generation landmark</strong> redefining the heart of Korea’s capital.
                            </p>
                            <p className="kr-target-text transition-all duration-300"
                                data-en="Spanning an impressive <strong class='font-bold text-black'>4,948,871 square feet</strong>, IOTA Seoul sets a new benchmark for <strong class='font-bold text-black'>cutting-edge business</strong> districts. Designed with state-of-the-art technology and sustainability at its core, it offers premium office spaces, Seoul’s largest integrated green space connected to Namsan, wellness-driven retail, and <strong class='font-bold text-black'>world-class cultural destinations</strong>."
                                data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>서울의 역사적 맥락과 미래 비전을 동시에 담아내는 <strong class='font-semibold tracking-[-0.01em] text-black'>상징적 랜드마크</strong>로서, IOTA 서울은 연중 다양한 프로그램과 공간 경험을 통해 방문객과 입주사, 지역사회에 새로운 활력을 제시할 것입니다. 궁극적으로 <strong class='font-semibold tracking-[-0.01em] text-black'>글로벌 오피스의 새로운 기준</strong>을 제시하는 복합 자산으로 자리매김할 것입니다.</span>">
                                Spanning an impressive <strong className='font-bold text-black'>4,948,871 square feet</strong>, IOTA Seoul sets a new benchmark.
                            </p>
                            <p className="en-only-text transition-all duration-300"
                                data-en="More than just a development, IOTA Seoul is an <strong class='font-bold text-black'>evolution of urban living</strong>—a place where business, culture, and nature converge to inspire daily life."
                                data-kr="">
                                More than just a development, IOTA Seoul is an <strong className='font-bold text-black'>evolution of urban living</strong>—a place where
                                business,
                                culture, and nature converge to inspire daily life.
                            </p>
                        </div>
                    </div>
                    {/* Right: Stats */}
                    <div
                        className="w-full md:w-[40%] flex flex-col justify-center items-center mt-12 md:mt-0 ml-auto font-inter bs-fade-up delay-300">
                        <div
                            className="text-[50px] md:text-[65px] lg:text-[85px] xl:text-[105px] font-bold leading-none tracking-[-0.05em] flex items-baseline">
                            459,765
                            <span
                                className="text-[24px] md:text-[32px] lg:text-[40px] tracking-tight ml-2 relative -top-[0.2em] font-normal">m²</span>
                        </div>
                        <div className="text-[16px] md:text-[20px] lg:text-[26px] font-medium tracking-[-0.02em] mt-2">
                            Gross Floor Area
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-[10px] md:gap-[30px] mb-[10px] md:mb-0">
                    <div className="full-image-container w-full h-auto">
                        <HoverImage  src="./img/iota_full.webp" width="2000" height="1125" alt="IOTA Full Background"
                            className="bs-scale-up w-full h-auto object-contain block origin-center" wrapperClassName="w-full relative overflow-hidden group cursor-pointer h-full" style={{ marginTop: '-30px' }} />
                    </div>
                    <div className="full-image-container w-full h-auto">
                        <HoverImage  src="./img/iota_full_3.webp" width="2500" height="1063" alt="IOTA Full Background 3"
                            className="bs-scale-up w-full h-full object-cover block origin-center" wrapperClassName="w-full relative overflow-hidden group cursor-pointer h-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
