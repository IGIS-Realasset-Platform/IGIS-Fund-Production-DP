import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "const [rrData, setRrData] = React.useState(CATEGORY_MAP_DATA.map((item, idx) => ({ ...item, id: `mock-${idx}` })));"
replacement = "const rrData = React.useMemo(() => CATEGORY_MAP_DATA.map((item, idx) => ({ ...item, id: `mock-${idx}` })), []);"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced useState with useMemo for rrData to fix HMR issue.")
else:
    print("Target line not found.")
