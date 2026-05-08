import re

file_path = "src/components/system/workspace/WorkspacePm.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Imports
# Check if motion is imported
if "from 'framer-motion'" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';")

# 2. Add State Variables & Logic
# We will inject this right after `const [memberInfo] = useState(null);` or whatever initial state is there.
# Let's find the start of the component `export default function WorkspacePm() {`
component_start_pattern = r"(export default function WorkspacePm\(\) \{[\s\S]*?const \{ memberInfo \} = useAuth\(\);)"
component_start_match = re.search(component_start_pattern, content)

if not component_start_match:
    print("Could not find component start")
    exit(1)

state_vars = """
    // Task Management States
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: '', next_action: ''
    });

    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [projectShowAll, setProjectShowAll] = useState(false);
    const [assetFilter, setAssetFilter] = useState('ALL');
    const [customAssets, setCustomAssets] = useState([]);
    const [showNewAssetModal, setShowNewAssetModal] = useState(false);
    const [newAssetName, setNewAssetName] = useState('');
    const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

    // Stakeholder States
    const [masterStakeholders, setMasterStakeholders] = useState([]);
    const [companyQuery, setCompanyQuery] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showNewStakeholderModal, setShowNewStakeholderModal] = useState(false);
    const [newStakeholderRole, setNewStakeholderRole] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchMasterStakeholders();
        const saved = localStorage.getItem('iota_pm_custom_assets');
        if (saved) setCustomAssets(JSON.parse(saved));
    }, []);

    const fetchMasterStakeholders = async () => {
        try {
            const { data, error } = await supabase.from('iota_stakeholder_master').select('*');
            if (!error && data) {
                setMasterStakeholders(data);
            }
        } catch (e) {
            console.error('Master stakeholder fetch error:', e);
        }
    };

    const registerMasterStakeholder = async () => {
        try {
            const { error } = await supabase.from('iota_stakeholder_master').insert({
                company_name: companyQuery,
                role_category: newStakeholderRole
            });
            if (!error) {
                await fetchMasterStakeholders();
                setShowNewStakeholderModal(false);
            } else {
                alert('이해관계자 등록 중 오류가 발생했습니다.');
            }
        } catch (e) {
            alert('연결 오류');
        }
    };

    const registerNewAsset = () => {
        if (!newAssetName.trim()) return;
        setIsSubmittingAsset(true);
        setTimeout(() => {
            const updated = [...customAssets, newAssetName.trim()];
            setCustomAssets(updated);
            localStorage.setItem('iota_pm_custom_assets', JSON.stringify(updated));
            setNewTask({...newTask, related_asset: newAssetName.trim()});
            setIsSubmittingAsset(false);
            setShowNewAssetModal(false);
            setNewAssetName('');
        }, 300);
    };

    const uniqueCompanies = [...new Set(masterStakeholders.map(s => s.company_name).filter(Boolean))];
    const filteredCompanies = uniqueCompanies.filter(c => c.toLowerCase().includes(companyQuery.toLowerCase()));

    const fetchTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const { data, error } = await supabase
                .from('iota_pm_tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                // Supabase table might not exist yet, fallback to localStorage
                console.warn('Falling back to local storage for tasks:', error);
                const localData = localStorage.getItem('iota_pm_tasks_fallback');
                if (localData) setTasks(JSON.parse(localData));
                else setTasks([]);
            } else {
                setTasks(data || []);
            }
        } catch (e) {
            console.error('Failed to fetch tasks:', e);
            const localData = localStorage.getItem('iota_pm_tasks_fallback');
            if (localData) setTasks(JSON.parse(localData));
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const handleSaveRow = async () => {
        if (!newTask.task_name) return alert('Task 명을 입력해주세요.');
        const taskToSave = { ...newTask, id: Date.now().toString(), created_at: new Date().toISOString() };
        try {
            const { error } = await supabase.from('iota_pm_tasks').insert([taskToSave]);
            if (error) throw error;
        } catch (e) {
            console.warn('Saving to local storage fallback due to error:', e);
            const updated = [taskToSave, ...tasks];
            localStorage.setItem('iota_pm_tasks_fallback', JSON.stringify(updated));
        }
        
        setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: '', next_action: '' });
        setCompanyQuery('');
        setIsAdding(false);
        fetchTasks();
    };

    const handleDeleteRow = async (id) => {
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('iota_pm_tasks').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.warn('Deleting from local storage fallback due to error:', e);
            const updated = tasks.filter(t => t.id !== id);
            localStorage.setItem('iota_pm_tasks_fallback', JSON.stringify(updated));
        } finally {
            fetchTasks();
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    const handleMoveTaskUp = async (index) => {
        if (index === 0) return;
        const current = sortedTasks[index];
        const prev = sortedTasks[index - 1];
        
        const temp = current.created_at;
        current.created_at = prev.created_at;
        prev.created_at = temp;
        
        const newTasks = tasks.map(t => t.id === current.id ? {...t, created_at: current.created_at} : t.id === prev.id ? {...t, created_at: prev.created_at} : t);
        setTasks(newTasks);
        
        try {
            await supabase.from('iota_pm_tasks').update({ created_at: current.created_at }).eq('id', current.id);
            await supabase.from('iota_pm_tasks').update({ created_at: prev.created_at }).eq('id', prev.id);
        } catch (e) {
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
            await supabase.from('iota_pm_tasks').update({ created_at: current.created_at }).eq('id', current.id);
            await supabase.from('iota_pm_tasks').update({ created_at: next.created_at }).eq('id', next.id);
        } catch (e) {
            localStorage.setItem('iota_pm_tasks_fallback', JSON.stringify(newTasks));
        }
    };

    const isCoreAsset = (asset) => {
        if (!asset || typeof asset !== 'string') return false;
        const lower = asset.toLowerCase();
        return lower.includes('iota') || lower.includes('이오타') || lower.includes('427') || lower.includes('816') || lower.includes('421');
    };

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const filteredTasks = safeTasks.filter(t => assetFilter === 'ALL' || isCoreAsset(t.related_asset));
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    const parseNames = (text) => {
        if (!text) return text;
        const names = ['강순용', '권순일', '윤주형', '김제익', '박석제', '이수정'];
        let result = text;
        names.forEach(name => {
            const regex = new RegExp(name, 'g');
            result = result.replace(regex, `<span class="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">${name}</span>`);
        });
        return <span dangerouslySetInnerHTML={{ __html: result }} />;
    };
"""

content = content[:component_start_match.end()] + "\n" + state_vars + content[component_start_match.end():]

with open(file_path, "w") as f:
    f.write(content)

print("Injected state logic")
