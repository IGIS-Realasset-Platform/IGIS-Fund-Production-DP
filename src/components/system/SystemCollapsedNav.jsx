import React from 'react';

export default function SystemCollapsedNav() {
    return (
        <div className="w-[68px] h-full bg-[#1A1A1A] border-r border-[#2C2C2E] flex flex-col items-center py-5 shrink-0">
            <button className="w-10 h-10 rounded-lg hover:bg-[#2C2C2E] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors cursor-pointer mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="3" ry="3" strokeWidth="1.8" />
                    <line x1="8" y1="4" x2="8" y2="20" strokeWidth="1.8" />
                </svg>
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-[#2C2C2E] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    );
}
