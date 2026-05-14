import os
import re

files = ['WorkspacePm.jsx']
base_dir = 'src/components/system/workspace'

for f in files:
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()

    replacement = """    const handleMoveTaskUp = async (index) => {
        if (index === 0) return;
        const current = sortedTasks[index];
        const prev = sortedTasks[index - 1];
        
        const temp = current.created_at;
        current.created_at = prev.created_at;
        prev.created_at = temp;
        
        const newTasks = tasks.map(t => t.id === current.id ? {...t, created_at: current.created_at} : t.id === prev.id ? {...t, created_at: prev.created_at} : t);
        setTasks(newTasks);
        
        try {
            const res1 = await supabase.from('iota_pm_tasks').update({ created_at: current.created_at }).eq('id', current.id).select();
            const res2 = await supabase.from('iota_pm_tasks').update({ created_at: prev.created_at }).eq('id', prev.id).select();
            console.log("Move UP DB Result 1:", res1);
            console.log("Move UP DB Result 2:", res2);
            if (res1.error || res2.error || !res1.data || res1.data.length === 0) {
                alert(`DB Update Failed! Check console. \nRes1: ${JSON.stringify(res1)}\nRes2: ${JSON.stringify(res2)}`);
            }
        } catch (e) {
            console.error(e);
            localStorage.setItem('iota_pm_tasks_fallback', JSON.stringify(newTasks));
        }
    };

    const handleMoveTaskDown = async (index) => {
        if (index === sortedTasks.length - 1) return;
        const current = sortedTasks[index];
        const next = sortedTasks[index + 1];
        
        const temp = current.created_at;
        current.created_at = next.created_at;
        next.created_at = temp;
        
        const newTasks = tasks.map(t => t.id === current.id ? {...t, created_at: current.created_at} : t.id === next.id ? {...t, created_at: next.created_at} : t);
        setTasks(newTasks);
        
        try {
            const res1 = await supabase.from('iota_pm_tasks').update({ created_at: current.created_at }).eq('id', current.id).select();
            const res2 = await supabase.from('iota_pm_tasks').update({ created_at: next.created_at }).eq('id', next.id).select();
            console.log("Move DOWN DB Result 1:", res1);
            console.log("Move DOWN DB Result 2:", res2);
            if (res1.error || res2.error || !res1.data || res1.data.length === 0) {
                alert(`DB Update Failed! Check console. \nRes1: ${JSON.stringify(res1)}\nRes2: ${JSON.stringify(res2)}`);
            }
        } catch (e) {
            console.error(e);
            localStorage.setItem('iota_pm_tasks_fallback', JSON.stringify(newTasks));
        }
    };"""

    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Injected Debug Alerts")
