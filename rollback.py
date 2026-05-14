import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')
files.append('src/components/system/DecisionLog.jsx')

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r') as f:
        content = f.read()
    
    # Revert Pill color
    content = content.replace(
        'text-[#E5E5E5] bg-[#3c3c3c] border border-[#4c4c4c] px-[8px] py-[2px] rounded-full',
        'text-[#A1A1AA] bg-[#2c2c2e] border border-[#3a3a3c] px-[8px] py-[2px] rounded-full'
    )
    
    # Revert Input label color
    content = content.replace(
        'text-[#A1A1AA] text-[13px] font-bold shrink-0">목표 마감일',
        'text-[#86868B] text-[13px] font-bold shrink-0">목표 마감일'
    )
    
    # Update DecisionLog.jsx workflow box target deadline visibility
    if 'DecisionLog.jsx' in path:
        content = content.replace(
            'text-[12px] font-medium text-[#555] opacity-60">목표 마감일',
            'text-[12px] font-medium text-[#86868B]">목표 마감일'
        )

    with open(path, 'w') as f:
        f.write(content)

print("Rollback and Update Complete")
