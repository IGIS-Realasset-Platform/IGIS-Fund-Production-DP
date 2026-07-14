import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const x = 939;", "const x = 952.5;")
content = content.replace("const x = 1017;", "const x = 1027.5;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated bubble coords!")
