import React from 'react';

export default function Section5() {
    return (
        <section className="w-full bg-white text-black relative" id="section5">
            {/* --- DESKTOP VIEW (lg and up) --- */}
            {/* Container spanning 230vh to allow scroll room for the effect */}
            <div className="hidden lg:block w-full relative h-[230vh]" id="sybd-scroll-area">
                {/* STICKY BLOCK */}
                <div className="w-full h-[100vh] sticky top-0 left-0 overflow-hidden bg-white flex flex-col lg:block">

                    {/* LEFT TEXT PANELS */}
                    <div
                        className="relative lg:absolute top-0 left-0 w-full h-[60vh] lg:h-full lg:w-[50%] z-20 overflow-hidden pointer-events-none">

                        {/* STEP 1 (Starts active, goes UP to disappear) */}
                        <div id="sybd-step-1"
                            className="sybd-step active absolute top-0 left-0 w-full h-full flex flex-col justify-center px-6 md:px-[60px] lg:pl-[150px] lg:pr-[60px] bg-transparent">

                            <div
                                className="font-bold text-[20px] md:text-[22px] text-gray-800 mb-2 font-inter tracking-tight">
                                New Economy Cluster</div>
                            <h2
                                className="text-[40px] md:text-[60px] lg:text-[84px] font-extrabold leading-none mb-10 text-black tracking-[-0.03em] font-inter">
                                SYBD <span
                                    className="text-[11px] md:text-[13px] font-normal text-gray-500 align-middle tracking-[-0.03em]">*Seoul
                                    Yongsan Business District</span>
                            </h2>
                            <div className="mb-4">
                                <h3 className="text-[18px] md:text-[22px] font-bold text-[#3B7062] tracking-[-0.02em]"
                                    data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><span class='text-black font-bold'>글로벌 인재, 혁신 기업을 위한 새로운 업무 지구로의 부상</span></span>"
                                    data-en="Becoming the New Business District for Global Talent and Innovative Companies">
                                    <span class='text-black font-extrabold'>글로벌 인재, 혁신 기업을 위한 새로운 업무 지구로의 부상</span>
                                </h3>
                                <div
                                    className="text-[14px] md:text-[16px] text-black mt-[10px] font-inter font-bold tracking-tight">
                                    Seoul's Next Global Business Hub</div>
                            </div>
                            <div
                                className="text-[17px] md:text-[19px] text-black leading-[1.57] tracking-[-0.02em] space-y-4 mb-10 font-normal kr-target-text">
                                <p className="kr-target-text transition-all duration-300"
                                    data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>서울역과 용산역을 잇는 교통의 결절지인 SYBD는 뉴욕의 그랜드 센트럴에서 허드슨 야드를 아우르는 글로벌 업무지구와 같이 서울의 차기 글로벌 비즈니스 허브로 도약할 것입니다.</span>"
                                    data-en="Connecting Seoul Station and Yongsan Station, SYBD (Seoul Yongsan Business District) is becoming the most desired retail and office locations within the city. Just as Hudson Yards extends from Grand Central Terminal in New York to form a world-class business cluster, SYBD is poised to become Seoul's next-generation global business hub, seamlessly integrating transit, commerce, and innovation.">
                                    서울역과 용산역을 잇는 교통의 결절지인 SYBD는 뉴욕의 그랜드 센트럴에서 허드슨 야드를 아우르는 글로벌 업무지구와 같이 서울의 차기 글로벌 비즈니스
                                    허브로 도약할 것입니다.
                                </p>
                            </div>
                            {/* Chart Comparison */}
                            <div
                                className="w-full h-[240px] md:h-[280px] lg:h-[340px] flex font-inter text-[11px] md:text-[12px] font-medium text-black tracking-tight justify-between items-stretch relative mt-4 mb-[70px] lg:mb-0">
                                {/* Manhattan */}
                                <div className="w-[48%] flex flex-col items-center h-full">
                                    <div className="mb-3 text-[14px] md:text-[16px]">Manhattan</div>
                                    <div className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal">
                                        Grand Central Station</div>
                                    <div className="w-px bg-black relative flex-[2] min-h-[40px] my-1">
                                        <div
                                            className="absolute -top-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-black animate-arrow-top">
                                        </div>
                                        <div
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 whitespace-nowrap text-center leading-[1.57] isolate before:absolute before:inset-0 before:bg-white before:opacity-80 before:-z-10 rounded">
                                            3km<br /><span className="font-normal text-[10px]">(10,000 feet)</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#3A4A41] text-white px-2 py-2 w-full text-center tracking-normal">
                                        Penn Station</div>
                                    <div className="w-px bg-black relative flex-[1] min-h-[20px] my-1">
                                        <div
                                            className="absolute -bottom-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black animate-arrow-bottom">
                                        </div>
                                    </div>
                                    <div
                                        className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal mt-auto shrink-0">
                                        Hudson Yards Station</div>
                                </div>
                                {/* Seoul */}
                                <div className="w-[48%] flex flex-col items-center h-full">
                                    <div className="mb-3 text-[14px] md:text-[16px]">Seoul</div>
                                    <div className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal">
                                        Seoul Station</div>
                                    <div className="w-px bg-black relative flex-[3] min-h-[80px] my-1">
                                        <div
                                            className="absolute -top-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-black animate-arrow-top">
                                        </div>
                                        <div
                                            className="absolute -bottom-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black animate-arrow-bottom">
                                        </div>
                                        <div
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 whitespace-nowrap text-center leading-[1.57] isolate before:absolute before:inset-0 before:bg-white before:opacity-80 before:-z-10 rounded">
                                            2.7km<br /><span className="font-normal text-[10px]">(9,000 feet)</span>
                                        </div>
                                    </div>
                                    <div
                                        className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal mt-auto shrink-0">
                                        Yongsan Station</div>
                                </div>
                            </div>

                        </div>

                        {/* STEP 2 (Starts down invisibly, comes UP to appear) */}
                        <div id="sybd-step-2"
                            className="sybd-step down-in absolute top-0 left-0 w-full h-full flex flex-col justify-center px-6 md:px-[60px] lg:pl-[150px] lg:pr-[60px] bg-transparent">

                            <div className="font-bold text-[20px] md:text-[22px] text-gray-800 mb-2 font-inter tracking-tight"
                                data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>Unrivaled Accessibility</span>" data-en="Unrivaled Accessibility">
                                Unrivaled Accessibility</div>
                            <h2
                                className="text-[40px] md:text-[50px] lg:text-[60px] font-extrabold leading-tight mb-2 text-black tracking-[-0.03em] font-inter mt-4">
                                Korea's Central Station<br />and Mega Transport Hub
                            </h2>
                            <div className="mb-4 mt-6">
                                <h3 className="text-[18px] md:text-[22px] font-bold text-[#3B7062] tracking-[-0.02em] leading-snug"
                                    data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><span class='text-black font-bold'>국가중앙역 + 광역교통 중심지의 독보적 접근성 제공</span></span>"
                                    data-en="The Nation's Ultimate Transit Hub - Unmatched, Unrivaled">
                                    The Nation's Ultimate Transit Hub - Unmatched, Unrivaled
                                </h3>
                            </div>
                            <div
                                className="text-[17px] md:text-[19px] font-medium text-black leading-[1.57] tracking-[-0.02em] space-y-4 mb-8">
                                <p className="kr-target-text transition-all duration-300"
                                    data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>서울역은 총 11개 노선을 보유한 명실상부한 교통의 중심지로 인근에 위치한 용산역과 함께 우수한 광역 교통 인프라를 형성합니다.<br />또한, <span class='text-black font-bold'>GTX-A/B, 신분당선 개발</span>로 수도권 동남부 권역(강남-분당-판교 인근)으로부터 30분 내 접근이 가능하며<br />인천공항, 김포공항 까지 직접 연결되어 글로벌 혁신기업을 위한 <span class='text-black font-bold'>최적의 입지 조건</span>을 갖추고 있습니다.</span>"
                                    data-en="Seoul Station is Korea's foremost transportation hub, directly connected to 11 transit lines, including KTX, airport rail, and multiple metro routes. Together with nearby Yongsan Station, it forms an exceptional multimodal infrastructure at the center of the capital. With the addition of GTX-A/B and the Shinbundang Line, the site offers 30-minute access to key southeastern districts such as Gangnam, Bundang, and Pangyo. It also enables direct connections to both Incheon and Gimpo International Airports, making it an ideal location for global innovation-driven enterprises.">
                                    서울역은 총 11개 노선을 보유한 명실상부한 교통의 중심지로 인근에 위치한 용산역과 함께 우수한 광역 교통 인프라를 형성합니다.<br />
                                    또한, <span class='text-black font-extrabold'>GTX-A/B, 신분당선 개발</span>로 수도권 동남부 권역(강남-분당-판교 인근)으로부터 30분 내 접근이 가능하며<br />
                                    인천공항, 김포공항 까지 직접 연결되어 글로벌 혁신기업을 위한 <span class='text-black font-extrabold'>최적의 입지 조건</span>을 갖추고 있습니다.
                                </p>
                            </div>
                            <div className="w-full max-w-[350px] flex flex-col gap-2 mt-2">
                                <img src="./img/airport.webp" width="1240" height="492" alt="Airports" className="w-full h-auto object-contain" />
                                <div className="w-full flex gap-4">
                                    <div className="w-1/2 text-[12px] md:text-[14px] text-black font-medium tracking-tight">
                                        approx. 43 minutes.</div>
                                    <div className="w-1/2 text-[12px] md:text-[14px] text-black font-medium tracking-tight">
                                        approx. 22 minutes.</div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* RIGHT BACKGROUND MAPS */}
                    <div
                        className="absolute top-0 right-0 w-full h-[40vh] lg:h-full z-10 lg:block pointer-events-none bs-slide-left delay-300 overflow-hidden">
                        <img src="./img/sybd3.webp" width="2500" height="2299" alt="SYBD Map 3" id="sybd-img-3"
                            className="absolute top-0 right-0 w-full lg:w-[1400px] lg:max-w-none h-full object-cover object-[center_center] lg:object-[left_center] transition-opacity duration-1000 ease-in-out" />
                        <img src="./img/sybd4.webp" width="2500" height="1974" alt="SYBD Map 4" id="sybd-img-4"
                            className="absolute top-0 right-0 w-full lg:w-[1400px] lg:max-w-none h-full object-cover object-[center_center] lg:object-[left_center] opacity-0 transition-opacity duration-1000 ease-in-out" />
                    </div>

                </div>

                {/* SCROLL TRIGGER: Placed exactly at 100vh down */}
                <div id="sybd-trigger" className="absolute top-[100vh] w-full h-[10px] pointer-events-none bg-transparent">
                </div>
            </div>

            {/* --- MOBILE VIEW (below lg) --- */}
            <div className="block lg:hidden w-full flex flex-col bg-white">

                {/* STEP 1: SYBD Text & Image */}
                <div className="w-full flex flex-col pt-16 px-6 md:px-12 bs-fade-up">
                    <div className="font-bold text-[18px] text-gray-800 mb-2 font-inter tracking-tight">
                        New Economy Cluster</div>
                    <h2 className="text-[32px] md:text-[45px] font-extrabold leading-none mb-6 text-black tracking-[-0.03em] font-inter">
                        SYBD <span className="text-[11px] md:text-[13px] font-normal text-gray-500 align-middle tracking-[-0.03em]">*Seoul Yongsan Business District</span>
                    </h2>
                    <div className="mb-4">
                        <h3 className="text-[18px] md:text-[20px] font-bold text-[#3B7062] tracking-[-0.02em]"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><span class='text-black font-bold'>글로벌 인재, 혁신 기업을 위한 새로운 업무 지구로의 부상</span></span>"
                            data-en="Becoming the New Business District for Global Talent and Innovative Companies">
                            <span class='text-black font-extrabold'>글로벌 인재, 혁신 기업을 위한 새로운 업무 지구로의 부상</span>
                        </h3>
                        <div className="text-[15px] md:text-[16px] text-black mt-[10px] font-inter font-bold tracking-tight">
                            Seoul's Next Global Business Hub</div>
                    </div>
                    <div className="text-[17px] md:text-[19px] text-black leading-[1.57] tracking-[-0.02em] mb-8 font-normal kr-target-text">
                        <p className="kr-target-text transition-all duration-300"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>서울역과 용산역을 잇는 교통의 결절지인 SYBD는 뉴욕의 그랜드 센트럴에서 허드슨 야드를 아우르는 글로벌 업무지구와 같이 서울의 차기 글로벌 비즈니스 허브로 도약할 것입니다.</span>"
                            data-en="Connecting Seoul Station and Yongsan Station, SYBD (Seoul Yongsan Business District) is becoming the most desired retail and office locations within the city. Just as Hudson Yards extends from Grand Central Terminal in New York to form a world-class business cluster, SYBD is poised to become Seoul's next-generation global business hub, seamlessly integrating transit, commerce, and innovation.">
                            서울역과 용산역을 잇는 교통의 결절지인 SYBD는 뉴욕의 그랜드 센트럴에서 허드슨 야드를 아우르는 글로벌 업무지구와 같이 서울의 차기 글로벌 비즈니스
                            허브로 도약할 것입니다.
                        </p>
                    </div>

                    {/* Chart Comparison - Simplified for Mobile */}
                    <div className="w-full h-[240px] flex font-inter text-[11px] font-medium text-black tracking-tight justify-between items-stretch gap-4 mb-8">
                        {/* Manhattan */}
                        <div className="w-[48%] flex flex-col items-center h-full">
                            <div className="mb-3 text-[14px]">Manhattan</div>
                            <div className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal">
                                Grand Central</div>
                            <div className="w-px bg-black relative flex-[2] min-h-[40px] my-1">
                                <div
                                    className="absolute -top-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-black animate-arrow-top">
                                </div>
                                <div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 whitespace-nowrap text-center leading-[1.57] isolate before:absolute before:inset-0 before:bg-white before:opacity-80 before:-z-10 rounded">
                                    3km<br /><span className="font-normal text-[10px]">(10,000 feet)</span>
                                </div>
                            </div>
                            <div className="bg-[#3A4A41] text-white px-2 py-2 w-full text-center tracking-normal">
                                Penn Station</div>
                            <div className="w-px bg-black relative flex-[1] min-h-[20px] my-1">
                                <div
                                    className="absolute -bottom-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black animate-arrow-bottom">
                                </div>
                            </div>
                            <div
                                className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal mt-auto shrink-0">
                                Hudson Yards</div>
                        </div>
                        {/* Seoul */}
                        <div className="w-[48%] flex flex-col items-center h-full">
                            <div className="mb-3 text-[14px]">Seoul</div>
                            <div className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal">
                                Seoul Station</div>
                            <div className="w-px bg-black relative flex-[3] min-h-[80px] my-1">
                                <div
                                    className="absolute -top-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-black animate-arrow-top">
                                </div>
                                <div
                                    className="absolute -bottom-[1px] left-1/2 -ml-[4px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-black animate-arrow-bottom">
                                </div>
                                <div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 whitespace-nowrap text-center leading-[1.57] isolate before:absolute before:inset-0 before:bg-white before:opacity-80 before:-z-10 rounded">
                                    2.7km<br /><span className="font-normal text-[10px]">(9,000 feet)</span>
                                </div>
                            </div>
                            <div
                                className="bg-[#2B3531] text-white px-2 py-2 w-full text-center tracking-normal mt-auto shrink-0">
                                Yongsan Station</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Step 1 Image */}
                <div className="w-full relative h-[60vh] md:h-[70vh]">
                    <img src="./img/sybd3.webp" width="2500" height="2299" alt="SYBD Map 3" className="w-full h-full object-cover object-[center_center]" />
                </div>

                {/* STEP 2: Korea's Central Station Text & Image */}
                <div className="w-full flex flex-col pt-16 px-6 md:px-12 bs-fade-up">
                    <div className="font-bold text-[18px] md:text-[22px] text-gray-800 mb-2 font-inter tracking-tight"
                        data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>Unrivaled Accessibility</span>" data-en="Unrivaled Accessibility">
                        Unrivaled Accessibility</div>
                    <h2 className="text-[32px] md:text-[45px] font-extrabold leading-tight mb-4 text-black tracking-[-0.03em] font-inter">
                        Korea's Central Station<br />and Mega Transport Hub
                    </h2>
                    <div className="mb-4">
                        <h3 className="text-[18px] md:text-[20px] font-bold text-[#3B7062] tracking-[-0.02em] leading-snug"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'><span class='text-black font-bold'>국가중앙역 + 광역교통 중심지의 독보적 접근성 제공</span></span>"
                            data-en="The Nation's Ultimate Transit Hub - Unmatched, Unrivaled">
                            The Nation's Ultimate Transit Hub - Unmatched, Unrivaled
                        </h3>
                    </div>
                    <div className="text-[17px] md:text-[19px] font-medium text-black leading-[1.57] tracking-[-0.02em] mb-6">
                        <p className="kr-target-text transition-all duration-300"
                            data-kr="<span class='font-semibold tracking-[-0.01em] text-[#7b7b7d]'>서울역은 총 11개 노선을 보유한 명실상부한 교통의 중심지로 인근에 위치한 용산역과 함께 우수한 광역 교통 인프라를 형성합니다.<br />또한, <span class='text-black font-bold'>GTX-A/B, 신분당선 개발</span>로 수도권 동남부 권역(강남-분당-판교 인근)으로부터 30분 내 접근이 가능하며<br />인천공항, 김포공항 까지 직접 연결되어 글로벌 혁신기업을 위한 <span class='text-black font-bold'>최적의 입지 조건</span>을 갖추고 있습니다.</span>"
                            data-en="Seoul Station is Korea's foremost transportation hub, directly connected to 11 transit lines, including KTX, airport rail, and multiple metro routes. Together with nearby Yongsan Station, it forms an exceptional multimodal infrastructure at the center of the capital. With the addition of GTX-A/B and the Shinbundang Line, the site offers 30-minute access to key southeastern districts such as Gangnam, Bundang, and Pangyo. It also enables direct connections to both Incheon and Gimpo International Airports, making it an ideal location for global innovation-driven enterprises.">
                            서울역은 총 11개 노선을 보유한 명실상부한 교통의 중심지로 인근에 위치한 용산역과 함께 우수한 광역 교통 인프라를 형성합니다.<br />
                            또한, <span class='text-black font-extrabold'>GTX-A/B, 신분당선 개발</span>로 수도권 동남부 권역(강남-분당-판교 인근)으로부터 30분 내 접근이 가능하며<br />
                            인천공항, 김포공항 까지 직접 연결되어 글로벌 혁신기업을 위한 <span class='text-black font-extrabold'>최적의 입지 조건</span>을 갖추고 있습니다.
                        </p>
                    </div>
                    <div className="w-full max-w-[300px] flex flex-col gap-2 mb-8">
                        <img src="./img/airport.webp" width="1240" height="492" alt="Airports" className="w-full h-auto object-contain" />
                        <div className="w-full flex gap-4">
                            <div className="w-1/2 text-[12px] text-black font-medium tracking-tight">approx. 43 minutes.</div>
                            <div className="w-1/2 text-[12px] text-black font-medium tracking-tight">approx. 22 minutes.</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Step 2 Image */}
                <div className="w-full relative h-[60vh] md:h-[70vh]">
                    <img src="./img/sybd4.webp" width="2500" height="1974" alt="SYBD Map 4" className="w-full h-full object-cover object-[center_center]" />
                </div>

            </div>
        </section>
    );
}
