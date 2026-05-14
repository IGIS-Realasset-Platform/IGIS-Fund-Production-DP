import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove executeWithTimeout wrapper completely
    content = content.replace("await executeWithTimeout(supabase.from", "await supabase.from")
    content = content.replace(").select());", ").select();")
    content = content.replace(").eq('id', editingTaskId));", ").eq('id', editingTaskId);")
    content = content.replace(").eq('id', id));", ").eq('id', id);")
    content = content.replace(").insert([taskToSave]));", ").insert([taskToSave]);")
    
    with open(path, 'w') as f:
        f.write(content)

print("Timeout Wrappers Stripped")
