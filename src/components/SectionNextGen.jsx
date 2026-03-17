import React from 'react';

export default function SectionNextGen() {
    return (
        <section className="section w-full h-auto bg-white pt-[60px] md:pt-[100px] pb-[100px] text-[#111]" id="section-nextgen">
            {/* 1px Solid Line at top */}
            <div className="w-full border-t border-black mb-[60px] md:mb-[100px]"></div>

            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center">

                {/* BIG TITLE */}
                <div className="w-full text-center bs-fade-up mt-[80px] mb-[40px] md:mt-[100px] md:mb-[60px]">
                    <h2 className="text-[50px] md:text-[80px] lg:text-[100px] font-bold leading-[0.9] tracking-[-0.03em] font-inter text-gradient-wave-nextgen inline-block"
                        style={{ fontWeight: 'bold' }}>
                        Next-Gen<br />Workplace
                    </h2>
                </div>

                {/* TOP IMAGE */}
                <div className="w-full max-w-[700px] mx-auto mb-[60px] md:mb-[80px] bs-slide-right delay-200">
                    <img  src="./img/nextgenworkplace.webp" width="1522" height="1402" alt="IOTA Seoul Next-Gen Workplace" className="w-full h-auto object-cover" />
                </div>

                {/* TEXT CONTENT - CENTER ALIGNED */}
                <div className="w-full max-w-[1000px] flex flex-col items-center text-center">

                    <h3 className="text-[20px] md:text-[26px] lg:text-[32px] font-bold text-[#4B7053] leading-tight tracking-tight mb-4 md:mb-6 kr-target-text break-keep bs-fade-up delay-300"
                        style={{ fontWeight: 'bold' }}
                        data-en="AI Ready & GREEN — The New Standard for Future Workplaces"
                        data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><span class='text-black font-bold'>차세대 오피스의 표준: AI Ready & Green Infra</span></span>">
                        AI Ready & GREEN — The New Standard for Future Workplaces
                    </h3>

                    <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] md:leading-[1.57] tracking-[-0.01em] w-full max-w-[900px] bs-fade-up delay-400">
                        <p className="kr-target-text transition-all duration-300 break-keep"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>이오타서울은 기술과 인간의 협력을 기반으로 한 AI Ready 인프라와 지속 가능한 웰빙 환경을 조성하는 Green 인프라를 결합하여 <strong class='font-bold text-black'>'Biomorphic Workplace'</strong>라는 새로운 오피스 표준을 제시합니다.<br/><br/>AI 기반 빌딩 운영, 디지털 트윈, 사이버 보안, 로보틱스 제어 시스템을 통해 지능형 업무 환경을 구현하며, 에너지 절감형 설비와 웰니스 공간을 통해 인간 중심의 지속 가능한 워크플레이스를 완성합니다.</span>"
                            data-en="IOTA Seoul establishes a new benchmark for future workplaces through its <span class='font-bold'>AI Ready Infrastructure</span> and <span class='font-bold'>Green Sustainable Environment</span>, collectively forming the <span class='font-bold underline underline-offset-4 decoration-1 decoration-gray-400'>&quot;Biomorphic Workplace.&quot;</span><br/><br/>By integrating AI-powered building operations, digital twin systems, robotics, and advanced cybersecurity, the development enables a highly intelligent and automated work environment.<br/><br/>At the same time, its green infrastructure—featuring energy-efficient systems, open green areas, and wellness-oriented amenities—creates a human-centered and sustainable workplace for the next generation.">
                            IOTA Seoul establishes a new benchmark for future workplaces through its <span className="font-bold">AI Ready Infrastructure</span> and <span className="font-bold">Green Sustainable Environment</span>, collectively forming the <span className="font-bold underline underline-offset-4 decoration-1 decoration-gray-400">"Biomorphic Workplace."</span><br /><br />
                            By integrating AI-powered building operations, digital twin systems, robotics, and advanced cybersecurity, the development enables a highly intelligent and automated work environment.<br /><br />
                            At the same time, its green infrastructure—featuring energy-efficient systems, open green areas, and wellness-oriented amenities—creates a human-centered and sustainable workplace for the next generation.
                        </p>
                    </div>

                </div>

                {/* BOTTOM FIXTURE SPECIFICATION IMAGE */}
                <div className="w-full max-w-[1000px] mt-[66px] md:mt-[98px] bs-fade-up delay-300">
                    <img  src="./img/nextgen_specification.webp" width="2306" height="612" alt="Next Gen Specification" className="w-full h-auto object-contain" />
                </div>

            </div>
        </section>
    );
}
