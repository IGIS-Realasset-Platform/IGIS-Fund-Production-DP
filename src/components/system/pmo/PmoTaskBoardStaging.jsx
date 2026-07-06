import React from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function PmoTaskBoardStaging() {
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingCell, setEditingCell] = React.useState(null); // { rowId, colName }
    const [tempValue, setTempValue] = React.useState('');

    async function fetchTasks() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .select('*')
                .order('priority_score', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        fetchTasks();
    }, []);

    const handleDoubleClick = (rowId, colName, currentValue) => {
        setEditingCell({ rowId, colName });
        setTempValue(currentValue || '');
    };

    const handleSaveCell = async (rowId, colName) => {
        if (!editingCell) return;
        try {
            const { error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .update({ [colName]: tempValue })
                .eq('id', rowId);

            if (error) throw error;

            // Update state locally
            setTasks(prev => prev.map(t => t.id === rowId ? { ...t, [colName]: tempValue } : t));
        } catch (err) {
            console.error("Failed to save cell:", err);
            alert("수정 권한이 없거나 저장에 실패했습니다.");
        } finally {
            setEditingCell(null);
        }
    };

    const handleToggleBadge = async (rowId, colName, currentValue) => {
        const nextValue = !currentValue;
        try {
            const { error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .update({ [colName]: nextValue })
                .eq('id', rowId);

            if (error) throw error;
            setTasks(prev => prev.map(t => t.id === rowId ? { ...t, [colName]: nextValue } : t));
        } catch (err) {
            console.error("Failed to toggle badge:", err);
            alert("수정 권한이 없거나 토글에 실패했습니다.");
        }
    };

    return (
        <div className="w-full flex flex-col select-none mb-10">
            {/* Sub-Header */}
            <div className="flex justify-between items-center mb-[16px]">
                <h2 className="text-[20px] font-bold text-white tracking-tight shrink-0 flex items-center gap-2">
                    <span>PMO 통합 업무 마스터 원장</span>
                    <span className="text-[12px] bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-md font-semibold font-mono">EDITABLE</span>
                </h2>
                <button 
                    onClick={fetchTasks}
                    className="px-4 py-1.5 bg-[#272726] hover:bg-[#333] border border-[#3c3c3c] hover:border-[#555] rounded-full text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                    🔄 원장 새로고침
                </button>
            </div>

            {loading ? (
                <div className="w-full h-[260px] flex items-center justify-center border border-[#333] rounded-[24px]">
                    <span className="text-[#86868B] text-[15px] animate-pulse">원장 정보를 불러오는 중입니다...</span>
                </div>
            ) : (
                <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[24px] overflow-hidden select-text">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-11 select-none">
                                <th className="pl-4 text-center w-12">No</th>
                                <th className="pl-4 w-28">대분류</th>
                                <th className="pl-4 w-44">업무명 (더블클릭 편집)</th>
                                <th className="pl-4 w-28">담당자</th>
                                <th className="pl-4 w-32">기한</th>
                                <th className="pl-4 w-24 text-center">진행상태</th>
                                <th className="pl-4 w-20 text-center">Blocker</th>
                                <th className="pl-4 w-20 text-center">의사결정</th>
                                <th className="pl-4">다음 액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3c3c3c] text-[13px] text-white">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-20 text-[#86868B]">
                                        등록된 원장 정보가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((t, idx) => (
                                    <tr key={t.id} className="hover:bg-[#333] transition-colors h-12">
                                        <td className="pl-4 text-center text-[#86868B] font-mono select-none">{idx + 1}</td>
                                        <td className="pl-4 font-bold text-[#E5E5E5]">{t.category_main}</td>
                                        
                                        {/* Inline Edit for Task Name */}
                                        <td 
                                            className="pl-4 font-medium text-white cursor-pointer truncate"
                                            onDoubleClick={() => handleDoubleClick(t.id, 'task_name', t.task_name)}
                                        >
                                            {editingCell?.rowId === t.id && editingCell?.colName === 'task_name' ? (
                                                <input 
                                                    type="text" 
                                                    value={tempValue} 
                                                    onChange={e => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveCell(t.id, 'task_name')}
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveCell(t.id, 'task_name')}
                                                    className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="hover:text-[#2997ff] transition-colors">{t.task_name}</span>
                                            )}
                                        </td>

                                        {/* Inline Edit for Assignee */}
                                        <td 
                                            className="pl-4 text-[#A1A1AA] cursor-pointer"
                                            onDoubleClick={() => handleDoubleClick(t.id, 'assignee', t.assignee)}
                                        >
                                            {editingCell?.rowId === t.id && editingCell?.colName === 'assignee' ? (
                                                <input 
                                                    type="text" 
                                                    value={tempValue} 
                                                    onChange={e => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveCell(t.id, 'assignee')}
                                                    className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="hover:text-[#2997ff] transition-colors">{t.assignee || '-'}</span>
                                            )}
                                        </td>

                                        {/* Inline Edit for Due Date */}
                                        <td 
                                            className="pl-4 text-[#A1A1AA] font-mono cursor-pointer"
                                            onDoubleClick={() => handleDoubleClick(t.id, 'due_date', t.due_date)}
                                        >
                                            {editingCell?.rowId === t.id && editingCell?.colName === 'due_date' ? (
                                                <input 
                                                    type="date" 
                                                    value={tempValue} 
                                                    onChange={e => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveCell(t.id, 'due_date')}
                                                    className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-1.5 py-0.5 text-white outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="hover:text-[#2997ff] transition-colors">{t.due_date || '-'}</span>
                                            )}
                                        </td>

                                        {/* Status Dropdown */}
                                        <td className="pl-4 text-center select-none">
                                            <select 
                                                value={t.status || '미착수'}
                                                onChange={e => {
                                                    setTempValue(e.target.value);
                                                    setEditingCell({ rowId: t.id, colName: 'status' });
                                                    setTimeout(() => handleSaveCell(t.id, 'status'), 100);
                                                }}
                                                className="bg-[#222] border border-[#333] text-white rounded-[6px] px-2 py-0.5 text-[11px] font-bold outline-none cursor-pointer hover:border-[#555] transition-colors"
                                            >
                                                <option value="미착수">미착수</option>
                                                <option value="진행중">진행중</option>
                                                <option value="완료">완료</option>
                                                <option value="지연">지연</option>
                                            </select>
                                        </td>

                                        {/* Toggle Blocker Badge */}
                                        <td className="pl-4 text-center select-none">
                                            <button 
                                                onClick={() => handleToggleBadge(t.id, 'is_blocker', t.is_blocker)}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] cursor-pointer transition-all ${
                                                    t.is_blocker 
                                                        ? 'bg-[#EF4444] text-white shadow-md shadow-[#EF4444]/20' 
                                                        : 'bg-[#333] text-[#86868B] hover:bg-[#444]'
                                                }`}
                                            >
                                                B
                                            </button>
                                        </td>

                                        {/* Toggle Decision Badge */}
                                        <td className="pl-4 text-center select-none">
                                            <button 
                                                onClick={() => handleToggleBadge(t.id, 'needs_decision', t.needs_decision)}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] cursor-pointer transition-all ${
                                                    t.needs_decision 
                                                        ? 'bg-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/20' 
                                                        : 'bg-[#333] text-[#86868B] hover:bg-[#444]'
                                                }`}
                                            >
                                                D
                                            </button>
                                        </td>

                                        {/* Next Action Cell */}
                                        <td 
                                            className="pl-4 text-[#A1A1AA] truncate cursor-pointer"
                                            onDoubleClick={() => handleDoubleClick(t.id, 'next_action', t.next_action)}
                                        >
                                            {editingCell?.rowId === t.id && editingCell?.colName === 'next_action' ? (
                                                <input 
                                                    type="text" 
                                                    value={tempValue} 
                                                    onChange={e => setTempValue(e.target.value)}
                                                    onBlur={() => handleSaveCell(t.id, 'next_action')}
                                                    className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="hover:text-[#2997ff] transition-colors">{t.next_action || '-'}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
