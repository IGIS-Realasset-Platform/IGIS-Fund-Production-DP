import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section16({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isActive) {
            const t1 = setTimeout(() => setStep(1), 300);
            const t2 = setTimeout(() => setStep(2), 1100);
            const t3 = setTimeout(() => setStep(3), 1900);
            const t4 = setTimeout(() => setStep(4), 2800);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
        } else {
            setStep(0);
        }
    }, [isActive]);

    // 10 Value chains list
    const vcNodes = ['소싱', '투자', '펀드생성', '개발추진', '파이낸싱', '유저솔루션', '기업마케팅', '개발관리', '준공', '운영'];

    return (
        <section className="relative w-full h-full bg-[#fbfbfd] flex flex-col justify-center items-center overflow-hidden">
            
            <style>
                {`
                    @keyframes redPulseAlert {
                        0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.5); transform: scale(1); }
                        70% { box-shadow: 0 0 0 15px rgba(255, 59, 48, 0); transform: scale(1.1); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); transform: scale(1); }
                    }
                `}
            </style>

            <div className="w-full max-w-[1500px] px-6 lg:px-14 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center h-full pt-[60px] md:pt-0">
                
                {/* LEFT: Dry, authoritative text (Matched to User Image exactly) */}
                <div className={`w-full max-w-[600px] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                    
                    <span className="text-black font-bold text-[14px] md:text-[15px] tracking-tight mb-3 block">
                        Delegation of Authority
                    </span>

                    <h2 className="text-[40px] md:text-[50px] lg:text-[56px] font-bold leading-[1.2] text-black tracking-tight mb-8 md:mb-12">
                        {lang === 'kr' ? (
                            <>
                                DA : 데이터 기반의<br/>
                                권한 위임
                            </>
                        ) : (
                            <>
                                DA : Data-Driven<br/>
                                Delegation
                            </>
                        )}
                    </h2>

                    <div className={`flex flex-col gap-6 md:gap-7 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <p className="text-[17px] md:text-[20px] font-bold text-black leading-[1.5] break-keep">
                            {lang === 'kr' ? (
                                <>거버넌스가 세팅된 플랫폼은 마이크로 매니징을<br/>요구하지 않습니다.</>
                            ) : (
                                <>A platform with established governance does not require micro-management.</>
                            )}
                        </p>
                        <p className="text-[15px] md:text-[17px] font-medium text-[#86868b] leading-[1.6] break-keep">
                            {lang === 'kr' ? (
                                <>IFPDP는 실시간 데이터 취합을 통해 정상 범위의 공정은 자율 작동시키고,<br/>리스크 한도를 이탈한 프로젝트(Red Flag)와 최종 의사결정(Approval) 안건만을<br/>대표님께 보고합니다.</>
                            ) : (
                                <>Through real-time data aggregation, IFPDP autonomously operates normal processes, reporting only out-of-bounds projects (Red Flags) and final decisions to the executive.</>
                            )}
                        </p>
                        <p className="text-[17px] md:text-[20px] font-bold text-black leading-[1.5] break-keep">
                            {lang === 'kr' ? (
                                <>이를 통해 경영진의 리소스를 '과정의 통제'가 아닌 '전략적 결단'에<br/>집중시킵니다.</>
                            ) : (
                                <>This focuses executive resources on 'strategic decisions' rather than 'process control'.</>
                            )}
                        </p>
                    </div>
                </div>

                {/* RIGHT: Realistic iPad Frame containing the Dashboard */}
                <div className={`relative w-full max-w-[850px] mx-auto aspect-[4/3] bg-black rounded-[2.5rem] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[4px] border-[#d1d1d6] flex flex-col transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${step >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                    
                    {/* Tiny iPad Camera Dot */}
                    <div className="absolute top-0 inset-x-0 mx-auto w-1.5 h-1.5 bg-[#222] rounded-full mt-1.5 z-20" />

                    {/* Inner White Screen */}
                    <div className="w-full h-full bg-[#f5f5f7] rounded-[2rem] overflow-hidden relative flex flex-col">
                        
                        {/* Safari/App Top Bar */}
                        <div className="w-full h-[50px] bg-white border-b border-[#e5e5ea] flex items-center px-6 justify-between flex-shrink-0 relative z-10">
                            <span className="font-bold text-[15px] tracking-tight text-black">IFPDP Executive Dashboard</span>
                            <div className="flex gap-4 items-center">
                                <span className="text-[#86868b] text-[12px] font-semibold">Total Assets: 24 active</span>
                                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-[12px] font-bold">DA</span>
                                </div>
                            </div>
                        </div>

                        {/* App Content */}
                        <div className="p-8 h-full flex flex-col relative z-0">
                            
                            {/* Value Chain Top Banner */}
                            <div className="w-full bg-white rounded-xl shadow-sm border border-[#e5e5ea] p-5 mb-6">
                                <h3 className="text-[13px] font-bold text-[#86868b] mb-4">Value Chain Live Monitoring</h3>
                                <div className="flex justify-between items-center px-2">
                                    {vcNodes.map((node, i) => {
                                        const isRed = i === 7; // 개발관리 (Dev Mgmt) is RED
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${isRed ? 'bg-[#ff3b30]' : 'bg-[#34c759]'}`} 
                                                     style={isRed ? { animation: 'redPulseAlert 1.5s infinite' } : {}} />
                                                <span className={`text-[11px] font-bold whitespace-nowrap ${isRed ? 'text-[#ff3b30]' : 'text-[#86868b]'}`}>{node}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Connection line behind nodes */}
                                <div className="w-[90%] h-[2px] bg-[#e5e5ea] absolute top-[85px] left-1/2 -translate-x-1/2 -z-10" />
                            </div>

                            {/* Red Flag Details Card */}
                            <div className={`flex-1 bg-white rounded-xl shadow-lg border-2 border-[#ff3b30]/20 p-8 flex flex-col transition-all duration-[1000ms] delay-500 transform ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2.5 h-2.5 bg-[#ff3b30] rounded-full animate-pulse" />
                                    <span className="font-extrabold text-[16px] text-[#ff3b30] uppercase tracking-widest">Action Required</span>
                                    <span className="ml-auto text-[#86868b] text-[13px] font-medium">Ticket: DEV-38X</span>
                                </div>
                                
                                <h2 className="text-[26px] font-bold text-black leading-tight mb-3">
                                    도곡동 복합시설 개발: <br/>주요 자재비 폭등 (LTV 이탈 경고)
                                </h2>
                                <p className="text-[15px] font-medium text-[#424245] leading-[1.6] mb-auto pr-10 border-l-[3px] border-[#e5e5ea] pl-4">
                                    개발관리(Dev Mgmt) 단계에서 철근 및 시멘트 단가 30% 폭등이 감지되었습니다. 
                                    이는 기존 도급 한도를 15% 초과하는 리스크로, 실무 협의가 불가능한 단계입니다.
                                    <br/><br/>
                                    <strong>대안:</strong> 추가 예산 120억 원 집행 및 공자기한 2개월 연장안 수용 (예상 수익률 0.5% 하락 방어)
                                </p>

                                {/* Bottom Action Row */}
                                <div className="flex justify-end gap-3 mt-8">
                                    <button className="px-8 py-3 bg-[#f5f5f7] text-[#86868b] font-bold text-[14px] rounded-lg tracking-wide hover:bg-[#e5e5ea] transition-colors">
                                        REJECT (재검토)
                                    </button>
                                    <button className="px-10 py-3 bg-black text-white font-bold text-[14px] rounded-lg tracking-widest hover:bg-[#333] hover:shadow-xl transition-all">
                                        APPROVE (승인)
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
