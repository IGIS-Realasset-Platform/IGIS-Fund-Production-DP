import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if we need to revert the justify-center
    target_div = 'className="w-[430px] shrink-0 flex flex-col justify-center border-r border-[#444]/50 pr-8"'
    replacement_div = 'className="w-[430px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8"'
    
    if target_div in content:
        content = content.replace(target_div, replacement_div)
    
    # We need to insert the span before <h3 className="text-[21px] font-bold text-white tracking-tight leading-tight">
    h3_tag = '<h3 className="text-[21px] font-bold text-white tracking-tight leading-tight">'
    span_to_insert = '<span className="text-[13px] font-bold text-[#86868B] relative -top-[1px]">Task {index + 1}</span>\n                                        '
    
    # Ensure we don't insert it twice if already exists
    if "Task {index + 1}</span>" not in content:
        content = content.replace(h3_tag, span_to_insert + h3_tag)
        
    with open(file, 'w') as f:
        f.write(content)
        
    print(f"Patched {file}")

