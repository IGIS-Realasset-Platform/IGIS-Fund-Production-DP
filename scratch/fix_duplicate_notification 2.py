import sys
import re

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the duplicate notification bug when updating a task
# Old: 
#                     if (data && data[0]) {
#                         notifyMembersOnTaskCreation(
#                             data[0].id,
#                             data[0].task_name,
#                             { code: 'WS_PMO', label: '통합업무보드' },
#                             memberInfo?.email || ''
#                         );
#                         window.history.replaceState(null, '', `${window.location.pathname}?taskId=${data[0].id}`);
#                     }

# We need to remove the notifyMembersOnTaskCreation call entirely, because when a task is CREATED on the task board, 
# it's usually just an empty row, or it triggers both 'task creation' and 'log creation' notifications in an uncontrolled way.
# However, the user specifically mentioned "when registering a new POST (새 글 등록)", two notifications fire.
# The user's screenshot shows:
# 1. "[통합업무보드] 신규 회의록 등록" (From notifyMembersOnLogCreation)
# 2. "[통합업무보드]에 새 글이 등록됐습니다." (From notifyMembersOnTaskCreation)
# Both have the same title "N 생성 테스트", meaning the task creation and log creation notifications are both firing for the SAME event.

content = content.replace(
'''                    if (data && data[0]) {
                        notifyMembersOnTaskCreation(
                            data[0].id,
                            data[0].task_name,
                            { code: 'WS_PMO', label: '통합업무보드' },
                            memberInfo?.email || ''
                        );
                        window.history.replaceState(null, '', `${window.location.pathname}?taskId=${data[0].id}`);
                    }''',
'''                    if (data && data[0]) {
                        window.history.replaceState(null, '', `${window.location.pathname}?taskId=${data[0].id}`);
                    }'''
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Removed erroneous notifyMembersOnTaskCreation call from PmoTaskBoardStaging.jsx to fix duplicate notifications.")
