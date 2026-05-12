import os
import re

def extract_component(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    match = re.search(r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?\n    \};\n", content, re.DOTALL)
    if not match:
        # maybe it ends differently
        match = re.search(r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?(?=    //|    const|    return \()", content, re.DOTALL)
    
    if match:
        return match.group(0)
    return None

sys_comp = extract_component('src/components/system/SystemFund421.jsx')
vi_comp = extract_component('src/components/system/VehicleIntegrated.jsx')

with open('/tmp/sys_comp.txt', 'w') as f:
    f.write(sys_comp if sys_comp else "None")
    
with open('/tmp/vi_comp.txt', 'w') as f:
    f.write(vi_comp if vi_comp else "None")

