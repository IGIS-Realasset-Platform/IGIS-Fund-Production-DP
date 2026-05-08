import re

file_path = "src/components/system/workspace/WorkspaceDigital.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Inject getThemeColor after getThemeTitle
color_logic = """    const getThemeTitle = (no) => {
        const theme = sscScopes.find(t => t.no === no);
        return theme ? `${theme.no}. ${theme.title}` : no;
    };

    const getThemeColor = (themeStr) => {
        if (!themeStr) return "bg-[#333] text-[#A1A1AA] border-[#444]";
        if (themeStr.startsWith('01')) return "bg-[#2997ff]/10 text-[#2997ff] border-[#2997ff]/20";
        if (themeStr.startsWith('02')) return "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20";
        if (themeStr.startsWith('03')) return "bg-[#f472b6]/10 text-[#f472b6] border-[#f472b6]/20";
        if (themeStr.startsWith('04')) return "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20";
        if (themeStr.startsWith('05')) return "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20";
        if (themeStr.startsWith('06')) return "bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20";
        if (themeStr.startsWith('07')) return "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20";
        return "bg-[#2997ff]/10 text-[#2997ff] border-[#2997ff]/20";
    };"""

content = content.replace("""    const getThemeTitle = (no) => {
        const theme = sscScopes.find(t => t.no === no);
        return theme ? `${theme.no}. ${theme.title}` : no;
    };""", color_logic)

# 2. Update the row rendering logic
row_render_target = """                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-bold text-[#86868B]">Task</span>
                                            {row.related_asset && (
                                                <span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">
                                                    {row.related_asset}
                                                </span>
                                            )}
                                            {row.ssc_theme && (
                                                <span className="px-2 py-[2px] bg-[#2997ff]/10 text-[#2997ff] border border-[#2997ff]/20 rounded-[4px] text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                    {row.ssc_theme.split('.')[0]} {/* Show just '01' or '02' if we want, or full text. I'll split by dot to keep it short */}
                                                </span>
                                            )}
                                        </div>"""

row_render_replacement = """                                        <div className="flex items-center gap-2">
                                            {row.related_asset && (
                                                <span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">
                                                    {row.related_asset}
                                                </span>
                                            )}
                                            {row.ssc_theme && (
                                                <span className={`px-2 py-[2px] border rounded-[4px] text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] ${getThemeColor(row.ssc_theme)}`}>
                                                    {row.ssc_theme}
                                                </span>
                                            )}
                                        </div>"""

content = content.replace(row_render_target, row_render_replacement)

with open(file_path, "w") as f:
    f.write(content)
