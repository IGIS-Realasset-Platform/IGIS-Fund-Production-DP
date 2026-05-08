import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'className="flex flex-col gap-[10px]"' in content:
        content = content.replace('className="flex flex-col gap-[10px]"', 'className="flex flex-col gap-[8px]"')
        with open(file, 'w') as f:
            f.write(content)
        print(f"Patched {file}")

