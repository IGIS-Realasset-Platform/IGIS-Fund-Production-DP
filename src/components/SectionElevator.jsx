import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SectionElevator() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-white pt-[60px] pb-[100px]" id="section-elevator">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pt-12 bs-fade-up">

                {/* TOP IMAGE */}
                <div className="w-full max-w-[1400px] mx-auto flex items-center justify-center mb-16 bs-fade-up delay-100">
                    <img  src="./img/elevator01.webp" width="3000" height="2291" alt="IOTA Seoul Largest Elevator" className="w-full h-auto object-contain" />
                </div>

                {/* BOTTOM TWO-COLUMN LAYOUT: Image Left, Text Right */}
                <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-16 bs-fade-up delay-200">

                    {/* LEFT: Image 2 */}
                    <div className="w-full lg:w-[45%] flex items-center justify-center lg:justify-start shrink-0">
                        <img  src="./img/elevator02.webp" width="1554" height="2452" alt="Elevator Size Comparison" className="w-full max-w-[600px] h-auto object-contain" />
                    </div>

                    {/* RIGHT: Texts */}
                    <div className="w-full lg:w-[55%] flex flex-col">
                        {lang === 'kr' ? (
                            <div className="w-full flex flex-col items-start text-left">
                                <h2 className="text-[26px] md:text-[34px] lg:text-[40px] font-bold text-[#4a342a] tracking-[-0.03em] leading-tight mb-8 break-keep">
                                    차량·대형 장비 직입 가능한<br />국내 최대규모 엘리베이터
                                </h2>

                                <div className="text-[17px] md:text-[19px]  font-semibold text-[#7b7b7d] font-inter leading-[1.57] tracking-[-0.01em] break-keep">
                                    <p className="mb-4">
                                        IOTA Two는 국내 최고 사양의 <span className="font-bold  -offset-4 decoration-stone-300"><span class='text-black font-extrabold'>초대형 화물 엘리베이터</span></span>를 갖추고 있습니다.<br className="hidden lg:block" />
                                        지하층부터 최상층 이벤트 스페이스까지 대형 전시물을 직접 운반할 수 있어, 대형 세단 공개 행사, 초대형 설치물 전시, 기술 데모, 럭셔리 제품 쇼케이스 등 프리미엄 이벤트 <span className="font-bold  -offset-4 decoration-stone-300">운영이 가능합니다</span>.
                                    </p>
                                    <p className="mb-4">
                                        해당 엘리베이터는 최대 <span className="font-bold  -offset-4 decoration-stone-300"><span class='text-black font-extrabold'>16,000kg</span> 적재</span>가 가능하며, 이는 최신 트로피 빌딩인 도쿄 토라노몬 힐즈의 8,000kg급 초대형 엘리베이터 대비 <span className="font-bold  -offset-4 decoration-stone-300"><span class='text-black font-extrabold'>2배 규모</span>입니다</span>.
                                    </p>
                                    <p>
                                        또한 기업 임차층에서도 대형 장비 및 설비 <span className="font-bold  -offset-4 decoration-stone-300">이동이 가능해</span> 입주사의 운영 효율성을 <span className="font-bold  -offset-4 decoration-stone-300">극대화합니다</span>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-start text-left">
                                <h2 className="text-[32px] md:text-[38px] lg:text-[46px] font-bold text-[#4a342a] tracking-[-0.03em] font-inter leading-tight mb-8 break-keep">
                                    Korea's Largest Elevator with<br />Direct Vehicle & Heavy-Equipment Access
                                </h2>

                                <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.02em] font-inter">
                                    <p className="mb-4">
                                        IOTA Two is equipped with Korea's highest-spec, <span className="font-bold">ultra-large</span> freight elevator.<br className="hidden lg:block" />
                                        It allows direct transport of large exhibits from the basement to the top-floor event space, enabling premium activations such as luxury sedan reveals, large-scale installations, technology demonstrations, and high-end product showcases.
                                    </p>
                                    <p className="mb-4">
                                        The elevator supports up to <span className="font-bold">16,000 kg</span>, twice the capacity of the 8,000 kg ultra-large elevator at Tokyo's Toranomon Hills, one of Asia's most advanced trophy towers.
                                    </p>
                                    <p>
                                        It also provides <span className="font-bold">exceptional logistical convenience</span> for tenants, allowing seamless movement of oversized equipment and specialized machinery within office floors.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
}
