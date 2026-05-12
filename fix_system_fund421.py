import re

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()

# Add import
if "import Fund421DetailCard" not in content:
    content = content.replace("import VehicleActivityLog from './shared/VehicleActivityLog';", "import VehicleActivityLog from './shared/VehicleActivityLog';\nimport Fund421DetailCard from './shared/Fund421DetailCard';")

# Remove inline VehicleDetailCard
pattern = r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?\n    \};\n"
content = re.sub(pattern, "", content, flags=re.DOTALL)

# Replace <VehicleDetailCard with <Fund421DetailCard
content = content.replace("<VehicleDetailCard ", "<Fund421DetailCard ")

with open('src/components/system/SystemFund421.jsx', 'w') as f:
    f.write(content)

