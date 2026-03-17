import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HoverImage from './HoverImage';

export default function SectionIotaOne() {
    const { lang } = useLanguage();

    return (
        <>
            <section className="section w-full h-auto bg-black pt-[50px] md:pt-[100px] pb-[100px] md:pb-[150px]" id="section-iotaone">

                {/* Top Large Title */}
                <div className="w-full flex justify-center py-[200px] md:py-[300px] bs-fade-up">
                    <h1 className="text-[70px] sm:text-[100px] md:text-[180px] lg:text-[250px] 2xl:text-[350px] leading-none font-inter font-thin text-white tracking-[-0.03em] uppercase">
                        IOTA One
                    </h1>
                </div>

                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start">

                    {/* First Item Area */}
                    <div className="flex flex-col w-full bs-fade-up">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>중앙광장: 도시와 자연을 잇는 웅장한 무대</>
                            ) : (
                                <>Central Plaza:<br />A Grand Stage Between City and Nature</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        이오타1의 중앙광장은 남산과 직접 연결되는 서울 도심 최대 규모의 오픈 플라자입니다. 탁 트인 공간에서는 브랜드 이벤트, 플리마켓, 공연 등 다양한 프로그램 운영이 가능하며, 서울역과의 연결로 뛰어난 접근성과 유동인구 확보가 가능합니다.
                                    </p>
                                    <p>
                                        비즈니스와 여가, 문화가 동시에 흐르는 이 곳은 이오타서울의 상징적인 커뮤니티 허브입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The central plaza of IOTA One is one of Seoul's largest open-air spaces, directly connected to Namsan Park. Its expansive layout enables a wide range of activities—from corporate events and cultural festivals to casual gatherings. With seamless pedestrian access to Seoul Station, the plaza offers unmatched connectivity and activation potential.
                                    </p>
                                    <p>
                                        It is the symbolic heart of IOTA Seoul, where business, leisure, and community converge.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* First Image Area */}
                    <HoverImage src="./img/iotaone_01.webp" width="3000" height="1685" alt="Central Plaza" />

                    {/* Second Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Rooftop Garden:<br className="md:hidden" /> 오피스 문 앞으로 다가온 자연</>
                            ) : (
                                <>Rooftop Garden:<br className="md:hidden" /> Nature at Your Office Doorstep</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        이오타1의 옥상정원은 사방이 녹지로 둘러싸인 조경형 휴식 공간으로, 업무 중에도 마치 남산 자락에 올라온 듯한 자연을 누릴 수 있습니다.
                                    </p>
                                    <p>
                                        서울 도심 한복판에서 진정한 '그린 리트릿'을 경험하며, 탁 트인 남산 전망과 함께 재충전과 영감을 동시에 얻을 수 있는 특별한 장소입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The rooftop garden of IOTA One offers a lush, landscaped retreat surrounded by greenery. It provides a serene atmosphere where tenants can recharge as if they've stepped into the hills of Namsan—without ever leaving the office.
                                    </p>
                                    <p>
                                        With unobstructed views of Namsan Park and an immersive natural setting, this space brings wellness, inspiration, and tranquility into the everyday work experience.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Image Area */}
                    <HoverImage src="./img/iotaone_02.webp" width="3000" height="1444" alt="Rooftop Garden" />

                    {/* Third Item Area (Title Only) */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Rooftop Garden:<br className="md:hidden" /> 남산의 파노라마 뷰를 품은 사색의 공간</>
                            ) : (
                                <>Rooftop Garden:<br className="md:hidden" /> Nature at Your Office Doorstep</>
                            )}
                        </h2>
                    </div>

                    {/* Third Image Area */}
                    <HoverImage src="./img/iotaone_03.webp" width="3000" height="1682" alt="Rooftop Garden View" />

                    {/* Fourth Item Area (UAM) */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>UAM 버티포트:<br className="md:hidden" /> 미래 모빌리티를 향한 혁신적 허브</>
                            ) : (
                                <>UAM Vertiport</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        도심항공교통(UAM) 시대를 대비하여, 옥상에 UAM 이착륙이 가능한 헬리포트형 선착장을 선제적으로 설계하였습니다.<br className="hidden md:block" />향후 모빌리티 기술 발전과 함께 하늘길이 열리면, 이오타서울은 서울 도심에서 가장 빠르게 UAM 정류가 가능한 오피스로 기능하게 됩니다.
                                    </p>
                                    <p>
                                        이는 비즈니스 속도와 연결성을 중시하는 글로벌 기업에게 탁월한 입지적 경쟁력이 될 것입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        IOTA One is future-proofed with a rooftop vertiport designed for next-generation Urban Air Mobility (UAM).<br className="hidden md:block" />Anticipating the rise of airborne transport, this infrastructure will enable IOTA Seoul to become one of the first business complexes in the city capable of supporting UAM operations.
                                    </p>
                                    <p>
                                        As air mobility networks evolve, IOTA's early readiness offers unmatched value for future-focused enterprises seeking speed, accessibility, and connectivity at the highest level.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fourth Image Area */}
                    <HoverImage src="./img/iotaone_04.webp" width="3000" height="1438" alt="UAM Vertiport" />

                    {/* Fifth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>호텔 포디움 가든:<br className="md:hidden" /> 남산으로 둘러쌓인 프라이빗 오아시스</>
                            ) : (
                                <>Hotel Podium Garden:<br className="md:hidden" /> A Private Oasis Framed by Namsan</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        이오타서울 호텔과 연결된 포디움 가든은 남산을 바로 마주한 조망과 고급 조경이 어우러진 야외 공간입니다.<br className="hidden md:block" />기업의 프라이빗 행사, 리셉션, 웨딩 등 다양한 이벤트가 가능한 서울 도심 내 보기 드문 고품격 오픈 스페이스로, 도시의 중심에서 자연과 함께하는 특별한 경험을 제공합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        Directly connected to the IOTA Seoul hotel, the podium garden offers a rare outdoor setting with panoramic views of Namsan.<br className="hidden md:block" />Surrounded by lush landscaping, this open-air terrace provides a prestigious venue for corporate receptions, private events, and weddings.<br className="hidden md:block" />It is a seamless blend of nature and elegance—an exceptional place to host memorable occasions in the very heart of Seoul.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fifth Image Area */}
                    <HoverImage src="./img/iotaone_05.webp" width="3000" height="1673" alt="Hotel Podium Garden" />

                    {/* Sixth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>남산의 석양으로 물드는 호텔 포디움 가든</>
                            ) : (
                                <>The Hotel Podium Garden at Dusk</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 호텔 포디엄 가든은 남산 조망을 확보한 야외 공간으로, 호텔의 연회장 및 라운지와 직접 연결되어 프라이빗 이벤트, 리셉션, 웨딩 등 다양한 형태의 행사를 수용할 수 있도록 설계되었습니다.<br className="hidden md:block" />정제된 조명과 조경 디자인을 통해 저녁 시간대에도 최적의 환경을 제공하며, 서울 도심 내에서 드물게 고급 야외 행사가 가능한 오픈 스페이스로 기능합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Podium Garden at IOTA Seoul offers an open-air venue with direct views of Namsan seamlessly connected to the hotel’s function spaces and lounges.<br className="hidden md:block" />It is designed to accommodate private events, receptions, and weddings, with refined landscape and lighting systems providing optimal conditions after dusk.<br className="hidden md:block" />The space serves as one of Seoul’s few high-end outdoor venues capable of hosting premium events within the city’s urban core.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sixth Image Area */}
                    <HoverImage src="./img/iotaone_06.webp" width="3000" height="1681" alt="{lang === 'kr' ? (
                                <>남산의 석양으로 물드는 호텔 포디움 가든</>
                            ) : (
                                <>The Hotel Podium Garden at Dusk</>
                            )}" />

                    <div className="mt-8 md:mt-12 w-full">
                        <HoverImage src="./img/iotaone_07.webp" width="3000" height="2059" alt="{lang === 'kr' ? (
                                <>남산의 석양으로 물드는 호텔 포디움 가든</>
                            ) : (
                                <>The Hotel Podium Garden at Dusk</>
                            )} 2" />
                    </div>

                    {/* Seventh Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>도심 한가운데서 마주하는 압도적인 개방감의 로비 경험</>
                            ) : (
                                <>An Expansive Lobby Experience<br className="md:hidden" /> at the Heart of the City</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA ONE의 오피스 메인 로비는 약 15미터의 층고와 전면유리 파사드를 통해 도심 한가운데에서도 개방감과 투명성을 극대화한 공간입니다.<br className="hidden md:block" />남산의 녹지와 시각적으로 연결되는 이 로비는 단순한 진입 공간을 넘어, 입주 기업과 방문객 모두에게 도시적 품격과 상징적 첫인상을 제공합니다.<br className="hidden md:block" />견고한 소재, 절제된 디테일, 그리고 자연광이 조화된 공간 구성은 IOTA ONE이 지향하는 '모던 헤리티지'의 정수를 보여줍니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The main office lobby of IOTA ONE features a soaring 15-meter ceiling and full-height glass façades, creating a sense of openness and transparency rarely achieved in the urban core.<br className="hidden md:block" />Visually connected to the greenery of Namsan, the lobby serves not only as an entryway but as a spatial statement of prestige and identity for its tenants and visitors.<br className="hidden md:block" />Defined by robust materials, refined detailing, and natural light, it embodies the architectural essence of modern heritage that defines IOTA Seoul.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seventh Image Area */}
                    <HoverImage src="./img/iotaone_08.webp" width="3000" height="1669" alt="Expansive Lobby Experience" />

                    {/* Eighth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>코어 진입부:<br className="md:hidden" /> 수직적 깊이감으로 완성된 정제된 입면</>
                            ) : (
                                <>Core Access:<br className="md:hidden" /> A Refined Façade Forged by Vertical Depth</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 코어 진입부는 수직적 비례감과 리듬감 있는 입면 디자인을 통해 건축의 정제된 질서를 시각적으로 구현한 공간입니다. 불필요한 장식을 배제하고 소재의 질감과 빛의 방향성을 강조함으로써,<br className="hidden md:block" />입주자와 방문객 모두에게 단단한 구조미와 절제된 긴장감을 전달합니다. 이곳은 단순한 이동의 통로가 아니라, IOTA 서울이 지향하는 품격과 정체성을 매일의 경험 속에서 체화하게 하는 상징적 공간으로 작동합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The core access of IOTA Seoul embodies refined architectural order through its vertical proportions and rhythmic façade composition.<br className="hidden md:block" />By eliminating unnecessary ornamentation and emphasizing the texture of materials and the direction of light,<br className="hidden md:block" />the space conveys a sense of structural solidity and restrained tension to both occupants and visitors.<br className="hidden md:block" />More than a circulation path, it serves as a symbolic space where the dignity and identity that define IOTA Seoul are internalized through everyday experience.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eighth Image Area */}
                    <HoverImage src="./img/iotaone_09.webp" width="4514" height="2534" alt="Core Access" />

                    <div className="mt-8 md:mt-12 w-full">
                        <HoverImage src="./img/iotaone_10.webp" width="3000" height="2004" alt="Core Access Details" />
                    </div>

                    {/* Ninth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>협업과 영감을 깨우는 오픈 라운지</>
                            ) : (
                                <>An Open Lounge for<br className="md:hidden" /> Collaboration and Inspiration</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        오피스 오픈라운지는 업무와 휴식, 개인과 조직의 경계를 유연하게 잇는 공간입니다.<br className="hidden md:block" />비공식 미팅, 협업, 리프레시 등 다양한 목적의 활동을 수용하며, 입주 기업 간의 자연스러운 교류와 창의적 사고를 촉진합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Office Open Lounge at IOTA Seoul connects work, rest, and collaboration within a single, fluid environment.<br className="hidden md:block" />Designed to accommodate informal meetings, team discussions, and moments of refreshment, it fosters natural interaction and creative synergy among tenants.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ninth Image Area */}
                    <HoverImage src="./img/iotaone_11.webp" width="3000" height="2034" alt="An Open Lounge for Collaboration and Inspiration" />

                    {/* Tenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>호텔 메인 로비:<br className="md:hidden" /> 남산의 풍경과 리츠칼튼의 품격이 닿는 곳</>
                            ) : (
                                <>Main Hotel Lobby:<br className="md:hidden" /> Where Namsan's Scenery Meets The Ritz-Carlton's Prestige</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 호텔 메인 로비는 남산의 녹지와 시각적으로 이어지는 탁월한 개방감을 통해, 도심 속에서도 자연과의 조화를 경험할 수 있는 환대의 무대를 제공합니다.<br className="hidden md:block" />리츠칼튼이 지향하는 절제된 품격과 세련된 서비스 철학은 자연광, 조경, 소재의 질감이 어우러진 로비 공간에 녹아 있습니다. 서울의 중심에서 휴식과 영감이 공존하는 새로운 럭셔리의 시작점입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The main hotel lobby of IOTA Seoul offers a rare sense of openness, seamlessly connected to the greenery of Namsan.<br className="hidden md:block" />It embodies the refined hospitality philosophy of The Ritz-Carlton, where nature, light, and material texture converge to create a calm yet sophisticated atmosphere.<br className="hidden md:block" />More than a point of arrival, it serves as a new threshold of urban luxury — a place where rest and inspiration coexist in the heart of Seoul.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tenth Image Area */}
                    <HoverImage src="./img/iotaone_12.webp" width="3000" height="1689" alt="Main Hotel Lobby" />

                    {/* Eleventh Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Hotel VIP Lounge:<br className="md:hidden" /> 도심의 정점에서 누리는 프라이빗 럭셔리</>
                            ) : (
                                <>Hotel VIP Lounge:<br className="md:hidden" /> Private Luxury at the Pinnacle of the City</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 VIP 라운지는 남산의 파노라믹 뷰를 배경으로, IOTA 서울과 리츠칼튼이 추구하는 가장 세련된 형태의 환대를 구현한 공간입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The VIP Lounge at IOTA Seoul captures the essence of The Ritz-Carlton's refined hospitality, framed by panoramic views of Namsan and the evening skyline.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eleventh Image Area */}
                    <HoverImage src="./img/iotaone_13.webp" width="3000" height="1680" alt="Hotel VIP Lounge" />

                </div>

                {/* Twelfth Item Area - Hotel EV Hall */}
                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start bs-fade-up mt-[106px] md:mt-32 mb-6 md:mb-8">
                    <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight break-keep">
                        Hotel EV Hall
                    </h2>
                </div>

                {/* Twelfth Image Area (Full Width) */}
                <div className="w-full">
                    <HoverImage src="./img/iotaone_14.webp" width="3000" height="1056" alt="Hotel EV Hall" className="w-full h-auto object-cover block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                </div>

                {/* Thirteenth Image Area (1000px Width) */}
                <div className="w-[calc(100%-48px)] md:w-full max-w-[1000px] mx-auto mt-8 md:mt-12">
                    <HoverImage src="./img/iotaone_15.webp" width="1764" height="1420" alt="Hotel EV Hall Details" />
                </div>

                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start">

                    {/* Fourteenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>몰입과 회복을 돕는 웰니스 센터</>
                            ) : (
                                <>A Wellness Center<br className="md:hidden" /> for Immersion and Recovery</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 웰니스 센터는 현대 비즈니스 리더를 위한 신체적 회복과 정신적 리셋의 균형 공간으로 설계되었습니다.<br className="hidden md:block" />
                                        자연과 연결된 명상실(Meditation Room)은 몰입과 정화를 돕는 디지털 환경을 구현하며, 피트니스 존은 채광, 공기질, 리듬감 있는 조명 설계를 통해 최적의 컨디션을 유지할 수 있는 공간을 제공합니다.<br className="hidden md:block" />
                                        단순한 운동 시설을 넘어, 조직의 지속 가능성과 개인의 집중력을 함께 강화하는 하이엔드 워크플레이스 웰니스 허브로 기능합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Wellness Center at IOTA Seoul is designed as a space for both physical renewal and mental clarity, catering to modern business leaders seeking balance.<br className="hidden md:block" />
                                        The Meditation Room, connected to digital landscapes inspired by nature, enhances focus and mindfulness, while the fitness zone optimizes performance through natural light, clean air, and rhythmically controlled lighting design.<br className="hidden md:block" />
                                        The center serves as a high-end workplace wellness hub, empowering both individual concentration and organizational sustainability.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fourteenth Image Area */}
                    <HoverImage src="./img/iotaone_16.webp" width="3000" height="1516" alt="A Wellness Center for Immersion and Recovery" />

                    {/* Fifteenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>웰니스 센터 이노베이션 허브 –<br className="md:hidden" /> 영감이 혁신으로 이어지는 교류의 장</>
                            ) : (
                                <>Wellness Center Innovation Hub<br className="md:hidden" /> – Where Collaboration Inspires Innovation</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        자연광과 녹지, 디지털 인터페이스가 결합된 이 공간은 정신적 여유와 창의적 몰입을 동시에 자극하는 환경을 제공합니다.<br className="hidden md:block" />
                                        입주 기업들은 이곳에서 워크숍, 브랜딩 세션, 공동 연구를 통해 조직의 경계를 넘어서는 새로운 시너지를 창출하게 됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        Blending natural light, greenery, and digital interfaces, the space stimulates both mental clarity and creative engagement.<br className="hidden md:block" />
                                        Tenant companies utilize this environment for workshops, branding sessions, and joint projects, fostering synergies that transcend organizational boundaries.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fifteenth Image Area */}
                    <HoverImage src="./img/iotaone_17.webp" width="3000" height="1533" alt="Wellness Center Innovation Hub" />

                    {/* Sixteenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>웰니스 센터 멤버스 클럽 –<br className="md:hidden" /> 최상위 비즈니스를 위한 프라이빗 라운지</>
                            ) : (
                                <>Wellness Center Member's Club<br className="md:hidden" /> – A Private Hub for Rest and Connection</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 <strong>멤버스 클럽(Member's Club)</strong>은 입주 기업과 핵심 구성원을 위한 프라이빗 커뮤니티 라운지로, 비즈니스와 휴식이 자연스럽게 이어지는 새로운 형태의 워크·라이프 플랫폼입니다.<br className="hidden md:block" />
                                        남산의 녹지를 향한 개방감 속에서, 이용자들은 사적 미팅, 브랜딩 이벤트, 네트워킹 세션 등을 통해 기업 간 교류와 협업을 심화시킬 수 있습니다.<br className="hidden md:block" />
                                        AI 기반 서비스, 로봇 어시스턴트 등 첨단 기술이 더해져, 정제된 프라이버시와 최첨단 편의가 공존하는 비즈니스 오아시스를 완성합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Member's Club at IOTA Seoul is a private community lounge designed for tenants and key executives, offering a seamless blend of business interaction and personal retreat.<br className="hidden md:block" />
                                        With panoramic views of Namsan's greenery, the space enables private meetings, branding events, and cross-company networking sessions in a relaxed yet sophisticated environment.<br className="hidden md:block" />
                                        Enhanced by AI-driven concierge services and robotic assistance, it embodies a refined balance between privacy, intelligence, and connection — a true business oasis in the heart of the city.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sixteenth Image Area */}
                    <HoverImage src="./img/iotaone_18.webp" width="3000" height="1514" alt="Wellness Center Member's Club" />

                    {/* Seventeenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-white tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>이머시브 갤러리:<br className="md:hidden" /> 예술과 기술, 그리고 감성의 경이로운 융합</>
                            ) : (
                                <>Immersive Gallery:<br className="md:hidden" /> A Convergence of Art, Tech, and Emotion</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-stone-300 leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 이머시브 갤러리(Immersive Gallery)는 예술과 기술, 그리고 공간이 하나로 융합되는 체험 중심의 미디어 아트 플랫폼입니다.<br className="hidden md:block" />
                                        디지털 인터랙션, 빛, 사운드, 데이터 시각화가 결합되어, 방문객은 예술을 '관람'하는 것이 아니라 직접 '경험'하고 '몰입'하게 됩니다.<br className="hidden md:block" />
                                        오피스와 호텔, 웰니스센터를 잇는 감성적 축으로서, 도심 속에서도 예술적 휴식과 창의적 영감을 동시에 제공하는 IOTA 서울의 문화적 아이콘으로 자리할 것입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Immersive Gallery at IOTA Seoul is a media art platform where art, technology, and architecture converge into a unified sensory experience.<br className="hidden md:block" />
                                        Through dynamic integrations of light, sound, and data visualization, visitors do not merely observe art—they enter and become part of it.<br className="hidden md:block" />
                                        As an emotional and cultural axis linking the Ritz-Carlton Hotel, Offices, and Wellness Center, the gallery provides both aesthetic respite and creative inspiration, establishing itself as a cultural landmark within IOTA Seoul.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seventeenth Image Area */}
                    <HoverImage src="./img/iotaone_19.webp" width="3000" height="1646" alt="Immersive Gallery" />

                </div>

            </section>
        </>
    );
}
