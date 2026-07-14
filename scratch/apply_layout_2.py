import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove sticky left classes and z-indices from the table headers and cells
content = re.sub(r'sticky\s+left-\[?\d*p?x?\]?\s+', '', content)
content = re.sub(r'z-20\s+', '', content)
content = re.sub(r'z-30\s+', '', content)

# Remove the shadow from the 협업 column
content = content.replace("shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]", "")

# Change widths of '세부업무' column from 210 to 290
content = content.replace("w-[210px]", "w-[290px]")
content = content.replace("min-w-[210px]", "min-w-[290px]")
content = content.replace("max-w-[210px]", "max-w-[290px]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Second replacement successful!")
