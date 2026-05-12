import re

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()

# find all tbodys
matches = re.findall(r'(<tbody className="text-\[13px\] text-\[#E5E5E5\]">.*?</tbody\s*>)', content, re.DOTALL)
print(f"Found {len(matches)} tbodys")
for i, m in enumerate(matches):
    print(f"Match {i} length: {len(m)}")
