import sys

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Update component declaration
old_decl = 'export default function LogWriteBox({ memberInfo, masterStakeholders, fetchLogs, fetchMasterStakeholders, workspaceCode, workspaceLabel }) {'
new_decl = 'export default function LogWriteBox({ memberInfo, masterStakeholders, fetchLogs, fetchMasterStakeholders, workspaceCode, workspaceLabel, defaultExpanded = true }) {'
content = content.replace(old_decl, new_decl)

# 2. Update useState(true) to useState(defaultExpanded)
old_state = 'const [isExpanded, setIsExpanded] = useState(true);'
new_state = 'const [isExpanded, setIsExpanded] = useState(defaultExpanded);'
content = content.replace(old_state, new_state)

# 3. Update the layout of the closed header
old_layout = """                    {!isExpanded ? (
                        <>
                            <div className="flex-1 pl-[8px]">
                                <span className="text-[#bcdbdb] font-bold text-[16px]">주요 공유사항, 협업 및 논의가 필요한 내용을 등록하세요.</span>
                            </div>
                            <div className="rounded-[8px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] ml-auto">"""

new_layout = """                    {!isExpanded ? (
                        <>
                            <div className="pl-[8px]">
                                <span className="text-[#bcdbdb] font-bold text-[16px]">주요 공유사항, 협업 및 논의가 필요한 내용을 등록하세요.</span>
                            </div>
                            <div className="rounded-[8px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] ml-[14px]">"""
content = content.replace(old_layout, new_layout)

with open(path, 'w') as f:
    f.write(content)
print("LogWriteBox updated.")
