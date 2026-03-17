import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SectionSmartInterface() {
    const { lang } = useLanguage();

    return (
        <section className="section w-full h-auto bg-white pt-[60px] pb-[100px] scroll-mt-[100px]" id="section-smartinterface">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pt-12 bs-fade-up">

                {/* TITLES AREA */}
                <div className="w-full max-w-[1100px] mx-auto flex flex-col bs-fade-up delay-100">
                    {lang === 'kr' ? (
                        <div className="w-full flex flex-col items-start text-left mb-10">
                            <h2 className="text-[26px] md:text-[36px] lg:text-[42px] font-bold text-[#1a65a4] tracking-[-0.03em] leading-tight mb-2 break-keep">
                                IOTA 전용 인터페이스를 통한 매끄러운 사용자 경험
                            </h2>
                            <h3 className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#333] tracking-[-0.01em] font-inter leading-[1.2]">
                                Seamless User Experience<br />through the IOTA Smart Interface
                            </h3>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-start text-left mb-10">
                            <h2 className="text-[36px] md:text-[46px] lg:text-[52px] font-bold text-[#1a65a4] tracking-[-0.03em] font-inter leading-[1.15] break-keep">
                                Seamless User Experience<br />through the IOTA Smart Interface
                            </h2>
                        </div>
                    )}
                </div>

                {/* IMAGES AREA */}
                <div className="relative w-full max-w-[1400px] mx-auto flex items-center justify-center bs-fade-up delay-200 mb-12 lg:mb-16">
                    {/* Background Layer (Base) */}
                    <img src="./img/Smart_Interface_01.webp" width="2982" height="1947" alt="Smart Interface Background" className="w-full h-auto object-contain" />

                    {/* Foreground App Layer (Pops up!) */}
                    <img src="./img/Smart_Interface_02.webp" width="2982" height="1947" alt="Smart Interface App Layer" className="absolute w-[85%] md:w-[85%] lg:w-[91%] xl:w-[91%] h-auto object-contain bs-bounce-up delay-400" />
                </div>

                {/* DESCRIPTION TEXT AREA */}
                <div className="w-full max-w-[1100px] mx-auto flex flex-col bs-fade-up delay-300">
                    {lang === 'kr' ? (
                        <div className="text-[17px] md:text-[19px]  font-semibold text-[#7b7b7d] font-inter leading-[1.57] tracking-[-0.01em] break-keep text-left">
                            <p className="mb-4">
                                IOTA Seoul은 사용자가 건물과 상호작용하는 모든 순간을 직관적이고 매끄럽게 설계했습니다.<br className="hidden lg:block" />
                                공기질, 온습도, 조명, 에너지 사용량 등 <strong className="font-extrabold text-[#1a65a4]">환경 데이터를 실시간으로 시각화</strong>하여 사용자가 환경 상태를 한눈에 확인할 수 있으며,<br className="hidden lg:block" />
                                Building OS는 이를 기반으로 공조·환기·조명 시스템을 자동 제어합니다.
                            </p>
                            <p>
                                또한 방문객과 입주자는 스마트폰 또는 AR 기반 인터페이스를 통해 위치 안내, 회의실 예약, 출입 인증, 주차 정보,<br className="hidden lg:block" />
                                그리고 개인 맞춤형 길찾기까지 <strong className="font-extrabold text-[#1a65a4]">하나의 통합 플랫폼</strong> 안에서 손쉽게 이용할 수 있습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.02em] font-inter text-left">
                            <p className="mb-4">
                                IOTA Seoul redefines how users interact with buildings by creating a seamless, intuitive experience across all touchpoints. Key environmental data—such as air quality, temperature, humidity, and energy usage—are visualized in real time, while the AI Agent autonomously manages HVAC, ventilation, and lighting systems to ensure continuous comfort.
                            </p>
                            <p>
                                Through a unified smartphone and AR-based interface, tenants and visitors can easily access navigation guidance, meeting room booking, access control, parking information, and personalized routes.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
