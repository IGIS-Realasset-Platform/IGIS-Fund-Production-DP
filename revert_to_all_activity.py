import sys

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Revert Title
old_title = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">최근 1주간 등록된 {workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'} 업무</h2>'
new_title = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">{workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'} 전체 활동</h2>'
if old_title in content:
    content = content.replace(old_title, new_title)

# 2. Revert Filter
old_filter = """            // 1주 전 날짜 계산
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

            // Filter out non-members ('기타') and older than 1 week
            const validLogs = (data || []).filter(log => {
                const isMember = getCellName(log.writer_name) !== '기타';
                const logDateStr = log.work_date || (log.created_at ? log.created_at.split('T')[0] : '');
                return isMember && (logDateStr >= oneWeekAgoStr);
            });"""
new_filter = """            // Filter out non-members ('기타')
            const validLogs = (data || []).filter(log => getCellName(log.writer_name) !== '기타');"""

if old_filter in content:
    content = content.replace(old_filter, new_filter)

with open(path, 'w') as f:
    f.write(content)
print("Reverted to base '전체 활동' state without 1-week filter.")
