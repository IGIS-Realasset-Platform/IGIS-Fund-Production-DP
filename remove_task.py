import re
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if "Task</span>" exists in the file
    if ">Task</span>" in content or "Task</span" in content:
        # Regex to find the wrapper and the span
        # Old: <div className="w-[430px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8">
        #       <span className="...">Task</span>
        #       <h3 ...
        
        # Replace the div class
        content = content.replace(
            'className="w-[430px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8"',
            'className="w-[430px] shrink-0 flex flex-col justify-center border-r border-[#444]/50 pr-8"'
        )
        
        # Remove the span entirely. We can use a regex to be safe.
        # It looks like: <span className="[^"]*">Task</span>\s*<h3
        content = re.sub(r'<span[^>]*>Task</span>\s*<h3', '<h3', content)
        
        with open(file, 'w') as f:
            f.write(content)
        print(f"Patched {file}")

