import React, { useEffect, useState } from 'react';
import { newsData } from '../data/newsData';
import Footer from './Footer';

export default function NewsList({ onSelectArticle }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [playingVideoId, setPlayingVideoId] = useState(null);

    const videoNews = newsData.find(n => n.id === 12);
    // Remove videoNews from list for the grid
    const remainingNews = newsData.filter(n => n.id !== 12);

    // Featured ID 9
    const featuredNews = remainingNews.find(n => n.id === 9) || remainingNews[0];
    const otherNews = remainingNews.filter(n => n.id !== featuredNews.id).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    return (
        <div className="w-full bg-white min-h-screen pt-[160px] flex flex-col items-center">
            {/* Title */}
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto mb-[40px] md:mb-[60px]">
                <h1 className="text-[40px] md:text-[50px] font-sans font-normal tracking-[-0.04em] text-black">
                    News & Insights
                </h1>
            </div>

            {/* Top Video block full width */}
            {videoNews && (
                <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto mb-[80px] md:mb-[120px]">
                    <div
                        className={`w-full flex-col ${!playingVideoId || playingVideoId !== videoNews.id ? 'cursor-pointer group' : ''}`}
                        onClick={() => {
                            if (videoNews.isVideoLink && playingVideoId !== videoNews.id) {
                                setPlayingVideoId(videoNews.id);
                            }
                        }}
                    >
                        <div className="w-full aspect-[21/9] md:aspect-[21/9] lg:aspect-[21/8] bg-black relative overflow-hidden">
                            {playingVideoId === videoNews.id && videoNews.isVideoLink ? (
                                <iframe
                                    src={videoNews.videoUrl}
                                    className="w-full h-full border-none"
                                    allow="fullscreen"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <>
                                    {videoNews.image && (
                                        <img
                                            src={videoNews.image}
                                            alt={videoNews.title}
                                            className="w-full h-full object-cover object-top transition-all duration-700 ease-out brightness-100"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                                            <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[26px] border-l-white border-b-[16px] border-b-transparent translate-x-1"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Video Title - Left Aligned Below */}
                        <div className="w-full mt-4 md:mt-6">
                            <h2 className="text-[28px] md:text-[36px] text-black font-inter font-normal tracking-[-0.02em] leading-tight text-left">
                                <span className={`inline pb-[2px] bg-gradient-to-r from-black to-black bg-no-repeat [background-position:0_100%] [background-size:0%_1.5px] transition-all duration-500 ease-out ${playingVideoId !== videoNews.id ? 'group-hover:[background-size:100%_1.5px]' : ''}`}>
                                    {videoNews.title}
                                </span>
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1600px] mx-auto pb-[100px]">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-[60px] xl:gap-[80px] items-start">

                    {/* Featured Article - Left Side */}
                    {featuredNews && (
                        <div
                            className="w-full lg:w-[50%] xl:w-[55%] flex flex-col cursor-pointer group"
                            onClick={() => {
                                window.open(featuredNews.originalUrl, '_blank');
                            }}
                        >
                            <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden mb-6 relative">
                                {featuredNews.image ? (
                                    <img
                                        src={featuredNews.image}
                                        alt={featuredNews.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200"></div>
                                )}
                            </div>

                            <h3 className="text-[24px] md:text-[28px] lg:text-[32px] leading-[1.2] text-black font-inter font-normal tracking-[-0.02em] mb-3">
                                <span className="inline pb-[2px] bg-gradient-to-r from-black to-black bg-no-repeat [background-position:0_100%] [background-size:0%_1.5px] group-hover:[background-size:100%_1.5px] transition-all duration-500 ease-out">
                                    {featuredNews.title}
                                </span>
                            </h3>

                            <p className="text-[14px] md:text-[15px] text-[#333] font-inter tracking-[0.02em] font-light">
                                {featuredNews.date}
                            </p>
                        </div>
                    )}

                    {/* Other Articles Grid - Right Side */}
                    <div className="w-full lg:w-[50%] xl:w-[45%] grid grid-cols-1 md:grid-cols-2 gap-x-[30px] lg:gap-x-[40px] gap-y-[50px] lg:gap-y-[60px]">
                        {otherNews.map((news) => (
                            <div
                                key={news.id}
                                className="flex flex-col cursor-pointer group h-full"
                                onClick={() => {
                                    window.open(news.originalUrl, '_blank');
                                }}
                            >
                                <h3 className="text-[22px] md:text-[24px] pr-2 leading-[1.35] text-[#222] font-inter font-medium tracking-[-0.02em] mb-3">
                                    <span className="inline pb-[2px] bg-gradient-to-r from-black to-black bg-no-repeat [background-position:0_100%] [background-size:0%_1.5px] group-hover:[background-size:100%_1.5px] transition-all duration-500 ease-out">
                                        {news.title}
                                    </span>
                                </h3>

                                {(() => {
                                    const preview = news.content.find(item => item.type === 'subtitle')?.text
                                        || news.content.find(item => item.type === 'paragraph')?.text;
                                    if (preview) {
                                        return (
                                            <p className="text-[17px] md:text-[17px] pr-2 text-gray-500 mb-4 font-normal tracking-[-0.01em] leading-[1.54] line-clamp-2">
                                                {preview}
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}

                                <p className="text-[13px] md:text-[14px] text-[#333] font-inter tracking-[0.02em] font-light mt-0">
                                    {news.date}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <Footer className="w-full mt-auto" variant="light" />
        </div>
    );
}
