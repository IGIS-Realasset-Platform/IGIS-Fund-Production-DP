import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HoverImage from './HoverImage';

export default function SectionIotaTwo() {
    const { lang } = useLanguage();

    return (
        <>
            <section className="section w-full h-auto bg-white pt-[50px] md:pt-[100px] pb-[100px] md:pb-[150px]" id="section-iotatwo">

                {/* Top Large Title */}
                <div className="w-full flex justify-center py-[200px] md:py-[300px] bs-fade-up">
                    <h1 className="text-[70px] sm:text-[100px] md:text-[180px] lg:text-[250px] 2xl:text-[350px] leading-none font-inter font-thin text-black tracking-[-0.03em] uppercase">
                        IOTA Two
                    </h1>
                </div>

                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start">

                    {/* First Item Area */}
                    <div className="flex flex-col w-full bs-fade-up">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>지상 진입부:<br className="md:hidden" /> 도시의 흐름을 잇는 개방형 진입 구조</>
                            ) : (
                                <>Ground Level Entry:<br className="md:hidden" /> A Seamless Transition from City to Space</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two의 1층 진입부는 건물을 들어올린 듯한 파일로티 구조로 계획되어, 남산의 녹지축에서 서울역 광장으로 이어지는 도심 보행 네트워크를 끊임없이 연결합니다.<br className="hidden md:block" />
                                        이 열린 도시 레벨의 설계는 건축물 하나의 '경계'가 아닌 '흐름'으로 해석하며, 이오타 서울 전역에 걸친 공공적 연속성(Public Continuity)을 강화합니다.<br className="hidden md:block" />
                                        이를 통해 이용자는 남산의 자연에서 서울역 중심까지, 하나의 유기적 오픈 스페이스를 경험하게 됩니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The ground level of IOTA Two is designed with a pilotis architectural form, lifting the building to create an uninterrupted open space connecting Namsan's green axis to Seoul Station Plaza.<br className="hidden md:block" />
                                        This elevated structure transforms the threshold between architecture and city into a continuous urban flow, enhancing the sense of public permeability and spatial openness throughout the IOTA Seoul development.<br className="hidden md:block" />
                                        Pedestrians experience a seamless transition from nature to the urban core-a new spatial continuity redefining the interface between landscape and architecture.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* First Image Area */}
                    <HoverImage src="./img/iotatwo_01.webp" width="3000" height="1691" alt="Ground Level Entry" />
                </div>

                {/* Second Item Area (Full Width) */}
                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start bs-fade-up mt-[106px] md:mt-32 mb-6 md:mb-8">
                    <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight break-keep mb-6 md:mb-8">
                        {lang === 'kr' ? (
                            <>Gateway Park:<br className="md:hidden" /> 서울역에 열린 새로운 시민의 안식처</>
                        ) : (
                            <>Gateway Park:<br className="md:hidden" /> Connecting City and Nature</>
                        )}
                    </h2>

                    <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter">
                        {lang === 'kr' ? (
                            <div className="break-keep font-normal">
                                <p className="mb-4">
                                    IOTA Two의 게이트웨이 파크(Gateway Park)는 남산의 녹지와 서울역 광장을 유기적으로 연결하는 도심 속 개방형 공공 공간입니다.<br className="hidden md:block" />
                                    계단형 테라스와 다층적 식재 구조를 통해 이용자는 자연스럽게 도심의 레벨 차를 따라 이동하며, 남산에서 서울역까지 이어지는 녹지 흐름(Green Continuum)을 경험합니다.<br className="hidden md:block" />
                                    단순한 개방공간 또는 접근 동선이 아니라, 업무와 일상, 시민과 입주자가 교차하는 도시의 완충이자 교류의 장으로 기능합니다.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4">
                                    The Gateway Park at IOTA Seoul forms an open urban landscape that seamlessly links the greenery of Namsan with the civic plaza of Seoul Station.<br className="hidden md:block" />
                                    Through its terraced design and multi-layered planting, visitors experience a gentle transition across the city's natural elevation, creating a continuous green corridor from mountain to metropolis.<br className="hidden md:block" />
                                    More than a passageway, the park acts as an urban interface—a shared ground where work, leisure, and community converge, blurring the boundaries between architecture, landscape, and everyday life.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Second Image Area (Full Width) */}
                <div className="w-full">
                    <HoverImage src="./img/iotatwo_02.webp" width="3000" height="2124" alt="Gateway Park" className="w-full h-auto object-cover block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                </div>

                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start">

                    {/* Third Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>시티뷰 Multi-Use 아레나 :<br className="md:hidden" /> 도심의 조망을 담은 가변적 코트</>
                            ) : (
                                <>Corporate Multi-Use Arena:<br className="md:hidden" /> Versatile, Urban, Inspiring</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two에 위치한 다목적 아레나는 서울역 시티뷰를 배경으로, 농구, 배드민턴, 테니스 등 단체 스포츠는 물론 기업의 타운홀 미팅, 발표 행사 등 다양한 활동에 맞춰 유연하게 변모할 수 있는 입주사 전용 공간입니다.<br className="hidden md:block" />
                                        탁 트인 공간감과 개방형 구조는 뉴욕 시그램 빌딩의 멀티홀을 연상시키며, 도심 속에서 에너지와 소통을 모두 아우르는 ‘워크 앤 플레이’ 공간으로 기능합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        Located in IOTA Two with sweeping views of Seoul Station, this multi-use arena is a flexible, tenant-only space designed for both movement and meaning.<br className="hidden md:block" />
                                        Whether hosting a town hall, a corporate presentation, or a casual game of basketball or tennis, the arena transforms effortlessly to meet the evolving needs of modern enterprises.<br className="hidden md:block" />
                                        Reminiscent of the iconic multipurpose space in the Seagram Building, it offers a rare balance of productivity, wellness, and community—right in the heart of the city.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Third Image Area */}
                    <HoverImage src="./img/iotatwo_03.webp" width="3000" height="1589" alt="Corporate Multi-Use Arena" />

                    {/* Fourth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Sky Garden:<br className="md:hidden" /> 자연의 녹음과 도심의 스카이라인이 교차하는 입체 정원</>
                            ) : (
                                <>Sky Garden:<br className="md:hidden" /> Where Nature Meets Skyline</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        이오타서울의 32층부터 34층을 자연스럽게 연결하는 스카이가든은 녹지와 쉼터가 어우러진 입체 보행 동선을 따라 누구나 자유롭게 걷고 휴식할 수 있는 오픈 공간입니다.<br className="hidden md:block" />
                                        입주사 임직원은 물론 외부 방문객도 이용 가능한 이 공간은 서울역과 남산을 동시에 조망할 수 있는 파노라믹 시티뷰를 제공하며, 도심 한복판에서 자연과 일상이 만나는 경험을 제공합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        Spanning the 32nd to 34th floors of IOTA Seoul, the Sky Garden is a continuous, landscaped walkway open to both tenants and the public.<br className="hidden md:block" />
                                        Its intuitive vertical circulation and lush greenery create an elevated sanctuary where visitors can relax, recharge, and reconnect with nature. Framed by sweeping panoramic views of Namsan and Seoul Station,<br className="hidden md:block" />
                                        this rooftop garden redefines what it means to pause and breathe—right in the heart of the city.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fourth Image Area */}
                    <HoverImage src="./img/iotatwo_04.webp" width="3000" height="1683" alt="Sky Garden" />

                    <div className="mt-8 md:mt-12 w-full">
                        <HoverImage src="./img/iotatwo_05.webp" width="3000" height="2098" alt="Sky Garden Details" />
                    </div>

                    {/* Fifth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Event Space:<br className="md:hidden" /> 브랜드와 문화, 그리고 도시가 만나는 접점</>
                            ) : (
                                <>Event Space:<br className="md:hidden" /> Where Brands Shine, Culture Thrives, and the City Connects.</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two 최상층에 위치한 이벤트 스페이스는 서울 도심을 한눈에 내려다보는 파노라믹 시티뷰와 몰입형 미디어 월, 무빙 라이트 시스템 등 최첨단 무대 인프라를 갖춘 복합 문화 공간입니다.<br className="hidden md:block" />
                                        브랜드 런칭, 컨퍼런스, 공연, 아트쇼 등 다양한 행사를 유치할 수 있으며, 토라노몬 힐스의 ‘Tokyo Node’처럼 비즈니스와 문화가 교차하는 도시의 새로운 상징이 될 것입니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        Located at the top of IOTA Seoul, the event space offers a panoramic skyline view and immersive media infrastructure—including full-surround digital walls and adaptive lighting systems.<br className="hidden md:block" />
                                        Designed to host everything from brand showcases and corporate forums to live performances and digital art installations, this venue aspires to become a cultural landmark, much like 'Tokyo Node' at Toranomon Hills.<br className="hidden md:block" />
                                        It’s where business meets creativity, and where Seoul’s future is staged.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fifth Image Area */}
                    <HoverImage src="./img/iotatwo_06.webp" width="3000" height="1595" alt="Event Space" />

                    {/* Sixth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Sky Garden & Event Space:<br className="md:hidden" /> 서울의 스카이라인을 소유하는 특별한 경험</>
                            ) : (
                                <>Sky Garden & Event Space:<br className="md:hidden" /> An Elevated Cultural Destination Above the City</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA 서울의 스카이가든과 이벤트 스페이스는 도심의 가장 높은 지점에서 자연과 예술, 그리고 도시의 풍경을 함께 경험할 수 있는 열린 문화 공간입니다.<br className="hidden md:block" />
                                        남산과 서울 전경이 한눈에 펼쳐지는 이곳은 비즈니스 행사, 브랜드 런칭, 프라이빗 리셉션 등 다양한 프로그램을 통해 도심 속 새로운 커뮤니티 허브이자 상징적 랜드마크로 자리합니다.<br className="hidden md:block" />
                                        야간에는 투명한 파빌리온 구조가 빛으로 물들어 서울 도심의 스카이라인을 완성하는 <strong>빛의 정원(Luminous Garden)</strong>으로 변모합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Sky Garden and Event Space at IOTA Seoul serve as an open cultural venue above the city, where nature, art, and panoramic urban views come together in one extraordinary setting.<br className="hidden md:block" />
                                        Overlooking both Namsan and the Seoul skyline, this elevated venue hosts business gatherings, brand events, and private receptions, becoming a new community hub and architectural landmark within the city.<br className="hidden md:block" />
                                        By night, the glass pavilion glows softly against the skyline, transforming into a luminous garden in the sky that defines Seoul’s new horizon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sixth Image Area */}
                    <HoverImage src="./img/iotatwo_07.webp" width="3000" height="1692" alt="Sky Garden and Event Space" />

                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>오피스 진입공간</>
                            ) : (
                                <>Office Entry Space</>
                            )}
                        </h2>
                        <HoverImage src="./img/iotatwo_08.webp" width="3000" height="1942" alt="Sky Garden and Event Space Details" />
                    </div>

                    {/* Seventh Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>IOTA Two Main Lobby:<br className="md:hidden" /> 도시의 활력과 자연의 여유가 만나는 곳</>
                            ) : (
                                <>IOTA Two Main Lobby:<br className="md:hidden" /> Where the City's Flow Meets Architecture</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two의 메인로비는 외부 도시 레벨과 자연스럽게 연결되는 개방형 진입공간(Open Urban Lobby)으로 설계되었습니다.<br className="hidden md:block" />
                                        남산에서 내려오는 녹지와 서울역으로 이어지는 보행축이 내부로 스며들며, 실내에서도 자연과 도시의 흐름을 동시에 느낄 수 있는 공간적 연속성을 구현합니다.<br className="hidden md:block" />
                                        수직으로 확장된 천정고와 자연광, 그리고 그린 마감재의 조화는 입주자에게 도시 속에서도 여유와 품격을 동시에 경험하게 하는 환영의 공간을 완성합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Main Lobby of IOTA Two is conceived as an open urban gateway, seamlessly integrating the flow of the city into the architecture.<br className="hidden md:block" />
                                        Greenery descending from Namsan extends inward, merging with the pedestrian axis toward Seoul Station, creating a sense of spatial continuity between nature and the urban realm.<br className="hidden md:block" />
                                        The grand vertical height, natural light, and refined green finishes offer tenants a tranquil yet sophisticated arrival experience at the heart of the city.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seventh Image Area */}
                    <HoverImage src="./img/iotatwo_09.webp" width="3000" height="1775" alt="IOTA Two Main Lobby" />

                    {/* Eighth Item Area - Mobile Text */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32 md:hidden">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>메인 로비 코어 진입부:<br className="md:hidden" /> 발걸음에 따라 전개되는 역동적인 건축 리듬</>
                            ) : (
                                <>Main Lobby Core Access:<br className="md:hidden" /> Architectural Rhythm in Motion</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two의 Core Access는 건축의 구조미와 재료의 질감을 통해 공간의 '이동'을 '경험'으로 확장시킨 구간입니다.<br className="hidden md:block" />
                                        엄선된 소재의 깊은 결, 수직 리듬을 이루는 패널, 자연광의 미묘한 반사는 기능과 미학이 균형을 이루는 정제된 질서감을 만들어냅니다.<br className="hidden md:block" />
                                        단순한 진입 통로가 아니라, IOTA Two의 정체성과 품격을 시각적으로 인식하게 하는 첫 번째 순간으로 작동합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Core Access Zone of IOTA Two transforms movement into a refined architectural experience.<br className="hidden md:block" />
                                        The interplay of carefully selected materials, rhythmic panels, and shifting natural light creates a composed balance between function and form.<br className="hidden md:block" />
                                        Here, order and material craft converge, defining the building's architectural identity.<br className="hidden md:block" />
                                        It is not merely a passage, but the first visual encounter with IOTA Two's precision and dignity.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Full Width Image Area (iotatwo_10) with Desktop Overlay Text */}
                <div className="relative w-full mt-12 md:mt-32 bs-fade-up overflow-hidden">
                    <HoverImage src="./img/iotatwo_10.webp" width="3000" height="2114" alt="Main Lobby View" className="w-full h-auto object-cover block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />

                    {/* Desktop Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none hidden md:block z-10"></div>

                    {/* Desktop Text Overlay */}
                    <div className="absolute bottom-10 left-10 lg:bottom-20 lg:left-24 z-20 text-white hidden md:flex flex-col max-w-[1200px] pointer-events-none pr-10">
                        <h2 className="text-[40px] font-inter font-light tracking-[-0.03em] leading-tight mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>메인 로비 코어 진입부: 발걸음에 따라 전개되는 역동적인 건축 리듬</>
                            ) : (
                                <>Main Lobby Core Access: Architectural Rhythm in Motion</>
                            )}
                        </h2>

                        <div className="w-full text-[17px] font-light text-stone-200 leading-[1.57] tracking-[-0.01em] font-inter">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4 opacity-100">
                                        IOTA Two의 Core Access는 건축의 구조미와 재료의 질감을 통해 공간의 '이동'을 '경험'으로 확장시킨 구간입니다.<br />
                                        엄선된 소재의 깊은 결, 수직 리듬을 이루는 패널, 자연광의 미묘한 반사는 기능과 미학이 균형을 이루는 정제된 질서감을 만들어냅니다.<br />
                                        단순한 진입 통로가 아니라, IOTA Two의 정체성과 품격을 시각적으로 인식하게 하는 첫 번째 순간으로 작동합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4 opacity-100">
                                        The Core Access Zone of IOTA Two transforms movement into a refined architectural experience.<br />
                                        The interplay of carefully selected materials, rhythmic panels, and shifting natural light creates a composed balance between function and form.<br />
                                        Here, order and material craft converge, defining the building's architectural identity.<br />
                                        It is not merely a passage, but the first visual encounter with IOTA Two's precision and dignity.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reopen restricted container */}
                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col items-start pt-24 md:pt-32">

                    {/* Eighth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>IOTA Two 메인 로비:<br className="md:hidden" /> 정제된 개방감과 건축적 질서</>
                            ) : (
                                <>IOTA Two Main Lobby:<br className="md:hidden" /> Refined Openness and Architectural Order</>
                            )}
                        </h2>

                    </div>

                    {/* Eighth Image Area */}
                    <HoverImage src="./img/iotatwo_11.webp" width="3000" height="1887" alt="Main Lobby Core Access" />

                    {/* Ninth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>오피스 오픈 라운지:<br className="md:hidden" /> 네트워킹과 평온한 사색이 공존하는 공간</>
                            ) : (
                                <>Office Open Lounge:<br className="md:hidden" /> Where Connection Meets Calm</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two의 오픈라운지는 업무의 긴장감과 도심의 밀도를 완화하는 쉼의 공간으로 설계되었습니다.<br className="hidden md:block" />
                                        자연광이 깊숙이 스며드는 투명한 파사드와 녹음이 가득한 내부 조경은, 사람 중심의 웰니스 오피스라는 IOTA의 철학을 드러냅니다.<br className="hidden md:block" />
                                        이곳은 자유로운 미팅, 비공식적 교류, 짧은 휴식이 공존하는 하이브리드 공간으로, 입주자들에게 생산성과 감성적 회복을 동시에 제공하는 오피스의 새로운 유형을 제시합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Open Lounge at IOTA Two is designed as a serene retreat within the city's dynamic rhythm.<br className="hidden md:block" />
                                        Natural light floods through the transparent façade, while lush greenery softens the spatial tension, embodying the essence of a human-centered wellness workplace.<br className="hidden md:block" />
                                        It serves as a flexible zone for informal meetings, quiet reflection, and spontaneous collaboration<br className="hidden md:block" />
                                        —a space that balances productivity with emotional restoration, redefining what modern office life can be.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ninth Image Area */}
                    <HoverImage src="./img/iotatwo_12.webp" width="3000" height="1356" alt="Office Open Lounge" />



                    {/* Tenth Item Area */}
                    <div className="flex flex-col w-full bs-fade-up mt-[106px] md:mt-32">
                        <h2 className="text-[28px] md:text-[40px] font-inter font-light text-black tracking-[-0.03em] leading-tight mb-6 md:mb-8 break-keep">
                            {lang === 'kr' ? (
                                <>Office Elevator Hall:<br className="md:hidden" /> 기술과 자연의 균형, 정제된 환대의 공간</>
                            ) : (
                                <>Office Elevator Hall:<br className="md:hidden" /> A Refined Balance of Technology and Nature</>
                            )}
                        </h2>

                        <div className="w-full max-w-full text-[17px] md:text-[19px] font-light text-black leading-[1.57] tracking-[-0.01em] font-inter mb-[10px] md:mb-[36px]">
                            {lang === 'kr' ? (
                                <div className="break-keep font-normal">
                                    <p className="mb-4">
                                        IOTA Two의 오피스 EV 홀은 글로벌 기업들이 추구하는 정제된 감성과 기능적 완결성을 동시에 담았습니다.<br className="hidden md:block" />
                                        벽면을 감싸는 자연석 질감의 엄선된 소재는 차가운 금속과 빛의 반사 속에서도 따뜻한 안정감을 전하며, 수직적으로 구성된 공간 리듬은 기술과 인간, 속도와 여유의 균형을 표현합니다.<br className="hidden md:block" />
                                        이는 단순한 이동 공간을 넘어, 브랜드의 품격과 공간의 정체성을 각인시키는 시퀀스로 기능합니다.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4">
                                        The Office Elevator Hall of IOTA Two conveys the refined sensibility and technical precision favored by global technology companies.<br className="hidden md:block" />
                                        The carefully selected natural materials envelop the walls, creating warmth amid the sleek reflection of metal and light.<br className="hidden md:block" />
                                        Its vertical rhythm expresses the balance between technology and humanity, efficiency and composure.<br className="hidden md:block" />
                                        More than a passageway, it serves as a spatial sequence that defines identity and instills calm sophistication from the moment of transition.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tenth Image Area */}
                    <div className="w-full flex flex-col items-center gap-12 md:gap-24">
                        <div className="w-full">
                            <HoverImage src="./img/iotatwo_13.webp" width="3000" height="1390" alt="Office Elevator Hall Focus" />
                        </div>
                        <div className="w-full max-w-[800px]">
                            <HoverImage src="./img/iotatwo_15.webp" width="1500" height="1225" alt="Office Elevator Detail" />
                        </div>
                    </div>

                    {/* Image Area (iotatwo_14) - Header Width */}
                    <div className="w-full mt-[106px] md:mt-32">
                        <HoverImage src="./img/iotatwo_14.webp" width="3000" height="1977" alt="Office Elevator Hall View" className="w-full h-auto object-cover block" wrapperClassName="w-full relative overflow-hidden group cursor-pointer" />
                    </div>

                </div>

                {/* Closing dummy div just for regex to match properly and structure consistency */}
                <div className="hidden">
                </div>

            </section>
        </>
    );
}
