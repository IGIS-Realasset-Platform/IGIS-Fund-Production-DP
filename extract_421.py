import re

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()

pattern = r"    const VehicleDetailCard = \(\{.*?\}\) => \{.*?\n    \};\n"
match = re.search(pattern, content, re.DOTALL)

if match:
    comp_code = match.group(0)
    # Dedent and replace name
    lines = comp_code.split('\n')
    new_lines = []
    for line in lines:
        if line.startswith('    '):
            new_lines.append(line[4:])
        else:
            new_lines.append(line)
    
    comp_code = '\n'.join(new_lines)
    comp_code = comp_code.replace('const VehicleDetailCard =', 'const Fund421DetailCard =')
    
    # Add imports
    final_code = "import React, { useState } from 'react';\n\n"
    
    # Add formatAmount utility inside
    final_code += """const formatAmount = (rawAmt) => {
    const amt = Math.round(rawAmt);
    const jo = Math.floor(amt / 10000);
    const uk = amt % 10000;
    let formattedUk = uk.toLocaleString('ko-KR');
    if (jo > 0) {
        if (uk === 0) return `${jo}조원`;
        return `${jo}조 ${formattedUk}억원`;
    }
    return `${formattedUk}억원`;
};

"""
    
    final_code += comp_code
    final_code += "\nexport default Fund421DetailCard;\n"
    
    with open('src/components/system/shared/Fund421DetailCard.jsx', 'w') as out_f:
        out_f.write(final_code)
    print("Extracted Fund421DetailCard successfully.")
else:
    print("Could not extract VehicleDetailCard from SystemFund421.jsx")

