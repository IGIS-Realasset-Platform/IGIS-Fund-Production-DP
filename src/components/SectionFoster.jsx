import React, { useState, useEffect, useRef } from 'react';

export default function SectionFoster() {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [showThumbnail, setShowThumbnail] = useState(true);
    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect(); // Only trigger once
                }
            },
            { threshold: 0.3 } // Trigger when 30% of the video is visible
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isIntersecting) return;

        const initPlayer = () => {
            if (!playerContainerRef.current) return;

            playerRef.current = new window.YT.Player(playerContainerRef.current, {
                videoId: 'vuxdaHaYbtY',
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1
                },
                events: {
                    onReady: (event) => {
                        event.target.playVideo();
                    },
                    onStateChange: (event) => {
                        // 1 = playing, 3 = buffering
                        if (event.data === 1 || event.data === 3) {
                            setShowThumbnail(false);
                        }
                        // 2 = paused, 0 = ended
                        else if (event.data === 2 || event.data === 0) {
                            setShowThumbnail(true);
                        }
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const script = document.createElement('script');
                script.src = "https://www.youtube.com/iframe_api";
                document.head.appendChild(script);
            }
            // Temporarily intercept the global callback
            const prevCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prevCallback) prevCallback();
                initPlayer();
            };
        }

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                // Safely destroy player when component unmounts
                try { playerRef.current.destroy(); } catch (e) { }
            }
        };
    }, [isIntersecting]);

    const handlePlayClick = () => {
        setShowThumbnail(false);
        if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
        }
    };

    return (
        <section className="section w-full h-auto bg-black text-white pt-[100px] md:pt-[150px] pb-[30px] md:pb-[200px] scroll-mt-[100px]" id="section-foster">
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto flex flex-col">

                {/* Titles and Descriptions in one row on lg size */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-12 bs-fade-up">
                    <div className="flex flex-col shrink-0">
                        <h2 className="text-[31px] md:text-[54px] lg:text-[67px] font-bold leading-tight font-inter tracking-[-0.03em]">
                            Build with
                        </h2>
                        <h2 className="text-[31px] md:text-[54px] lg:text-[67px] font-bold leading-tight font-inter tracking-[-0.03em] lg:ml-24">
                            Foster + Partners
                        </h2>
                    </div>

                    {/* Description Texts moved to the right with adjusted size and width */}
                    <div className="mt-8 lg:mt-0 text-[17px] md:text-[19px] font-light text-gray-300 leading-[1.57] space-y-4 lg:max-w-[676px] xl:max-w-[772px] bs-fade-up delay-200 break-keep">
                        <p className="kr-target-text transition-all duration-300"
                            data-en="Designs have been revealed for IOTA Seoul I, a mixed-use development on a landmark site between Seoul Station and Namsan, a 270-metre-high peak in Jung-Gu.<br/>Historically, the site acted as an important gateway to Seoul when arriving by train."
                            data-kr="<span class=\'font-semibold text-white font-inter\'>Designs have been revealed for IOTA Seoul I, a mixed-use development on a landmark site between Seoul Station and Namsan, a 270-metre-high peak in Jung-Gu.<br/>Historically, the site acted as an important gateway to Seoul when arriving by train.</span>">
                            Designs have been revealed for IOTA Seoul I, a mixed-use development on a landmark site between Seoul Station and Namsan, a 270-metre-high peak in Jung-Gu.<br />Historically, the site acted as an important gateway to Seoul when arriving by train.
                        </p>
                        <p className="kr-target-text transition-all duration-300"
                            data-en="The project creates a green oasis in the heart of the city – and restores the area's historic connection with Namsan and its surrounding public park."
                            data-kr="<span class=\'font-semibold text-white font-inter\'>The project creates a green oasis in the heart of the city – and restores the area's historic connection with Namsan and its surrounding public park.</span>">
                            The project creates a green oasis in the heart of the city – and restores the area's historic connection with Namsan and its surrounding public park.
                        </p>
                    </div>
                </div>

            </div>

            {/* Video Container (Full width on mobile) */}
            <div ref={videoRef} className="w-full md:w-[calc(100%-100px)] max-w-[1600px] mx-auto aspect-video relative bg-gray-900 group overflow-hidden bs-fade-up delay-400">

                {/* Always render iframe once scrolled into view to keep state */}
                {isIntersecting && (
                    <div className="w-full h-full absolute top-0 left-0">
                        {/* The YouTube API replaces this exact div */}
                        <div ref={playerContainerRef} className="w-full h-full"></div>
                    </div>
                )}

                {/* Thumbnail Overlay that appears when paused/ended */}
                <div
                    className={`absolute inset-0 bg-black cursor-pointer transition-opacity duration-300 ${showThumbnail ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'}`}
                    onClick={handlePlayClick}
                >
                    <img
                         src="./img/foster+partners.webp" width="1691" height="944"
                        alt="Foster + Partners Video"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        fetchPriority="high"
                        loading="eager"
                    />
                    <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 w-14 h-14 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-lg">
                        <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] md:border-t-[14px] md:border-b-[14px] md:border-l-[22px] border-t-transparent border-b-transparent border-l-black ml-1 md:ml-2"></div>
                    </div>
                </div>
            </div>

        </section>
    );
}
