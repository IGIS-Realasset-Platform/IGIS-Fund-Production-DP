import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("'../../utils/supabaseClient'", "'../../../utils/supabaseClient'")
content = content.replace("'../../utils/fetchWithRetry'", "'../../../utils/fetchWithRetry'")

with open(path, 'w') as f:
    f.write(content)
