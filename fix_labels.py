import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')
files.append('src/components/system/DecisionLog.jsx')

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Next Action -> 다음액션
    content = content.replace('>Next Action<', '>다음액션<')
    content = content.replace('다음 액션', '다음액션')
    
    # 2. Make the pill slightly more visible
    # From: text-[#A1A1AA] bg-[#2c2c2e] border border-[#3a3a3c]
    # To: text-[#E5E5E5] bg-[#3c3c3c] border border-[#4c4c4c]
    content = content.replace(
        'text-[#A1A1AA] bg-[#2c2c2e] border border-[#3a3a3c] px-[8px] py-[2px] rounded-full',
        'text-[#E5E5E5] bg-[#3c3c3c] border border-[#4c4c4c] px-[8px] py-[2px] rounded-full'
    )
    
    # 3. Make the input label slightly more visible
    # From: text-[#86868B] text-[13px] font-bold shrink-0">목표 마감일
    # To: text-[#A1A1AA] text-[13px] font-bold shrink-0">목표 마감일
    content = content.replace(
        'text-[#86868B] text-[13px] font-bold shrink-0">목표 마감일',
        'text-[#A1A1AA] text-[13px] font-bold shrink-0">목표 마감일'
    )
    
    with open(path, 'w') as f:
        f.write(content)

print("Labels Fixed")
