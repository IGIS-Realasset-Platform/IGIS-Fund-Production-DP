import React from 'react';

export default function PmoScheduleGate() {
    const gates = [
        { id: 'G0', title: 'Gate 0', desc: '소싱/딜 검토', date: '2026.04.10', status: 'completed' },
        { id: 'G1', title: 'Gate 1', desc: '토지 매입 & 금융약정', date: '2026.06.30', status: 'completed' },
        { id: 'G2', title: 'Gate 2', desc: '인허가 & 착공', date: '2026.08.15', status: 'active' },
        { id: 'G3', title: 'Gate 3', desc: '골조 완료', date: '2027.05.01', status: 'pending' },
        { id: 'G4', title: 'Gate 4', desc: '준공 & Take-out', date: '2028.02.28', status: 'pending' }
    ];

    return (
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto select-none">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[32px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">타임라인</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">사업 수지 검토부터 준공/ take-out까지의 게이트(Gate) 마일스톤 관제</p>
                </div>
            </div>

            {/* Timeline Progress Tracker */}
            <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[24px] p-12 flex items-center justify-center font-sans">
                <div className="relative w-full max-w-[900px] flex items-center justify-between">
                    {/* Background Progress Line */}
                    <div className="absolute top-[28px] left-[5%] right-[5%] h-[4px] bg-[#1F1F1E] -z-10"></div>
                    <div className="absolute top-[28px] left-[5%] w-[45%] h-[4px] bg-[#2997ff]/40 -z-10"></div>

                    {gates.map((g, i) => {
                        const isCompleted = g.status === 'completed';
                        const isActive = g.status === 'active';

                        return (
                            <div key={g.id} className="flex flex-col items-center w-[130px] text-center relative">
                                {/* Dot Indicator */}
                                <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center border-2 transition-all duration-500 font-mono text-[15px] font-extrabold ${
                                    isCompleted 
                                        ? 'bg-[#2997ff]/20 border-[#2997ff] text-white shadow-md shadow-[#2997ff]/10' 
                                        : isActive 
                                            ? 'bg-[#1F1F1E] border-[#F59E0B] text-[#F59E0B] animate-pulse shadow-md shadow-[#F59E0B]/10'
                                            : 'bg-[#1A1A1A] border-[#3c3c3c] text-[#86868B]'
                                }`}>
                                    {g.id}
                                </div>

                                {/* Label Card */}
                                <div className="mt-4">
                                    <div className={`text-[14px] font-bold ${isActive ? 'text-[#F59E0B]' : isCompleted ? 'text-white' : 'text-[#86868B]'}`}>
                                        {g.title}
                                    </div>
                                    <div className="text-[12px] text-[#A1A1AA] mt-1.5 leading-tight">
                                        {g.desc}
                                    </div>
                                    <div className="text-[11px] text-[#86868B] font-mono mt-2 font-semibold">
                                        {g.date}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
