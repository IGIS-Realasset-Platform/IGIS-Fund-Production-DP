import os

filepath = 'src/components/system/LogWriteBox.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Update handleContentChange mentionPosition calculation
old_mention_pos = """            setMentionPosition({ 
                top: coords.top + 20 + 24, 
                left: coords.left + 20     
            });"""
new_mention_pos = """            setMentionPosition({ 
                top: coords.top + 24, 
                left: coords.left     
            });"""
content = content.replace(old_mention_pos, new_mention_pos)

# 2. Update the layout wrapping
old_layout = """                <div className="w-full px-[20px] pt-[20px] pb-[24px] relative bg-transparent">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="w-full bg-transparent text-[#E5E5E5] text-[16px] font-bold outline-none mb-[12px] border-b border-[#333] pb-[12px]"
                        required
                    />
                    
                    {/* Background Div for Highlights */}
                    <div 
                        id={`highlight-bg-${workspaceCode}`}
                        className="absolute top-[20px] left-[20px] right-[20px] bottom-[24px] pointer-events-none whitespace-pre-wrap break-words text-[15px] leading-relaxed overflow-hidden font-sans"
                        aria-hidden="true"
                    >"""

new_layout = """                <div className="w-full px-[20px] pt-[20px] pb-[24px] bg-transparent">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="w-full bg-transparent text-[#E5E5E5] text-[16px] font-bold outline-none mb-[12px] border-b border-[#333] pb-[12px]"
                        required
                    />
                    
                    <div className="relative w-full">
                        {/* Background Div for Highlights */}
                        <div 
                            id={`highlight-bg-${workspaceCode}`}
                            className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-[15px] leading-relaxed overflow-hidden font-sans"
                            aria-hidden="true"
                        >"""
content = content.replace(old_layout, new_layout)

# Close the new relative wrapper div
old_end = """                            {filteredMentions.map((name, i) => (
                                <div 
                                    key={i}
                                    className="px-[12px] py-[6px] text-[#E5E5E5] text-[13px] hover:bg-[#333] cursor-pointer font-bold"
                                    onClick={() => handleMentionSelect(name)}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>"""
new_end = """                            {filteredMentions.map((name, i) => (
                                <div 
                                    key={i}
                                    className="px-[12px] py-[6px] text-[#E5E5E5] text-[13px] hover:bg-[#333] cursor-pointer font-bold"
                                    onClick={() => handleMentionSelect(name)}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>"""
content = content.replace(old_end, new_end)

with open(filepath, 'w') as f:
    f.write(content)

