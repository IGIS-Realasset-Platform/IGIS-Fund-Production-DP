import re

files = [
    'src/components/system/SystemFund421.jsx',
    'src/components/system/VehicleIntegrated.jsx',
    'src/components/system/workspace/WorkspaceFund.jsx',
    'src/components/system/workspace/WorkspaceFinancing.jsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find where VehicleDetailCard is defined and remove it.
    # It starts with "    const VehicleDetailCard = " and ends before the next component or similar thing.
    # Specifically, it ends with "    };\n" followed by something else like "    const toggle421" or "    const [selectedInst"
    
    # We can use regex to find the block
    pattern = r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?\n    \};\n\n"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        # try without the double newline
        pattern = r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?\n    \};\n"
        match = re.search(pattern, content, re.DOTALL)

    if match:
        content = content[:match.start()] + content[match.end():]
        print(f"Removed inline definition from {filepath}")
    else:
        print(f"Warning: Could not find inline definition in {filepath}")
        
    # Inject import statement after the last import
    if "import VehicleDetailCard from" not in content:
        # For SystemFund421 and VehicleIntegrated:
        if filepath.startswith('src/components/system/workspace/'):
            import_stmt = "import VehicleDetailCard from '../shared/VehicleDetailCard';\n"
        else:
            import_stmt = "import VehicleDetailCard from './shared/VehicleDetailCard';\n"
            
        last_import_idx = content.rfind("import ")
        if last_import_idx != -1:
            end_of_line = content.find("\n", last_import_idx)
            content = content[:end_of_line+1] + import_stmt + content[end_of_line+1:]
        else:
            content = import_stmt + content
            
    # Update `<VehicleDetailCard ... />` to pass onInstClick if needed
    if filepath == 'src/components/system/SystemFund421.jsx':
        content = content.replace(
            "<VehicleDetailCard ",
            "<VehicleDetailCard onInstClick={handleInstClick} "
        )
        
    with open(filepath, 'w') as f:
        f.write(content)

