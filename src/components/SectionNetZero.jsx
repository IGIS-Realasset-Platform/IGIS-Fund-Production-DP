import { useLanguage } from '../context/LanguageContext';

export default function SectionNetZero() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-white pt-[160px] pb-[200px]" id="section-netzero">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pt-12 bs-fade-up">

                {/* BIG ENGLISH TITLE (Center Aligned) */}
                <div className="w-full text-center mb-16 bs-fade-up delay-100">
                    <h2 className="text-[50px] md:text-[80px] lg:text-[100px] font-extrabold tracking-[-0.03em] leading-none font-inter text-gradient-wave">
                        Net-Zero Ready
                    </h2>
                </div>

                {/* IMAGES AREA */}
                <div className="w-full max-w-[1400px] mx-auto flex items-center justify-center mb-16 bs-fade-up delay-200">
                    <img  src="./img/netzero.webp" width="3100" height="1725" alt="IOTA Seoul Net-Zero Dashboard" className="w-full h-auto object-contain" />
                </div>

                {/* DESCRIPTION TEXT AREA */}
                <div className="w-full max-w-[1100px] mx-auto flex flex-col bs-fade-up delay-300">
                    {lang === 'kr' ? (
                        <div className="w-full flex flex-col items-start text-left">
                            <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-[#1a65a4] tracking-tight leading-tight mb-2 break-keep">
                                CRREM 2030 목표에 부합하는 Net-Zero Ready 오피스
                            </h3>
                            <h4 className="text-[17px] md:text-[20px] lg:text-[24px] font-semibold text-[#7b7b7d] font-inter tracking-[-0.01em] mb-10 font-inter leading-tight">
                                <span class='text-black font-extrabold'>30% Below National Carbon Baseline,<br />Fully Compliant with CRREM 2030</span>
                            </h4>

                            <div className="text-[17px] md:text-[19px]  font-semibold text-[#7b7b7d] font-inter leading-[1.57] tracking-[-0.01em] break-keep">
                                <p className="mb-4">
                                    이오타서울은 국내 탄소배출 허용기준 대비 30% 낮은 에너지 집약도를 구현하며, CRREM 2030 글로벌 에너지 효율 목표를 충족하는 Net-Zero Ready 오피스로 설계되었습니다.
                                </p>
                                <p className="mb-4">
                                    건물 내 모든 물리적 설비(HVAC, 기계설비, 조명, 전력, 재생에너지 등)에서 발생하는 <strong className="font-extrabold text-[#1a65a4]">데이터를 자동으로 수집하고 항목별로 세분화하여</strong> AI 기반 Net-Zero 관리 시스템으로 통합합니다. 중앙 대시보드에서는 에너지 소비, 온실가스 배출, 운영 효율, 유지보수 상태를 <strong className="font-extrabold text-[#1a65a4]">실시간 분석 및 최적화하며</strong>, 이를 통해 기업은 <strong className="font-extrabold text-[#1a65a4]">탄소 절감·비용 효율·ESG 보고 자동화를</strong> 동시에 실현합니다.
                                </p>
                                <p>
                                    이오타서울은 국내 기준을 넘어 글로벌 표준에 부합하는 지능형 Net-Zero 플랫폼으로, AI 기반 데이터 관리와 운영 최적화를 통해 지속가능한 오피스의 새로운 기준을 제시합니다.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-start text-left">
                            <h3 className="text-[24px] md:text-[32px] lg:text-[38px] font-bold text-[#1a65a4] tracking-[-0.01em] mb-10 font-inter leading-tight break-keep">
                                <span class='text-black font-extrabold'>30% Below National Carbon Baseline,<br />Fully Compliant with CRREM 2030</span>
                            </h3>

                            <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.02em] font-inter">
                                <p className="mb-4">
                                    IOTA Seoul achieves an energy intensity 30% below Korea's carbon emission baseline, fully compliant with the CRREM 2030 global energy efficiency target, establishing itself as a Net-Zero Ready workplace designed for the future.
                                </p>
                                <p className="mb-4">
                                    The building's physical systems — including HVAC, mechanical equipment, lighting, power, and renewable energy sources — <span className="font-bold">continuously generate data that is automatically collected</span>, categorized, and integrated into an AI-driven Net-Zero Management Platform. Through a centralized dashboard, energy consumption, greenhouse gas emissions, operational efficiency, and maintenance performance are <span className="font-bold">analyzed and optimized in real time</span>.
                                </p>
                                <p>
                                    This enables corporate tenants to simultaneously achieve <span className="font-bold">carbon reduction, cost efficiency, and automated ESG reporting</span>, positioning IOTA Seoul as a data-driven, globally aligned Net-Zero platform that defines the new benchmark for sustainable office environments.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
