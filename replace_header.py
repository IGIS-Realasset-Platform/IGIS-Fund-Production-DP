import sys

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as f:
    content = f.read()

# I need to extract the exact middle part to replace it.
# Start: <select value={projectId}
# End: </button>\n                    </div>\n                </div>

import re
# Find the start and end of the header
start_tag = '<select value={projectId}'
end_tag = '</button>\n                    </div>\n                </div>'

if start_tag in content and end_tag in content:
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag) + len(end_tag)
    
    middle_content = content[start_idx:end_idx]
    
    # We will replace the entire Header div structure.
    # The header starts with <div className="w-full px-[20px] py-[10px] border-b border-[#333] flex items-center gap-[12px]">
    header_start_tag = '<div className="w-full px-[20px] py-[10px] border-b border-[#333] flex items-center gap-[12px]">'
    h_start_idx = content.find(header_start_tag)
    
    old_header = content[h_start_idx:end_idx]
    
    # We construct the new header
    # The inner content of the original header (except avatar) is in middle_content, except we need to split it where date picker ends.
    # Wait, the date picker and the button are also in middle_content.
    
    # Let's extract original middle controls (everything from <select> up to <div className="w-px h-[14px] bg-[#333] mx-[4px]"></div>)
    controls_end_tag = '<div className="w-px h-[14px] bg-[#333] mx-[4px]"></div>'
    c_end_idx = middle_content.find(controls_end_tag)
    if c_end_idx == -1:
        print("Could not find controls_end_tag")
        sys.exit(1)
        
    controls_content = middle_content[:c_end_idx + len(controls_end_tag)]
    
    new_header = f"""<div 
                    className={{`w-full px-[20px] py-[10px] border-b border-[#333] flex items-center gap-[12px] ${{!isExpanded ? 'cursor-pointer hover:bg-[#2a2a2a] transition-colors' : ''}}`}}
                    onClick={{() => {{
                        if (!isExpanded) setIsExpanded(true);
                    }}}}
                >
                    <div className="relative w-[40px] h-[40px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden border border-white/10">
                        <img src={{`${{import.meta.env.BASE_URL}}${{memberInfo?.staff_name || 'default'}}.webp`}} alt="User" className="w-full h-full object-cover" onError={{(e) => {{ e.target.src = `${{import.meta.env.BASE_URL}}default_avatar.svg`; }}}} />
                    </div>

                    {{!isExpanded ? (
                        <>
                            <div className="flex-1 pl-[8px]">
                                <span className="text-[#bcdbdb] font-bold text-[15px]">주요 공유사항 또는 협업 및 논의가 필요한 내용을 등록하세요.</span>
                            </div>
                            <div className="rounded-[8px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] ml-auto">
                                <button
                                    type="button"
                                    onClick={{(e) => {{ e.stopPropagation(); setIsExpanded(true); }}}}
                                    className="flex items-center px-[12px] py-[6px] rounded-[7px] text-[12px] font-bold cursor-pointer transition-colors bg-[#222] text-[#E5E5E5] hover:bg-[#333]"
                                >
                                    글작성하기
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {controls_content}
                            <div className="rounded-[8px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86]">
                                <button
                                    type="button"
                                    onClick={{(e) => {{ e.stopPropagation(); setIsExpanded(false); }}}}
                                    className="flex items-center px-[12px] py-[6px] rounded-[7px] text-[12px] font-bold cursor-pointer transition-colors bg-[#222] text-[#E5E5E5] hover:bg-[#333]"
                                >
                                    접기
                                </button>
                            </div>
                        </>
                    )}}
                </div>"""
                
    content = content.replace(old_header, new_header)
    with open(path, 'w') as f:
        f.write(content)
    print("LogWriteBox header updated.")
else:
    print("Could not find start or end tags.")

