import sys

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Add isLoading state
old_state = "const [logs, setLogs] = useState([]);"
new_state = "const [isLoading, setIsLoading] = useState(true);\n    const [logs, setLogs] = useState([]);"
content = content.replace(old_state, new_state)

# 2. Update fetchLogs
old_fetch = """    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase"""
new_fetch = """    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase"""
content = content.replace(old_fetch, new_fetch)

old_fetch_end = """            // Filter out non-members ('기타')
            const validLogs = (data || []).filter(log => getCellName(log.writer_name) !== '기타');
            setLogs(validLogs);
        } catch (e) {
            console.error('Error fetching logs:', e);
        }
    };"""
new_fetch_end = """            // Filter out non-members ('기타')
            const validLogs = (data || []).filter(log => getCellName(log.writer_name) !== '기타');
            setLogs(validLogs);
        } catch (e) {
            console.error('Error fetching logs:', e);
        } finally {
            setIsLoading(false);
        }
    };"""
content = content.replace(old_fetch_end, new_fetch_end)

# 3. Update the UI message
old_ui = """                {displayedLogs.length === 0 && (
                    <div className="py-[60px] text-center text-[14px] text-[#86868B]">등록된 업무가 없습니다.</div>
                )}"""
new_ui = """                {displayedLogs.length === 0 && (
                    <div className="py-[60px] text-center text-[14px] text-[#86868B]">
                        {isLoading ? '데이터를 불러오는 중입니다...' : '등록된 업무가 없습니다.'}
                    </div>
                )}"""
content = content.replace(old_ui, new_ui)

with open(path, 'w') as f:
    f.write(content)
print("Loading state added.")
