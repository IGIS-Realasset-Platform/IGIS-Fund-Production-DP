import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "구조/법무/세무"
replacement = "법무/세무"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced '구조/법무/세무' with '법무/세무'.")
else:
    print("Target string not found.")
