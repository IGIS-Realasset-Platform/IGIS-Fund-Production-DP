import sys

path = 'src/components/system/workspace/WorkspaceDevelopment.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Update Filtered Content and insert the new Right Wing
old_filtered = """            {/* Filtered Content */}
            <div className="w-full flex flex-col">
                {/* PHYSICAL KPIS */}"""

new_filtered = """            {/* Filtered Content */}
            <div className="w-full flex flex-col relative">
                {/* Right Wing Absolute */}
                <div className="absolute top-0 bottom-0 -right-[200px] w-[180px]">
                    <div className="sticky top-[100px] flex flex-col gap-[8px] bg-[#262627] border border-[#3c3c3c] rounded-[24px] p-[20px]">
                        <span className="text-[11px] font-bold text-[#86868B] tracking-widest uppercase mb-[4px] pl-[4px]">PROJECT</span>
                        {[
                            { id: 'total', label: 'IOTA Seoul 통합' },
                            { id: '427', label: 'IOTA One 427' },
                            { id: '816', label: 'IOTA Two 816' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setActiveProject(btn.id)}
                                className={`cursor-pointer w-full text-left px-[16px] py-[12px] rounded-[12px] transition-colors duration-200 text-[13px] font-bold ${
                                    activeProject === btn.id 
                                    ? 'bg-[#E5F059] text-black shadow-sm' 
                                    : 'text-[#86868B] hover:text-white hover:bg-[#333]'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PHYSICAL KPIS */}"""
content = content.replace(old_filtered, new_filtered)

# 2. Delete the old Right Wing Absolute block
old_wing = """            {/* Right Wing Absolute */}
            <div className="absolute top-[100px] bottom-[100px] -right-[180px] w-[140px]">
                <div className="sticky top-[120px] flex flex-col gap-[8px]">
                    <span className="text-[11px] font-bold text-[#86868B] tracking-widest uppercase mb-[4px]">PROJECT</span>
                    {[
                        { id: 'total', label: 'IOTA Seoul 통합' },
                        { id: '427', label: 'IOTA One 427' },
                        { id: '816', label: 'IOTA Two 816' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setActiveProject(btn.id)}
                            className={`cursor-pointer w-full text-left px-[16px] py-[12px] rounded-[12px] transition-colors duration-200 text-[13px] font-bold ${
                                activeProject === btn.id 
                                ? 'bg-[#E5F059] text-black shadow-sm' 
                                : 'text-[#86868B] hover:text-white hover:bg-[#333]'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>"""

content = content.replace(old_wing, "")

with open(path, 'w') as f:
    f.write(content)

print("Wing fixed")
