import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Change 1: Outer Wrapper
content = content.replace(
    '<div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] pl-[60px] pr-[60px] font-sans text-white text-left">',
    '<div className="w-[1290px] mx-auto flex-1 flex flex-col pt-[48px] pb-[200px] box-border select-text text-white bg-transparent text-left">'
)

# Change 2: Header Legend Repositioning
header_old = """            {/* Header */}
            <div className="w-full flex justify-between items-end mb-[16px]">
                <div className="flex flex-col text-left">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">마일스톤</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Legend info */}
                    <div className="flex items-center gap-4 text-[12px] font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                            <span className="text-[#E5E5E5]">수행 진행 기간</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#F59E0B] font-mono text-[16px] leading-none">◆</span>
                            <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                        </div>
                    </div>


                </div>
            </div>"""

header_new = """            {/* Header */}
            <div className="w-full flex flex-col items-start mb-[16px]">
                <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">마일스톤</h1>
                <div className="flex items-center gap-[24px]">
                    <p className="text-[16px] text-[#86868B] leading-[26px]">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                    {/* Legend info */}
                    <div className="flex items-center gap-4 text-[12px] font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                            <span className="text-[#E5E5E5]">수행 진행 기간</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#F59E0B] font-mono text-[16px] leading-none">◆</span>
                            <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                        </div>
                    </div>
                </div>
            </div>"""

content = content.replace(header_old, header_new)

# Change 3: Grid Container & Table Header
grid_old = """            {/* Timeline Matrix Grid */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[32px] overflow-visible relative">
                
                {/* Speech Bubbles Overlay (Rendered OUTSIDE scroll container to prevent clipping, synced with onScroll) */}
                <div className="absolute top-[-64px] left-0 w-[calc(100%-800px)] h-[36px] pointer-events-none z-50 overflow-visible">
                    {/* PF 1차 */}
                    {(() => {
                        const x = 872.5 - scrollLeft;
                        const opacity = x < 480 ? Math.max(0, Math.min(1, (x - 420) / 60)) : 1;
                        if (opacity <= 0) return null;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity }} 
                                className="absolute -translate-x-1/2 top-[10px] bg-[#ff9f0a] text-[#1c1c1e] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[58px] h-[44px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>PF 달성</div>
                                <div>1차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#ff9f0a]"></div>
                            </div>
                        );
                    })()}
                    
                    {/* PF 2차 */}
                    {(() => {
                        const x = 947.5 - scrollLeft;
                        const opacity = x < 580 ? Math.max(0, Math.min(1, (x - 520) / 60)) : 1;
                        if (opacity <= 0) return null;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity }} 
                                className="absolute -translate-x-1/2 top-0 bg-[#2c2c2e] text-white border border-[#3c3c3c] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[70px] h-[54px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>1차목표</div>
                                <div>미달성시</div>
                                <div>2차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#2c2c2e]"></div>
                                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#3c3c3c] z-[-1]"></div>
                            </div>
                        );
                    })()}
                </div>

                
                {/* Right Edge Shadow Indicator */}
                <div className="absolute top-0 right-0 h-full w-[60px] bg-gradient-to-l from-[#272726] to-transparent pointer-events-none z-40 transition-opacity duration-300" style={{ opacity: scrollLeft > 100 ? 0 : 1 }}></div>

                <div 
                    ref={sliderRef}
                    className={`w-full overflow-x-auto overflow-y-hidden pr-0 timeline-scrollbar rounded-l-[32px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onScroll={(e) => setScrollLeft(e.target.scrollLeft)}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    <div className="flex items-center min-w-[2000px] overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1210px] min-w-[1210px] max-w-[1210px] pointer-events-auto">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="px-1 w-[80px] text-center sticky left-0 bg-[#272726] z-30 rounded-tl-[31px]">구분</th>
                                    <th className="pl-3 w-[210px] sticky left-[80px] bg-[#272726] z-30">세부업무</th>
                                    <th className="px-1 w-[90px] text-center sticky left-[290px] bg-[#272726] z-30">주관</th>
                                    <th className="px-1 w-[80px] text-center sticky left-[380px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {"""

grid_new = """            {/* Timeline Matrix Grid */}
            <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative">
                
                {/* Speech Bubbles Overlay */}
                <div className="absolute top-[-64px] left-0 w-full h-[36px] pointer-events-none z-50 overflow-visible">
                    {/* PF 1차 */}
                    {(() => {
                        const x = 952.5;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity: 1 }} 
                                className="absolute -translate-x-1/2 top-[10px] bg-[#ff9f0a] text-[#1c1c1e] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[58px] h-[44px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>PF 달성</div>
                                <div>1차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#ff9f0a]"></div>
                            </div>
                        );
                    })()}
                    
                    {/* PF 2차 */}
                    {(() => {
                        const x = 1027.5;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity: 1 }} 
                                className="absolute -translate-x-1/2 top-0 bg-[#2c2c2e] text-white border border-[#3c3c3c] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[70px] h-[54px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>1차목표</div>
                                <div>미달성시</div>
                                <div>2차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#2c2c2e]"></div>
                                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#3c3c3c] z-[-1]"></div>
                            </div>
                        );
                    })()}
                </div>

                <div className="w-full rounded-[32px] select-none">
                    <div className="flex items-center w-full overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1290px] min-w-[1290px] max-w-[1290px] pointer-events-auto">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="px-1 w-[80px] text-center bg-[#272726] rounded-tl-[31px]">구분</th>
                                    <th className="pl-3 w-[290px] bg-[#272726]">세부업무</th>
                                    <th className="px-1 w-[90px] text-center bg-[#272726]">주관</th>
                                    <th className="px-1 w-[80px] text-center bg-[#272726] border-r border-[#3c3c3c]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {"""

content = content.replace(grid_old, grid_new)

# Change 4: Remove sticky from tbody
td_old = """                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-14 group">
                                            {/* 구분 */}
                                            <td className={`px-1 sticky left-0 bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center w-[80px] min-w-[80px] max-w-[80px] ${
                                                isLastRow ? 'rounded-bl-[31px]' : ''
                                            }`}>
                                                <span className={`px-1.5 py-1 rounded-md font-bold block ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {renderCategoryName(item.name)}
                                                </span>
                                            </td>
                                            {/* 세부업무 */}
                                            <td className="pl-3 sticky left-[80px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 font-bold text-white leading-snug w-[210px] min-w-[210px] max-w-[210px] pr-2">
                                                {item.desc}
                                            </td>
                                            {/* 주관 */}
                                            <td className="px-1 sticky left-[290px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center w-[90px] min-w-[90px] max-w-[90px]">
                                                <span className="bg-[#3c3c3c] px-2 py-1 rounded text-[11px] font-bold text-white">
                                                    {item.lead}
                                                </span>
                                            </td>
                                            {/* 협업 */}
                                            <td className="px-1 sticky left-[380px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] w-[80px] min-w-[80px] max-w-[80px]">
                                                {item.coop !== '-' && ("""

td_new = """                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-14 group">
                                            {/* 구분 */}
                                            <td className={`px-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center w-[80px] min-w-[80px] max-w-[80px] ${
                                                isLastRow ? 'rounded-bl-[31px]' : ''
                                            }`}>
                                                <span className={`px-1.5 py-1 rounded-md font-bold block ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {renderCategoryName(item.name)}
                                                </span>
                                            </td>
                                            {/* 세부업무 */}
                                            <td className="pl-3 bg-[#272726] group-hover:bg-[#333] transition-colors font-bold text-white leading-snug w-[290px] min-w-[290px] max-w-[290px] pr-2">
                                                {item.desc}
                                            </td>
                                            {/* 주관 */}
                                            <td className="px-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center w-[90px] min-w-[90px] max-w-[90px]">
                                                <span className="bg-[#3c3c3c] px-2 py-1 rounded text-[11px] font-bold text-white">
                                                    {item.lead}
                                                </span>
                                            </td>
                                            {/* 협업 */}
                                            <td className="px-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center border-r border-[#3c3c3c] w-[80px] min-w-[80px] max-w-[80px]">
                                                {item.coop !== '-' && ("""

content = content.replace(td_old, td_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement successful!")
