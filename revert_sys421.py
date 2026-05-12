import re

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()

# Remove the import
content = content.replace("import VehicleDetailCard from '../shared/VehicleDetailCard';\n", "")
content = content.replace("import VehicleDetailCard from './shared/VehicleDetailCard';\n", "")

# Load the original SystemFund421.jsx VehicleDetailCard
with open('/tmp/sys_comp.txt', 'r') as f:
    sys_comp = f.read()

# Re-inject it. Where? Before `const toggle421 = `
inject_idx = content.find("    const toggle421 =")
if inject_idx != -1:
    content = content[:inject_idx] + sys_comp + "\n\n" + content[inject_idx:]
    
# Revert <VehicleDetailCard onInstClick={handleInstClick} to <VehicleDetailCard 
content = content.replace("<VehicleDetailCard onInstClick={handleInstClick} ", "<VehicleDetailCard ")

with open('src/components/system/SystemFund421.jsx', 'w') as f:
    f.write(content)

