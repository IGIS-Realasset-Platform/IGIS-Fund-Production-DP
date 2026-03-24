import React, { useState, useEffect } from 'react';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import Section5 from './Section5';

export default function MainLayout() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [<Section1 />, <Section2 />, <Section3 />, <Section4 />, <Section5 />];

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length]);

    // Touch swipe handling
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    return (
        <div 
            className="w-full h-screen overflow-hidden relative bg-white"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                
                let transformStyle = '';
                if (index < currentSlide) {
                    transformStyle = 'translateX(-100%)';
                } else if (index > currentSlide) {
                    transformStyle = 'translateX(100%)';
                } else {
                    transformStyle = 'translateX(0)';
                }

                return (
                    <div 
                        key={index} 
                        className="absolute inset-0 w-full h-full transition-transform duration-[250ms]"
                        style={{ 
                            transform: transformStyle,
                            transitionTimingFunction: "cubic-bezier(0.83, 0, 0.17, 1)" // Fast, crisp book-like slide
                        }}
                    >
                        {React.cloneElement(slide, { isActive })}
                    </div>
                );
            })}

            {/* Global Pagination & Navigation Controls */}
            <div className="fixed bottom-[32px] left-1/2 -translate-x-1/2 flex items-center gap-8 md:gap-14 z-[9999] mix-blend-difference">
                
                {/* Left Arrow Button */}
                <button 
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-white rounded-full transition-all duration-300 ${currentSlide === 0 ? 'opacity-20 cursor-default' : 'opacity-100 hover:scale-105 cursor-pointer'}`}
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white transform rotate-180" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                </button>

                {/* 5 Dots Pagination List */}
                <div className="flex items-center gap-3 md:gap-4">
                    {slides.map((_, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setCurrentSlide(idx)}
                            className="relative flex items-center justify-center w-6 h-6 cursor-pointer group"
                        >
                            {/* Inner Fixed Dot */}
                            <div className={`w-[6px] h-[6px] md:w-[8px] md:h-[8px] rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white scale-110' : 'bg-white/40 group-hover:bg-white/80'}`}></div>
                            
                            {/* Outer Expanding Ring for Active State */}
                            <div className={`absolute inset-0 border-[1.5px] border-white rounded-full transition-all duration-500 ease-out ${currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow Button */}
                <button 
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-white rounded-full transition-all duration-300 ${currentSlide === slides.length - 1 ? 'opacity-20 cursor-default' : 'opacity-100 hover:scale-105 cursor-pointer'}`}
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" strokeWidth="2.5" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                </button>

            </div>
        </div>
    );
}
