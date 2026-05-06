import React, { useState, useEffect } from 'react';
import SystemLeftNav from './SystemLeftNav';
import IotaLeftNav from './IotaLeftNav';
import PlatformCenter from './PlatformCenter';
import { useTheme } from '../../context/ThemeContext';

export default function PlatformCore({ isPlatform = true, isIotaWorkspaceOverride = false, currentPath = '', refreshKey = 0 }) {
    const { isLightMode, toggleTheme } = useTheme();
    const [isIotaWorkspace, setIsIotaWorkspace] = useState(isIotaWorkspaceOverride);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (refreshKey > 0) {
            setIsRefreshing(true);
            const timer = setTimeout(() => {
                setIsRefreshing(false);
            }, 100); // 100ms delay to clear fetch aborts and provide visual feedback
            return () => clearTimeout(timer);
        }
    }, [refreshKey]);

    useEffect(() => {
        if (isLightMode) toggleTheme();

        const handleLocationChange = () => {
            if (isIotaWorkspaceOverride) {
                setIsIotaWorkspace(true);
            } else {
                const params = new URLSearchParams(window.location.search);
                setIsIotaWorkspace(params.get('workspace') === 'iota');
            }
        };

        handleLocationChange();
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [isLightMode, toggleTheme, isIotaWorkspaceOverride]);

    return (
        <div className="w-full h-screen bg-[#1F1F1E] flex overflow-hidden font-sans text-[#E5E5E5] relative border-none">
            
            {/* 좌측 사이드바 스위칭 로직 */}
            {isIotaWorkspace ? <IotaLeftNav isCore={true} isPlatform={isPlatform} currentPath={currentPath} /> : <SystemLeftNav isCore={true} isPlatform={isPlatform} />}

            {/* Stage 2 Layout (상세페이지 고정) - No Right AI Panel for Platform */}
            <div className="flex-1 flex overflow-hidden">
                {/* 컨텐츠 박스 (PlatformCenter) */}
                <div className="w-full h-full overflow-hidden shrink-0 flex flex-col items-stretch opacity-100">
                    <div className="w-full h-full flex flex-col items-stretch min-w-[600px] opacity-100">
                        {isRefreshing ? (
                            <div className="w-full flex-1 flex items-center justify-center">
                                {/* Blank state for 100ms during refresh */}
                            </div>
                        ) : (
                            <PlatformCenter currentPath={currentPath} />
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
