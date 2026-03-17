import React from 'react';
import HoverImage from './HoverImage';

export default function SectionNamsan() {
    return (
        <section className="section w-full h-auto bg-white pt-[50px] md:pt-[100px] pb-[100px]" id="section-namsan">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center">

                {/* LARGE NAMSAN IMAGE */}
                <div className="w-full mb-12 overflow-hidden bs-fade-up">
                    <HoverImage  src="./img/namsan.webp" width="2000" height="1091" alt="Namsan Autumn View" className="w-full h-auto object-cover block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                </div>

                {/* TWO COLUMN TEXT LAYOUT */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start gap-8 md:gap-16 bs-fade-up delay-200">

                    <div className="w-full md:w-[calc(35%-30px)] shrink-0">
                        <h4 className="text-[20px] md:text-[20px] lg:text-[24px] font-extrabold text-[#6B3F3A] leading-snug tracking-[-0.02em] break-keep"
                            data-kr="남산 인접성, 조직의 지속가능성과<br/>생산성을 강화하는 공간적 요인"
                            data-en="Namsan's Proximity as a Structural Driver<br/>of Sustainable Productivity">
                            Namsan's Proximity as a Structural Driver<br />of Sustainable Productivity
                        </h4>
                    </div>

                    {/* RIGHT COLUMN: Description */}
                    <div className="w-full md:w-[calc(65%+30px)] text-[17px] md:text-[19px] text-gray-800 leading-[1.57] tracking-[-0.02em] font-medium break-keep">
                        <p className="kr-target-text transition-all duration-300 mb-4"
                            data-kr="남산은 서울 도심의 고밀도 업무 환경 속에서 심리적·환경적 완충 역할을 수행합니다. IOTA 서울은 남산과의 물리적 인접성을 통해 시각적 개방감, 미세기후 조절, 업무 집중도 향상 등 <span class='font-semibold tracking-[-0.01em]'>실질적 생산성 요소를</span> 동시에 확보합니다. 대형 녹지는 도시형 워크플레이스가 가지는 구조적 긴장과 과밀한 리듬을 완화하며, 이는 <span class='font-semibold tracking-[-0.01em]'>조직의 지속가능성과 장기적 성과 유지</span>에 핵심적으로 기여하는 요인으로 작용합니다."
                            data-en="Namsan functions as an ecological and psychological buffer within Seoul's high-density urban core.<br/>Through its spatial proximity, IOTA Seoul <span class='font-bold'>secures tangible productivity</span> gains such as visual openness, microclimatic balance, and enhanced cognitive focus within the workplace.<br/>The large-scale green mass alleviates urban density and operational strain, serving as a structural catalyst for <span class='font-bold'>organizational sustainability and long-term performance stability</span> in the modern workplace.">
                            Namsan functions as an ecological and psychological buffer within Seoul's high-density urban core.<br />
                            Through its spatial proximity, IOTA Seoul <span className="font-bold">secures tangible productivity</span> gains such as visual openness, microclimatic balance, and enhanced cognitive focus within the workplace.<br />
                            The large-scale green mass alleviates urban density and operational strain, serving as a structural catalyst for <span className="font-bold">organizational sustainability and long-term performance stability</span> in the modern workplace.
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}
