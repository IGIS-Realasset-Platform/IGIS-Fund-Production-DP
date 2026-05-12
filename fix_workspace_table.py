with open('src/components/system/workspace/WorkspaceFund.jsx', 'r') as f:
    ws_content = f.read()

# 1. Fix import
if "import Fund421DetailCard" not in ws_content:
    ws_content = ws_content.replace("import { fetchWithRetry } from '../../../utils/fetchWithRetry';", "import { fetchWithRetry } from '../../../utils/fetchWithRetry';\nimport Fund421DetailCard from '../shared/Fund421DetailCard';")

# 2. Change default phase
ws_content = ws_content.replace("const [phase421, setPhase421] = useState('current');", "const [phase421, setPhase421] = useState('new');")

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    sys_content = f.read()

# 3. Extract correct table body logic from SystemFund421.jsx
# We need to find the correct tbody block.
# In SystemFund421.jsx, the table starts with:
# <table className="w-full text-left border-collapse border-y-[2px] border-t-[#666] border-b-[#444]">
# Then <thead>...</thead>
# Then {phase421 === 'new' ? (

table_start_str = '                            </thead>\n                            {phase421 === \'new\' ? ('
start_idx = sys_content.find(table_start_str)

if start_idx != -1:
    # Find the end of this block which ends right before </table>
    end_idx = sys_content.find('                        </table>', start_idx)
    
    table_logic = sys_content[start_idx:end_idx]

    # In WorkspaceFund.jsx, replace the tbody
    ws_target_start_str = '                            </thead>\n                            <tbody className="text-[13px] text-[#E5E5E5]">'
    ws_start_idx = ws_content.find(ws_target_start_str)
    
    if ws_start_idx != -1:
        ws_end_idx = ws_content.find('                        </table>', ws_start_idx)
        ws_content = ws_content[:ws_start_idx] + table_logic + ws_content[ws_end_idx:]

with open('src/components/system/workspace/WorkspaceFund.jsx', 'w') as f:
    f.write(ws_content)

