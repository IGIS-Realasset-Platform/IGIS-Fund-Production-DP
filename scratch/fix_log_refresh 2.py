import sys
import re

file_path = "src/components/system/LogWriteBox.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add a slight delay and a custom event dispatch to fetchLogs in LogWriteBox to fix the race condition 
# where fetchLogs fires before Supabase finishes writing, causing the new comment not to show up on the board.

old_block = """            if(fetchLogs) fetchLogs();
            
            setShowSuccessModal(true);"""

new_block = """            if(fetchLogs) {
                setTimeout(() => {
                    fetchLogs();
                    if (isTaskBoard && taskId) {
                        window.dispatchEvent(new CustomEvent('iota_log_updated', { detail: { taskId: taskId } }));
                    }
                }, 500);
            }
            
            setShowSuccessModal(true);"""

content = content.replace(old_block, new_block)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added delay to fetchLogs and dispatched iota_log_updated event to fix UI refresh bug.")
