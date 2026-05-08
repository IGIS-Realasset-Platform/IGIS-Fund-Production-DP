import re

file_path = "src/components/system/workspace/WorkspaceDigital.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace filteredTasks and sortedTasks
target = """    const filteredTasks = safeTasks.filter(t => !selectedTheme || (t.ssc_theme && t.ssc_theme.startsWith(selectedTheme)));
    const sortedTasks = [...filteredTasks].sort((a, b) => {"""

replacement = """    const isCoreAsset = (asset) => {
        if (!asset || typeof asset !== 'string') return false;
        const lower = asset.toLowerCase();
        return lower.includes('iota') || lower.includes('이오타') || lower.includes('427') || lower.includes('816') || lower.includes('421');
    };

    const filteredTasks = safeTasks.filter(t => 
        (!selectedTheme || (t.ssc_theme && t.ssc_theme.startsWith(selectedTheme))) &&
        (assetFilter === 'ALL' || isCoreAsset(t.related_asset))
    );
    const sortedTasks = [...filteredTasks].sort((a, b) => {"""

content = content.replace(target, replacement)

# Replace the "상품·디지털 주요 테스크 관리" header to include the asset toggle
header_target = """                <h2 className="text-[18px] font-bold text-white tracking-tight flex items-center">
                    상품·디지털 주요 테스크 관리
                    {selectedTheme && <span className="ml-3 px-2 py-1 bg-[#2997ff]/10 text-[#2997ff] rounded-[6px] text-[13px] font-bold">필터: {getThemeTitle(selectedTheme)}</span>}
                </h2>
                <div className="flex gap-2 items-center">"""

header_replacement = """                <h2 className="text-[18px] font-bold text-white tracking-tight flex items-center">
                    상품·디지털 주요 테스크 관리
                    {selectedTheme && <span className="ml-3 px-2 py-1 bg-[#2997ff]/10 text-[#2997ff] rounded-[6px] text-[13px] font-bold">필터: {getThemeTitle(selectedTheme)}</span>}
                </h2>
                <div className="flex gap-2 items-center">
                    <div className="flex bg-[#272726] border border-[#3c3c3c] rounded-[8px] overflow-hidden p-[2px]">
                        <button onClick={() => setAssetFilter('427 PFV')} className={`px-[12px] py-[4px] text-[13px] font-bold rounded-[6px] transition-colors ${assetFilter === '427 PFV' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5]'}`}>이오타서울만 보기</button>
                        <button onClick={() => setAssetFilter('ALL')} className={`px-[12px] py-[4px] text-[13px] font-bold rounded-[6px] transition-colors ${assetFilter === 'ALL' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5]'}`}>전체 자산 보기</button>
                    </div>"""

content = content.replace(header_target, header_replacement)

# Replace the related_asset select dropdown
select_target = """                            <select 
                                value={newTask.related_asset} 
                                onChange={e => setNewTask({...newTask, related_asset: e.target.value})} 
                                className="bg-[#1A1A1A] border border-[#444] rounded-[10px] px-3 py-2 text-white text-[14px] outline-none focus:border-[#888] cursor-pointer"
                            >
                                <option value="IOTA 공통">IOTA 공통</option>
                                <option value="427 PFV">427 PFV</option>
                                <option value="816 PFV">816 PFV</option>
                                <option value="421 Fund">421 Fund</option>
                            </select>"""

select_replacement = """                            <select 
                                value={newTask.related_asset} 
                                onChange={e => {
                                    if (e.target.value === '+ 자산 신규 추가') {
                                        setShowNewAssetModal(true);
                                    } else {
                                        setNewTask({...newTask, related_asset: e.target.value});
                                    }
                                }} 
                                className="bg-[#1A1A1A] border border-[#444] rounded-[10px] px-3 py-2 text-white text-[14px] outline-none focus:border-[#888] cursor-pointer"
                            >
                                <option value="IOTA 공통">✔️ IOTA 공통</option>
                                <option value="427 PFV">427 PFV</option>
                                <option value="816 PFV">816 PFV</option>
                                <option value="421 Fund">421 Fund</option>
                                <option value="타임워크 신도림">타임워크 신도림</option>
                                <option value="타임워크 분당">타임워크 분당</option>
                                <option value="현대차 새만금 DC">현대차 새만금 DC</option>
                                <option value="미정">미정</option>
                                {customAssets.map(asset => (
                                    <option key={asset} value={asset}>{asset}</option>
                                ))}
                                <option value="+ 자산 신규 추가" className="font-bold text-[#2997ff]">+ 자산 신규 추가</option>
                            </select>"""

content = content.replace(select_target, select_replacement)

# Add the New Asset Modal at the end of the file
modal_target = """        </div>
    );
}"""

modal_replacement = """            {/* New Asset Modal */}
            {showNewAssetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
                    <div className="bg-[#222] border border-[#333] rounded-[16px] w-[360px] p-[24px] shadow-2xl flex flex-col items-center">
                        <h3 className="text-[16px] font-bold text-white mb-[16px] w-full text-left">자산 신규 추가</h3>
                        <input 
                            type="text" 
                            value={newAssetName} 
                            onChange={e => setNewAssetName(e.target.value)} 
                            placeholder="추가할 자산 명칭 입력"
                            className="w-full bg-[#111] border border-[#444] rounded-[8px] px-[12px] py-[10px] text-white text-[14px] outline-none focus:border-[#2997ff] transition-colors mb-[24px]"
                            autoFocus
                        />
                        <div className="flex items-center gap-[12px] w-full">
                            <button onClick={() => { setShowNewAssetModal(false); setNewAssetName(''); }} className="flex-1 py-[10px] rounded-[8px] bg-[#333] hover:bg-[#444] text-white text-[13px] font-medium transition-colors">취소</button>
                            <button onClick={registerNewAsset} disabled={isSubmittingAsset} className="flex-1 py-[10px] rounded-[8px] bg-[#2997ff] hover:bg-[#0071e3] text-white text-[13px] font-bold transition-colors">{isSubmittingAsset ? '등록 중...' : '등록 후 선택'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}"""

content = content.replace(modal_target, modal_replacement)

with open(file_path, "w") as f:
    f.write(content)

