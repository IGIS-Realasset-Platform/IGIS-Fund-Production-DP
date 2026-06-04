import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';
import { notifyMembersOnLogCreation, notifyMembersOnTaskCreation } from '../../utils/notificationHelpers';

export default function MobileComposerSheet({ memberInfo, onClose, onSuccess, activeTab }) {
    const [mode, setMode] = useState(() => (activeTab === 1 ? 'log' : 'task'));
    const [workspace, setWorkspace] = useState(() => getInitialWorkspace(memberInfo));
    const [loading, setLoading] = useState(false);

    // Task fields
    const [taskName, setTaskName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [relatedAsset, setRelatedAsset] = useState('IOTA 공통');
    const [taskStatus, setTaskStatus] = useState('아이데이션');
    const [taskPriority, setTaskPriority] = useState('중간');
    const [dueDate, setDueDate] = useState('');
    const [nextAction, setNextAction] = useState('');

    // Log fields
    const [logContent, setLogContent] = useState('');
    const [projectName, setProjectName] = useState('IOTA 공통');
    const [triageType, setTriageType] = useState('공유');
    const [logStatus, setLogStatus] = useState('신규');
    const [logPriority, setLogPriority] = useState('중간');

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (mode === 'task') {
                if (!taskName.trim()) {
                    alert("업무명을 입력해주세요.");
                    return;
                }
                const payload = {
                    task_name: taskName.trim(),
                    related_asset: relatedAsset.trim() || 'IOTA 공통',
                    status: taskStatus,
                    priority: taskPriority,
                    due_date: dueDate || null,
                    next_action: nextAction.trim(),
                    created_at: new Date().toISOString()
                };
                if (workspace.taskTable !== 'iota_digital_tasks') {
                    payload.company_name = companyName.trim();
                }

                const { data, error } = await supabase.from(workspace.taskTable).insert(payload).select();
                if (error) throw error;
                const insertedTask = data && data[0];
                const taskId = insertedTask ? insertedTask.id : null;

                // 알림 발송 (UI 블로킹 없이 백그라운드로 처리)
                notifyMembersOnTaskCreation(taskId, taskName.trim(), workspace, memberInfo?.email);
            } else {
                if (!logContent.trim()) {
                    alert("내용을 입력해주세요.");
                    return;
                }
                const now = new Date();
                const logId = `iota_issue_${now.getTime()}`;
                const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

                const logPayload = {
                    log_id: logId,
                    writer_staff_id: memberInfo?.email,
                    writer_name: memberInfo?.staff_name,
                    work_date: yyyymmdd,
                    raw_text: logContent,
                    summary: logContent.length > 160 ? logContent.slice(0, 160) : logContent,
                    input_status: 'submitted',
                    source_system: 'mobile_app',
                    metadata: {
                        workspace_code: workspace.code,
                        workspace_label: workspace.label,
                        project_name: projectName,
                        triage_type: triageType,
                        issue_status: logStatus,
                        priority: logPriority,
                        comments: [],
                        permissions: {
                            groups: [],
                            individuals: []
                        }
                    }
                };

                const { error } = await supabase.from('iota_seoul_logs').insert(logPayload);
                if (error) throw error;

                await supabase.from('iota_seoul_log_links').insert({
                    link_id: `link_${logId}`,
                    log_id: logId,
                    proj_id: projectName === '427 PFV' ? 'P00030' : projectName === '816 PFV' ? 'P00037' : projectName === '421 Fund' ? '112614' : 'IOTA_COMMON',
                    relation_type: 'direct_input'
                });

                // 알림 발송 (UI 블로킹 없이 백그라운드로 처리)
                notifyMembersOnLogCreation(logId, logContent, workspace, memberInfo?.email);
            }

            alert("저장되었습니다.");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "bg-[#1A1A1A] border border-[#444] text-white text-[15px] rounded-[12px] px-4 py-3 outline-none focus:border-[#888] placeholder-[#86868B] w-full font-medium transition-colors";
    const selectClass = "bg-[#1A1A1A] border border-[#444] text-white text-[15px] rounded-[12px] px-4 py-3 outline-none focus:border-[#888] w-full font-medium transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23888888%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat";

    return (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end">
            <div className="w-full h-[90%] bg-[#1F1F1E] rounded-t-[24px] border-t border-[#3c3c3c] flex flex-col shadow-2xl relative pb-[env(safe-area-inset-bottom)] animate-slide-up">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5 bg-[#272726] border-b border-[#3c3c3c] rounded-t-[24px] shrink-0">
                    <button onClick={onClose} className="text-[#86868B] hover:text-[#E5E5E5] text-[15px] font-bold p-2 -ml-2 transition-colors">취소</button>
                    <span className="text-[17px] font-bold text-white tracking-tight">새 글 작성</span>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="text-[#60a5fa] hover:text-[#3b82f6] text-[15px] font-bold p-2 -mr-2 disabled:opacity-50 transition-colors"
                    >
                        {loading ? '저장중' : '저장'}
                    </button>
                </div>

                {/* Segmented Control */}
                <div className="px-4 pt-4 shrink-0 bg-[#1F1F1E]">
                    <div className="flex bg-[#272726] p-1 rounded-[14px] border border-[#3c3c3c] select-none">
                        <button 
                            onClick={() => setMode('task')}
                            className={`flex-1 py-2 text-[14px] font-bold rounded-[10px] transition-all duration-300 ${mode === 'task' ? 'bg-[#3c3c3c] text-white shadow-md' : 'text-[#86868B]'}`}
                        >
                            Task 등록
                        </button>
                        <button 
                            onClick={() => setMode('log')}
                            className={`flex-1 py-2 text-[14px] font-bold rounded-[10px] transition-all duration-300 ${mode === 'log' ? 'bg-[#3c3c3c] text-white shadow-md' : 'text-[#86868B]'}`}
                        >
                            협업 글작성
                        </button>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 bg-[#1F1F1E]">
                    
                    {/* Common Workspace Selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#86868B] ml-1">소속 워크스페이스</label>
                        <div className="relative">
                            <select 
                                value={workspace.code} 
                                onChange={(e) => setWorkspace(MOBILE_WORKSPACES.find(w => w.code === e.target.value) || workspace)}
                                className={selectClass}
                            >
                                {MOBILE_WORKSPACES.map(w => (
                                    <option key={w.code} value={w.code}>{w.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {mode === 'task' ? (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#86868B] ml-1">업무명 <span className="text-red-400">*</span></label>
                                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task 명 입력" className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#86868B] ml-1">회사명 (선택)</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="비워두면 내부업무" className={inputClass} />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">관련 자산</label>
                                    <input type="text" value={relatedAsset} onChange={e => setRelatedAsset(e.target.value)} placeholder="IOTA 공통" className={inputClass} />
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">마감일</label>
                                    <input type="date" value={dueDate} onClick={(e) => e.target.showPicker && e.target.showPicker()} onChange={e => setDueDate(e.target.value)} className={`${inputClass} [color-scheme:dark] cursor-pointer`} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">상태</label>
                                    <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} className={selectClass}>
                                        {['아이데이션', '검토중', '진행중', '보류', '완료'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">우선순위</label>
                                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className={selectClass}>
                                        {['높음', '중간', '낮음'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#86868B] ml-1">Next Action</label>
                                <textarea value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="진행 상황 및 다음 행동 입력" className={`${inputClass} min-h-[120px] resize-none`} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-bold text-[#86868B] ml-1">내용 <span className="text-red-400">*</span></label>
                                <textarea value={logContent} onChange={e => setLogContent(e.target.value)} placeholder="협업 및 기록할 내용을 상세히 작성해주세요." className={`${inputClass} min-h-[160px] resize-none`} />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">프로젝트</label>
                                    <select value={projectName} onChange={e => setProjectName(e.target.value)} className={selectClass}>
                                        {['IOTA 공통', '427 PFV', '816 PFV', '421 Fund'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">목적</label>
                                    <select value={triageType} onChange={e => setTriageType(e.target.value)} className={selectClass}>
                                        {['공유', '협업', '리스크 판단', '의사결정'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">상태</label>
                                    <select value={logStatus} onChange={e => setLogStatus(e.target.value)} className={selectClass}>
                                        {['신규', '검토중', '진행중', '보류', '완료'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-[#86868B] ml-1">중요도</label>
                                    <select value={logPriority} onChange={e => setLogPriority(e.target.value)} className={selectClass}>
                                        {['높음', '중간', '낮음'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-3.5 bg-[#1A1A1A] border border-yellow-500/20 rounded-[12px] mt-2 select-none">
                                <p className="text-[12px] text-yellow-500 font-bold">관리자 및 부문대표는 항상 조회할 수 있습니다.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
