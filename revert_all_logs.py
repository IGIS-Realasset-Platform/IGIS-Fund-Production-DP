import sys

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Restore 1-week filter to fetchLogs
old_fetch_filter = """            // Filter out non-members ('기타')
            const validLogs = (data || []).filter(log => getCellName(log.writer_name) !== '기타');"""

new_fetch_filter = """            // 1주 전 날짜 계산
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

            // Filter out non-members ('기타') and older than 1 week
            const validLogs = (data || []).filter(log => {
                const isMember = getCellName(log.writer_name) !== '기타';
                const logDateStr = log.work_date || (log.created_at ? log.created_at.split('T')[0] : '');
                return isMember && (logDateStr >= oneWeekAgoStr);
            });"""

if old_fetch_filter in content:
    content = content.replace(old_fetch_filter, new_fetch_filter)

# 2. Remove 1-week filter from filteredLogs
old_filtered_logs = """        if (logSearchQuery) {
            const query = logSearchQuery.toLowerCase();
            const writerMatch = log.writer_name?.toLowerCase().includes(query);
            const contentMatch = log.raw_text?.toLowerCase().includes(query);
            const summaryMatch = log.summary?.toLowerCase().includes(query);
            const shMatch = log.iota_seoul_log_stakeholders?.some(sh => sh.sh_name?.toLowerCase().includes(query));
            if (!writerMatch && !contentMatch && !summaryMatch && !shMatch) return false;
        }

        if (logsViewMode === 'summary') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
            const logDateStr = log.work_date || (log.created_at ? log.created_at.split('T')[0] : '');
            if (logDateStr < oneWeekAgoStr) return false;
        }

        return true;
    });"""

new_filtered_logs = """        if (logSearchQuery) {
            const query = logSearchQuery.toLowerCase();
            const writerMatch = log.writer_name?.toLowerCase().includes(query);
            const contentMatch = log.raw_text?.toLowerCase().includes(query);
            const summaryMatch = log.summary?.toLowerCase().includes(query);
            const shMatch = log.iota_seoul_log_stakeholders?.some(sh => sh.sh_name?.toLowerCase().includes(query));
            if (!writerMatch && !contentMatch && !summaryMatch && !shMatch) return false;
        }

        return true;
    });"""

if old_filtered_logs in content:
    content = content.replace(old_filtered_logs, new_filtered_logs)

# 3. Restore static title
old_title = """<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">
                    {logsViewMode === 'summary' ? `최근 1주간 등록된 ${workspaceLabel ? workspaceLabel.split('-')[0].trim() : ''} 업무` : `${workspaceLabel ? workspaceLabel.split('-')[0].trim() : ''} 전체 업무 이력`}
                </h2>"""
new_title = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">최근 1주간 등록된 {workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'} 업무</h2>'

if old_title in content:
    content = content.replace(old_title, new_title)

# 4. Restore original button text
old_button_text = "{logsViewMode === 'summary' ? '모든 업무 이력 보기' : '최근 1주간 활동 보기'}"
new_button_text = "{logsViewMode === 'summary' ? '전체보기' : '간략히 보기'}"

if old_button_text in content:
    content = content.replace(old_button_text, new_button_text)

with open(path, 'w') as f:
    f.write(content)
print("Reverted to strict 1-week filter.")
