import os
import re

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as file:
    content = file.read()

if "import { executeWithTimeout }" not in content:
    content = content.replace("import { supabase } from '../../../utils/supabaseClient';", "import { supabase } from '../../../utils/supabaseClient';\nimport { executeWithTimeout } from '../../../utils/supabaseHelper';")

# Replace `await supabase.from(...).update(...)` or `delete()`
content = re.sub(r'await (supabase\.from\([^)]+\)\.(?:update|insert|delete)[^;\n]+);', r'await executeWithTimeout(\1);', content)

# Update catch blocks to reload
catch_patterns = [
    ("alert('삭제 중 오류가 발생했습니다.');", "alert('서버 연결 지연으로 인해 일시적인 오류가 발생했습니다. 페이지를 새로고침합니다.');\n            window.location.reload();"),
    ("alert('수정 중 오류가 발생했습니다.');", "alert('서버 연결 지연으로 인해 일시적인 오류가 발생했습니다. 페이지를 새로고침합니다.');\n            window.location.reload();"),
    ("alert('댓글 저장 중 오류가 발생했습니다.');", "alert('서버 연결 지연으로 인해 일시적인 오류가 발생했습니다. 페이지를 새로고침합니다.');\n            window.location.reload();"),
    ("alert('댓글 삭제 중 오류가 발생했습니다.');", "alert('서버 연결 지연으로 인해 일시적인 오류가 발생했습니다. 페이지를 새로고침합니다.');\n            window.location.reload();")
]

for target, replacement in catch_patterns:
    content = content.replace(target, replacement)

with open(path, 'w') as file:
    file.write(content)

print("Done updating WorkspaceActivityLog.jsx")
