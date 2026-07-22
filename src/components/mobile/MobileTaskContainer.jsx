import React, { useState, useEffect } from 'react';
import MobilePmoTaskList from './MobilePmoTaskList';
import MobileWorkflowLogs from './MobileWorkflowLogs';
import { motion } from 'framer-motion';

export default function MobileTaskContainer({ memberInfo, defaultFilter, onResetFilter }) {
    // viewMode: 'pmo' | 'director'
    const [viewMode, setViewMode] = useState('pmo');

    // 홈에서 대시보드 클릭을 통해 defaultFilter가 들어왔을 때,
    // viewMode가 director로 되어있다면 자동으로 pmo로 전환해줍니다.
    useEffect(() => {
        if (defaultFilter) {
            setViewMode('pmo');
        }
    }, [defaultFilter]);

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-[#111111] overflow-hidden">
            {/* Header Area with Segmented Control */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-md z-10 sticky top-0 border-b border-[#3c3c3c]/50">
                <div className="px-3 py-1.5 flex items-center justify-center">
                    <div className="flex p-0.5 bg-[#2C2C2E] rounded-[12px] w-full max-w-[320px] relative shadow-inner">
                        {/* Sliding Background */}
                        <motion.div
                            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-[#3c3c3c] rounded-[10px] shadow-sm"
                            initial={false}
                            animate={{
                                x: viewMode === 'pmo' ? 0 : '100%',
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        
                        <button
                            onClick={() => setViewMode('pmo')}
                            className={`flex-1 py-1 text-[13px] font-bold rounded-[10px] relative z-10 transition-colors ${
                                viewMode === 'pmo' ? 'text-white' : 'text-[#8E8E93]'
                            }`}
                        >
                            통합업무보드
                        </button>
                        <button
                            onClick={() => setViewMode('director')}
                            className={`flex-1 py-1 text-[13px] font-bold rounded-[10px] relative z-10 transition-colors ${
                                viewMode === 'director' ? 'text-white' : 'text-[#8E8E93]'
                            }`}
                        >
                            Director 업무보고
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto w-full relative">
                {viewMode === 'pmo' ? (
                    <MobilePmoTaskList 
                        memberInfo={memberInfo} 
                        defaultFilter={defaultFilter}
                        onResetFilter={onResetFilter}
                    />
                ) : (
                    <MobileWorkflowLogs memberInfo={memberInfo} />
                )}
            </div>
        </div>
    );
}
