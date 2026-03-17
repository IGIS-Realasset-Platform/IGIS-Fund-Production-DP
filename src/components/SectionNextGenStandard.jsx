import React from 'react';

export default function SectionNextGenStandard() {
    return (
        <section className="section w-full h-auto bg-white pt-[60px] md:pt-[100px] pb-[100px] text-[#111] scroll-mt-[100px]" id="section-nextgen-standard">

            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-center">

                {/* TEXT CONTENT - LEFT ALIGNED AS IN DESIGN */}
                <div className="w-full max-w-[1400px] flex flex-col justify-start bs-fade-up delay-200 mb-8 md:mb-12">

                    <h2 className="text-[32px] md:text-[50px] lg:text-[60px] font-bold text-[#203225] leading-tight tracking-[-0.03em] mb-2 md:mb-4 font-inter"
                        style={{ fontWeight: 'bold' }}>
                        A New Office Standard for the AI Era
                    </h2>

                    <div>
                        <h3 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-[#203225] leading-tight tracking-tight kr-target-text break-keep"
                            style={{ fontWeight: 'bold' }}
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><strong class='font-bold text-[#1a65a4]'>AI 시대를 대비한 미래형 업무환경의 새로운 글로벌 기준</strong></span>"
                            data-en="Blending Sustainability, Wellness, and Intelligence into the Workplace">
                            Blending Sustainability, Wellness, and Intelligence into the Workplace
                        </h3>
                    </div>
                </div>

                {/* FULL WIDTH IMAGE EXCEEDING TEXT WIDTH IF NEEDED (Max 1600px) */}
                <div className="w-full max-w-[1600px] mx-auto bs-fade-up delay-300 mb-10 md:mb-14">
                    <img  src="./img/nextgen_standard.webp" width="2200" height="911" alt="A New Office Standard" className="w-full h-auto object-cover" />
                </div>

                {/* TEXT CONTENT - DESCRIPTION BELOW IMAGE */}
                <div className="w-full max-w-[1400px] flex flex-col justify-start bs-fade-up delay-400">
                    <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] md:leading-[1.57] tracking-[-0.01em] w-full max-w-[1300px]">
                        <p className="kr-target-text transition-all duration-300 break-keep"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>이오타 서울은 <strong class='font-bold text-[#1a65a4]'>LEED·WELL</strong> 기반의 친환경·웰니스 인프라와 <strong class='font-bold text-[#1a65a4]'>WiredScore·SmartScore</strong> 기반의 디지털 환경을 통합하여 미래형 업무환경의 새로운 글로벌 기준을 제시합니다.<br/><br/>APATH RESILIENCE와의 전략적 협업을 통해 구축된 이 통합 프레임워크는 탄소중립(Net-Zero) 달성, ESG 경영 이행, AI 기반 업무환경 전환, 직원 복지와 생산성 향상 등 글로벌 기업이 추구하는 핵심 목표를 총체적으로 지원하도록 설계되었습니다.<br/><br/>이오타 서울은 기술, 웰니스, 디지털 인프라가 유기적으로 통합된 ESG 기반 오피스 플랫폼으로, 기업이 지속가능성과 효율성, 그리고 인간 중심의 업무 경험을 동시에 실현할 수 있는 차세대 글로벌 워크플레이스(Next-Gen Workplace)를 제공합니다.</span>"
                            data-en="IOTA Seoul integrates eco-friendly and wellness infrastructures certified by <span class='font-bold'>LEED</span> and <span class='font-bold'>WELL</span>, with digital systems aligned with <span class='font-bold'>WiredScore</span> and <span class='font-bold'>SmartScore</span>, setting <span class='font-bold'>a new global benchmark for future workplaces</span>.<br/><br/>Developed in strategic partnership with APATH RESILIENCE, this comprehensive framework is designed to address the core priorities of global enterprises— achieving Net-Zero carbon goals, fulfilling ESG commitments, advancing AI-driven workplace transformation, and enhancing employee well-being and productivity.<br/><br/>IOTA Seoul functions as an ESG-based office platform where technology, wellness, and digital infrastructure operate in synergy, delivering a Next-Generation Workplace that combines sustainability, operational efficiency, and a human-centered work experience for global innovators.">
                            IOTA Seoul integrates eco-friendly and wellness infrastructures certified by <span className="font-bold">LEED</span> and <span className="font-bold">WELL</span>, with digital systems aligned with <span className="font-bold">WiredScore</span> and <span className="font-bold">SmartScore</span>, setting <span className="font-bold">a new global benchmark for future workplaces</span>.<br />
                            Developed in strategic partnership with APATH RESILIENCE, this comprehensive framework is designed to address the core priorities of global enterprises— achieving Net-Zero carbon goals, fulfilling ESG commitments, advancing AI-driven workplace transformation, and enhancing employee well-being and productivity.<br />
                            IOTA Seoul functions as an ESG-based office platform where technology, wellness, and digital infrastructure operate in synergy, delivering a Next-Generation Workplace that combines sustainability, operational efficiency, and a human-centered work experience for global innovators.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}
