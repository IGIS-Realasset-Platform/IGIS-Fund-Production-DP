const fs = require('fs');
const path = require('path');

const files = [
    'WorkspacePm.jsx',
    'WorkspaceIPR.jsx',
    'WorkspaceDigital.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceDevelopment.jsx'
];

const targetKey = "key={row.id}";
const replaceKey = "key={row.id}\n                                id={`task-${row.id}`}";

const targetHook = "    const handleEditRow = (row) => {";
const insertHook = `    useEffect(() => {
        if (!isLoadingTasks && tasks.length > 0) {
            const targetTaskId = localStorage.getItem('iota_target_task_id');
            if (targetTaskId) {
                const targetTask = tasks.find(t => t.id === targetTaskId);
                if (targetTask) {
                    setProjectShowAll(true);
                    setExpandedTaskId(targetTaskId);
                    setTimeout(() => {
                        const el = document.getElementById(\`task-\${targetTaskId}\`);
                        if (el) {
                            // offset scroll so it's not under fixed header
                            const y = el.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({top: y, behavior: 'smooth'});
                        }
                        localStorage.removeItem('iota_target_task_id');
                    }, 500);
                }
            }
        }
    }, [isLoadingTasks, tasks]);

    const handleEditRow = (row) => {`;

let count = 0;
for (const file of files) {
    const filePath = path.join(__dirname, 'src', 'components', 'system', 'workspace', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        if (content.includes(targetKey) && !content.includes("id={`task-${row.id}`}")) {
            // Replace only the first occurrence in the tasks list mapping, but since there's only one motion.div for tasks, it should be fine.
            content = content.replace(targetKey, replaceKey);
            modified = true;
        }

        if (content.includes(targetHook) && !content.includes("localStorage.getItem('iota_target_task_id')")) {
            content = content.replace(targetHook, insertHook);
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
            count++;
        }
    } else {
        console.log(`File not found: ${file}`);
    }
}
console.log(`Total updated: ${count}`);
