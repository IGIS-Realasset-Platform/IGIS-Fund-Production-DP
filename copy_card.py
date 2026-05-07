import sys

path_src = 'src/components/system/VehicleIntegrated.jsx'
path_dst = 'src/components/system/workspace/WorkspaceFinancing.jsx'

with open(path_src, 'r') as f:
    src_content = f.read()

# Extract VehicleDetailCard
start_str = "    const VehicleDetailCard = ({ id, vehicleId, title, totalAmountStr, data, toggleContent }) => {"
end_str = "        );\n    };\n"

start_idx = src_content.find(start_str)
end_idx = src_content.find(end_str, start_idx) + len(end_str)

card_code = src_content[start_idx:end_idx]

# Remove the metrics cards block from card_code
# It starts at "{/* Dashboard Metrics Cards */}"
metrics_start = "{/* Dashboard Metrics Cards */}"
# It ends at ")}", right before "{/* Visual Tranche Bar */}"
metrics_end_marker = "                {/* Visual Tranche Bar */}"

if metrics_start in card_code and metrics_end_marker in card_code:
    m_start_idx = card_code.find(metrics_start)
    m_end_idx = card_code.find(metrics_end_marker)
    
    card_code = card_code[:m_start_idx] + card_code[m_end_idx:]

with open(path_dst, 'r') as f:
    dst_content = f.read()

# 1. Insert navigateTo helper inside WorkspaceFinancing
nav_helper = """
    const navigateTo = (path) => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: path }));
    };
"""
# 2. Insert card_code inside WorkspaceFinancing before return
logic_marker = "    const formatAmount = (rawAmt) => {"
if logic_marker in dst_content:
    format_amount_end = dst_content.find("};", dst_content.find(logic_marker)) + 2
    
    # We will insert nav_helper and card_code right after formatAmount
    injection = nav_helper + "\n" + card_code + "\n"
    dst_content = dst_content[:format_amount_end] + injection + dst_content[format_amount_end:]

# 3. Add the UI for 427 and 816 at the end of the return statement
ui_addition = """
            {!loading && iotaData && !iotaData.error && (
                <>
                    <div className="w-full h-[38px]"></div>
                    <VehicleDetailCard 
                        id="section-427" 
                        vehicleId="427"
                        title="1. IOTA One (427 PFV)" 
                        totalAmountStr={formatAmount(displayTotal427)} 
                        data={iotaData[427]['Refinancing']} 
                    />

                    <div className="w-full h-[38px]"></div>

                    <VehicleDetailCard 
                        id="section-816" 
                        vehicleId="816"
                        title="2. IOTA Two (816 PFV)" 
                        totalAmountStr={formatAmount(displayTotal816)} 
                        data={iotaData[816]['Refinancing']} 
                    />
                </>
            )}
"""

# Replace the closing tag of the main div
end_marker = "        </div>\n    );\n}"
dst_content = dst_content.replace(end_marker, ui_addition + "\n" + end_marker)

with open(path_dst, 'w') as f:
    f.write(dst_content)
print("Copied VehicleDetailCard and rendered it.")
