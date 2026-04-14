import sys

replacements = {
    '"w-[275px] h-full bg-[#FBFBFD] dark:bg-transparent border-r border-black/10 dark:border-[#2C2C2E] flex flex-col flex-shrink-0 text-[14px] font-sans text-[#1D1D1F] dark:text-white transition-colors duration-300"': '"w-[275px] h-full bg-transparent border-r border-[#2C2C2E] flex flex-col flex-shrink-0 text-[14px] font-sans text-white"',
    '"font-bold text-[20px] tracking-wide font-inter ml-[5px] text-[#1D1D1F] dark:text-white transition-colors duration-300"': '"font-bold text-[20px] tracking-wide font-inter ml-[5px] text-white"',
    '"text-[#86868B] dark:text-[#c3c2b7] hover:text-[#1D1D1F] dark:hover:text-white pb-1 transition-colors group cursor-pointer mt-[4px]"': '"text-[#c3c2b7] hover:text-white pb-1 group cursor-pointer mt-[4px]"',
    '"flex items-center px-2.5 py-2 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] rounded-md cursor-pointer transition-colors duration-300"': '"flex items-center px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer"',
    '"flex items-center justify-between px-2.5 py-2 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5 transition-colors duration-300"': '"flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5"',
    '"flex items-center justify-between px-2.5 py-2 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-1.5 transition-colors duration-300"': '"flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-1.5"',
    '"flex items-center justify-between px-2.5 py-2 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] rounded-md cursor-pointer transition-colors duration-300"': '"flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer"',
    '"flex items-center justify-between px-2.5 py-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-md cursor-pointer transition-colors duration-300"': '"flex items-center justify-between px-2.5 py-2 bg-[#2A2A2A] rounded-md cursor-pointer"',
    '"flex flex-col mt-1 px-2.5 font-normal pl-[42px] gap-3 mt-3 pb-1 text-[#555] dark:text-[#E5E5E5] transition-colors duration-300"': '"flex flex-col mt-1 px-2.5 font-normal pl-[42px] gap-3 mt-3 pb-1 text-[#E5E5E5]"',
    '"hover:text-[#111] dark:hover:text-white cursor-pointer text-[14px]"': '"hover:text-white cursor-pointer text-[14px]"',
    '"font-semibold mb-2 text-[12px] text-[#86868B] dark:text-[#A1A1AA] transition-colors duration-300"': '"font-semibold mb-2 text-[12px] text-[#A1A1AA]"',
    '"flex flex-col gap-2.5 mt-4 text-[#888] dark:text-[#737373] transition-colors duration-300"': '"flex flex-col gap-2.5 mt-4 text-[#737373]"',
    '"font-medium text-[13px] hover:text-[#111] dark:hover:text-[#E5E5E5] cursor-pointer truncate transition-colors duration-200"': '"font-medium text-[13px] hover:text-[#E5E5E5] cursor-pointer truncate"',
    '"px-[15px] py-3 border-t border-black/10 dark:border-[#3A3A3C] w-full pb-4 flex items-center justify-between transition-colors duration-300"': '"px-[15px] py-3 border-t border-[#3A3A3C] w-full pb-4 flex items-center justify-between"',
    '"flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-[#2C2C2E] p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors duration-300"': '"flex items-center gap-3 hover:bg-[#2C2C2E] p-1.5 -ml-1.5 rounded-lg cursor-pointer"',
    '"w-10 h-10 rounded-full bg-[#E5E5EA] dark:bg-[#c3c2b7] text-[#111] dark:text-[#1F1F1E] flex items-center justify-center text-[16px] font-bold tracking-tighter -ml-[2px] transition-colors duration-300"': '"w-10 h-10 rounded-full bg-[#c3c2b7] text-[#1F1F1E] flex items-center justify-center text-[16px] font-bold tracking-tighter -ml-[2px]"',
    '"font-normal text-[14px] leading-tight mb-0.5 text-[#1D1D1F] dark:text-white transition-colors duration-300"': '"font-normal text-[14px] leading-tight mb-0.5 text-white"',
    '"text-[#86868B] dark:text-gray-400 text-[12px] leading-none font-normal transition-colors duration-300"': '"text-gray-400 text-[12px] leading-none font-normal"',
    '`w-[42px] h-[24px] rounded-full relative transition-colors duration-300 ${isLightMode ? \'bg-[#c3c2b7]\' : \'bg-[#3A3A3C]\'} border border-black/10 dark:border-[#4A4A4C]`': '`w-[42px] h-[24px] rounded-full relative transition-colors duration-300 ${isLightMode ? \'bg-[#c3c2b7]\' : \'bg-[#3A3A3C]\'} border border-[#4A4A4C]`'
}

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w') as f:
    f.write(content)
print(f"Processed {filepath} perfectly.")
