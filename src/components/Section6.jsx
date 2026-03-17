import React from 'react';

export default function Section6() {
    return (
        <section
            className="section content-section w-full h-auto bg-black text-white relative flex flex-col pt-[100px] md:pt-[200px] pb-[20px] md:pb-[150px]"
            id="section6">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col-reverse">

                {/* BACKGROUND MAP (Image at bottom) */}
                <div className="w-full flex flex-col gap-[30px]">
                    <div className="full-image-container relative overflow-hidden group">
                        <img  src="./img/gtx.webp" width="2500" height="1645" alt="GTX Map"
                            className="bs-scale-up w-full h-auto block transform origin-center transition-transform duration-[2s] group-hover:scale-105"
                            style={{ marginTop: '-30px' }} />
                    </div>
                </div>

                {/* TEXT PANELS (Text below image) */}
                <div className="w-full h-auto flex flex-col items-center justify-center text-center px-6 md:px-0 pt-16 md:pt-24 pb-[20px] md:pb-[86px]">

                    <div className="bs-fade-up delay-100">
                        <div className="font-bold text-[16px] md:text-[20px] text-gray-400 mb-2 font-inter tracking-tight">
                            GTX-A & GTX-B
                        </div>
                    </div>

                    <div className="bs-fade-up delay-200">
                        <h2
                            className="text-[35px] md:text-[50px] lg:text-[60px] font-extrabold leading-tight mb-8 text-white tracking-[-0.03em] font-inter">
                            Seoul's Business Core Hub
                        </h2>
                    </div>

                    <div className="mb-6 bs-fade-up delay-300">
                        <h3 className="text-[18px] md:text-[22px] font-bold text-white tracking-[-0.02em] leading-snug transition-all duration-300"
                            data-kr="수도권과 서울 3대 업무권역을 하나로 잇는 초광역 비즈니스 허브"
                            data-en="The Ultimate Metropolitan Hub: Seamlessly Integrating Greater Seoul with the Three Business Cores">
                            수도권과 서울 3대 업무권역을 하나로 잇는 초광역 비즈니스 허브
                        </h3>
                    </div>

                    <div
                        className="text-[17px] md:text-[19px] font-medium text-gray-300 leading-[1.57] tracking-[-0.02em] space-y-4 bs-fade-up delay-400 break-keep mb-[30px] md:mb-0">
                        <p className="kr-target-text transition-all duration-300"
                            data-kr="GTX-A(서울역-삼성, 2028년 개통 예정)는 <span class='font-semibold tracking-[-0.01em] text-white'>강남권까지 약 10분 내 접근</span>을, GTX-B(2031년 개통 예정)는 <span class='font-semibold tracking-[-0.01em] text-white'>여의도까지 약 10분 내 이동</span>을 가능하게 합니다.<br />서울역은 GTX-A와 B 노선이 교차하는 <span class='font-semibold tracking-[-0.01em] text-[#5FD0A8]'>유일한 지점</span>이자 CBD 내 <span class='font-semibold tracking-[-0.01em] text-[#5FD0A8]'>유일한 GTX 역</span>입니다. 이를 통해 수도권 외곽의 주요 거점과 서울의 핵심 업무지구를 하나의 생활권으로 묶어 비즈니스 시너지를 극대화합니다."
                            data-en="GTX-A (Seoul-Samseong, opening 2028) will link the CBD and <span class='font-bold text-white'>Gangnam within ten minutes</span>, while GTX-B (opening 2031) will connect <span class='font-bold text-white'>Seoul Station and Yeouido in under ten minutes</span>.<br />As <span class='font-bold text-[#5FD0A8]'>the only intersection of GTX-A and GTX-B lines</span> and the sole GTX station within the CBD, Seoul Station seamlessly integrates major metropolitan hubs with Seoul's core business districts, creating a unified economic zone.">
                            GTX-A(서울역-삼성, 2028년 개통 예정)는 <span className='font-bold text-white'>강남권까지 약 10분 내 접근</span>을,
                            GTX-B(2031년 개통 예정)는 <span className='font-bold text-white'>여의도까지 약 10분 내 이동</span>을 가능하게
                            합니다.<br />
                            서울역은 GTX-A와 B 노선이 교차하는 <span className='font-bold text-[#5FD0A8]'>유일한 지점</span>이자 CBD 내 <span
                                className='font-bold text-[#5FD0A8]'>유일한 GTX 역</span>입니다. 이를 통해 수도권 외곽의 주요 거점과 서울의 핵심 업무지구를
                            하나의
                            생활권으로 묶어 비즈니스 시너지를 극대화합니다.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}
