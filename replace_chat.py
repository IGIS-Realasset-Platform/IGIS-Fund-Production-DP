import sys

replacements = {
    '"mb-6 space-y-2 bg-white dark:bg-transparent p-5 dark:p-0 rounded-2xl border border-black/10 dark:border-none shadow-sm dark:shadow-none transition-colors duration-300"': '"mb-6 space-y-2 bg-transparent p-0 rounded-2xl border-none shadow-none"',
    '"mb-2 text-[#86868B] dark:text-[#A1A1AA] font-semibold transition-colors duration-300"': '"mb-2 text-[#A1A1AA] font-semibold"',
    '"mb-8 text-[#555] dark:text-[#888888] whitespace-pre-wrap leading-relaxed transition-colors duration-300"': '"mb-8 text-[#888888] whitespace-pre-wrap leading-relaxed"',
    '"font-semibold text-[#111] dark:text-white transition-colors duration-300"': '"font-semibold text-white"',
    '`flex-1 flex flex-col h-full bg-[#fbfbfd] dark:bg-[#1F1F1E] relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mounted ? \'opacity-100 translate-y-0\' : \'opacity-0 translate-y-8\'}`': '`flex-1 flex flex-col h-full bg-[#1F1F1E] relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${mounted ? \'opacity-100 translate-y-0\' : \'opacity-0 translate-y-8\'}`',
    '"bg-[#111] dark:bg-[#0A0A0A] border-none rounded-[16px] rounded-tr-[4px] px-6 py-5 max-w-[85%] text-[16px] leading-[1.6] text-[#E5E5E5] shadow-sm transition-colors duration-300"': '"bg-[#0A0A0A] border-none rounded-[16px] rounded-tr-[4px] px-6 py-5 max-w-[85%] text-[16px] leading-[1.6] text-[#E5E5E5] shadow-sm"',
    '"font-normal text-white md:text-[#F4F4F5] dark:text-[#c3c2b7] transition-colors duration-300"': '"font-normal text-[#c3c2b7]"',
    '"flex flex-col text-[16px] leading-[1.8] text-[#333] dark:text-[#c3c2b7] font-normal break-keep tracking-tight w-full pr-12 min-h-[400px] transition-colors duration-300"': '"flex flex-col text-[16px] leading-[1.8] text-[#c3c2b7] font-normal break-keep tracking-tight w-full pr-12 min-h-[400px]"',
    '"inline-block w-2.5 h-4 ml-1 bg-[#111] dark:bg-[#A1A1AA] animate-pulse relative top-0.5 transition-colors duration-300"': '"inline-block w-2.5 h-4 ml-1 bg-[#A1A1AA] animate-pulse relative top-0.5"',
    '`px-6 py-4 text-[#111] dark:text-[#c3c2b7] border hover:bg-gray-50 dark:hover:bg-[#333] hover:text-[#111] dark:hover:text-white text-[14px] font-medium rounded-2xl transition-all whitespace-nowrap outline-none cursor-pointer shadow-sm ${buttonActive ? \'bg-gray-100 dark:bg-[#333] scale-95 border-gray-300 dark:border-white/20\' : \'bg-white dark:bg-[#262626] border-black/10 dark:border-[#3A3A3A]\'}`': '`px-6 py-4 text-[#c3c2b7] border hover:bg-[#333] hover:text-white text-[14px] font-medium rounded-2xl transition-all whitespace-nowrap outline-none cursor-pointer shadow-sm ${buttonActive ? \'bg-[#333] scale-95 border-white/20\' : \'bg-[#262626] border-[#3A3A3A]\'}`',
    '"px-6 py-4 bg-white dark:bg-[#262626] text-[#111] dark:text-[#c3c2b7] border border-black/10 dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#333] hover:text-[#111] dark:hover:text-white text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap outline-none cursor-pointer shadow-sm"': '"px-6 py-4 bg-[#262626] text-[#c3c2b7] border border-[#3A3A3A] hover:bg-[#333] hover:text-white text-[14px] font-medium rounded-2xl whitespace-nowrap outline-none cursor-pointer shadow-sm"',
    '"absolute bottom-0 w-full flex justify-center pb-8 bg-gradient-to-t from-[#fbfbfd] via-[#fbfbfd] dark:from-[#1F1F1E] dark:via-[#1F1F1E] to-transparent pt-12 pointer-events-none transition-colors duration-300"': '"absolute bottom-0 w-full flex justify-center pb-8 bg-gradient-to-t from-[#1F1F1E] via-[#1F1F1E] to-transparent pt-12 pointer-events-none"',
    '"w-full max-w-[850px] h-[120px] bg-white dark:bg-[#2C2C2A] rounded-[24px] flex flex-col relative px-5 pt-5 pb-4 border border-black/10 dark:border-[#3A3A3A] shadow-2xl pointer-events-auto transition-colors duration-300"': '"w-full max-w-[850px] h-[120px] bg-[#2C2C2A] rounded-[24px] flex flex-col relative px-5 pt-5 pb-4 border border-[#3A3A3A] shadow-2xl pointer-events-auto"',
    '"w-full bg-transparent text-[16px] text-[#111] dark:text-[#E5E5E5] focus:outline-none placeholder-gray-400 dark:placeholder-[#737373] font-normal resize-none h-[50px] ml-1 transition-colors duration-300"': '"w-full bg-transparent text-[16px] text-[#E5E5E5] focus:outline-none placeholder-[#737373] font-normal resize-none h-[50px] ml-1"',
    '"text-gray-400 dark:text-[#737373] hover:text-[#111] dark:hover:text-[#E5E5E5] p-1 flex items-center justify-center transition-colors cursor-pointer"': '"text-[#737373] hover:text-[#E5E5E5] p-1 flex items-center justify-center cursor-pointer"',
    '"w-[36px] h-[36px] rounded-full bg-[#111] dark:bg-[#5E5E5B] hover:bg-[#333] dark:hover:bg-[#72726D] flex items-center justify-center transition-colors shadow-sm outline-none cursor-pointer"': '"w-[36px] h-[36px] rounded-full bg-[#5E5E5B] hover:bg-[#72726D] flex items-center justify-center shadow-sm outline-none cursor-pointer"',
    '"absolute bottom-2 text-[#86868B] dark:text-[#737373] text-[11px] font-normal w-full text-center tracking-tight transition-colors duration-300"': '"absolute bottom-2 text-[#737373] text-[11px] font-normal w-full text-center tracking-tight"'
}

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Processed {filepath} perfectly.")
