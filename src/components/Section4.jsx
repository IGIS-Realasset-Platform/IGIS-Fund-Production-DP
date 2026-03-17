import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section4() {
    const { lang } = useLanguage();
    return (
        <section className="section h-auto min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden"
            id="section4">
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center py-24 md:py-0 relative">
                <img src="./img/logo_black.webp" width="856" height="286" alt="IOTA Logo" className="h-[70px] md:h-[110px] object-contain logo-wrapper" />
            </div>
            <div
                className="w-full md:w-1/2 bg-[#1b2a1f] text-white flex flex-col justify-center px-8 md:px-12 lg:px-24 py-24 md:py-32 green-panel relative z-10">
                <div className="max-w-[692px] text-content-wrapper">
                    <h2
                        className="text-[38px] md:text-[50px] font-bold tracking-[-0.03em] font-inter mb-16 bs-fade-up delay-100">
                        Brand
                        Guidelines</h2>
                    <div className="space-y-12 text-[17px] md:text-[19px] leading-[1.57] font-inter">
                        <div className={`opacity-90 bs-fade-up delay-300 ${lang === 'kr' ? 'font-semibold tracking-[-0.01em]' : 'font-light tracking-[-0.02em]'}`}
                            data-en="The name “IOTA”, derived from the Greek numeral for 10, symbolizes completeness and integration—a number that encompasses all others.<br />It represents IGIS Asset Management’s ambition to unify its offerings—real estate products, services, and platforms—under a singular master brand.<br /><br />The visual composition of the name, evoking both “10” and “IO,” reinforces the idea of wholeness and total value.<br />The horizontal and vertical strokes extending from the letter “I” symbolize the expansion of space, connectivity, and reach, mirroring IOTA’s vision of redefining urban experiences.<br /><br />More than a development, IOTA is a future-ready ecosystem that seamlessly blends space, service, culture, and lifestyle into a platform of open-ended possibilities."
                            data-kr="그리스 숫자로 10을 의미하는 단어 ‘IOTA’는 모든 수를 포함하는 통합의 수 ’10’을 뜻합니다.<br /><br />이지스자산운용이 제공하는 상품과 서비스, 플랫폼을 통합하는 마스터 브랜드를 의미하며, ’10’과 ‘IO’의 시각적 연상으로 완전함을 더합니다.<br /><br />더불어 ‘I’의 사방으로 뻗어나가는 가로, 세로획의 조합은 공간의 가치를 확장시켜 새로운 업역을 구축하는 IOTA의 행보와도 맞닿아 있으며 공간, 서비스, 플랫폼 등의 차별적 경험과 생활/문화를 포괄하며 열린 가능성을 담고 있습니다.">
                            그리스 숫자로 10을 의미하는 단어 ‘IOTA’는 모든 수를 포함하는 통합의 수 ’10’을 뜻합니다.<br /><br />
                            이지스자산운용이 제공하는 상품과 서비스, 플랫폼을 통합하는 마스터 브랜드를 의미하며, ’10’과 ‘IO’의 시각적 연상으로 완전함을 더합니다.<br /><br />
                            더불어 ‘I’의 사방으로 뻗어나가는 가로, 세로획의 조합은 공간의 가치를 확장시켜 새로운 업역을 구축하는 IOTA의 행보와도 맞닿아 있으며 공간, 서비스, 플랫폼
                            등의 차별적 경험과 생활/문화를 포괄하며 열린 가능성을 담고 있습니다.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
