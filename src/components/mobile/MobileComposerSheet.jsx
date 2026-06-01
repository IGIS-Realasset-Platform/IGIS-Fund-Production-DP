import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';

export default function MobileComposerSheet({ memberInfo, onClose, onSuccess }) {
    const [mode, setMode] = useState('task'); // 'task' or 'log'
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

                const { error } = await supabase.from(workspace.taskTable).insert(payload);
                if (error) throw error;
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

                // Create basic link to make it show up properly if needed, although PC platform might not strictly require it.
                await supabase.from('iota_seoul_log_links').insert({
                    link_id: `link_${logId}`,
                    log_id: logId,
                    proj_id: projectName === '427 PFV' ? 'P00030' : projectName === '816 PFV' ? 'P00037' : projectName === '421 Fund' ? '112614' : 'IOTA_COMMON',
                    relation_type: 'direct_input'
                });
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

    return (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end">
            <div className="w-full h-[90%] bg-[#171717] rounded-t-xl flex flex-col shadow-2xl relative pb-[env(safe-area-inset-bottom)]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A39] shrink-0">
                    <button onClick={onClose} className="text-[#A1A1AA] text-[15px] p-2 -ml-2">취소</button>
                    <span className="text-[17px] font-bold text-white tracking-tight">작성</span>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="text-[#4C82FF] text-[15px] font-bold p-2 -mr-2 disabled:opacity-50"
                    >
                        {loading ? '저장중' : '저장'}
                    </button>
                </div>

                {/* Segmented Control */}
                <div className="px-4 py-4 shrink-0">
                    <div className="flex bg-[#242423] p-1 rounded-lg border border-[#3A3A39]">
                        <button 
                            onClick={() => setMode('task')}
                            className={`flex-1 py-1.5 text-[14px] font-semibold rounded-md transition-colors ${mode === 'task' ? 'bg-[#3A3A39] text-white shadow-sm' : 'text-[#9A9A98]'}`}
                        >
                            Task 등록
                        </button>
                        <button 
                            onClick={() => setMode('log')}
                            className={`flex-1 py-1.5 text-[14px] font-semibold rounded-md transition-colors ${mode === 'log' ? 'bg-[#3A3A39] text-white shadow-sm' : 'text-[#9A9A98]'}`}
                        >
                            협업 글작성
                        </button>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto px-4 pb-10 flex flex-col gap-4">
                    
                    {/* Common Workspace Selector (Read-only for Task if needed, but we'll make it dropdown for both) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#A1A1AA]">소속 워크스페이스</label>
                        <select 
                            value={workspace.code} 
                            onChange={(e) => setWorkspace(MOBILE_WORKSPACES.find(w => w.code === e.target.value) || workspace)}
                            className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]"
                        >
                            {MOBILE_WORKSPACES.map(w => (
                                <option key={w.code} value={w.code}>{w.label}</option>
                            ))}
                        </select>
                    </div>

                    {mode === 'task' ? (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-[#A1A1AA]">업무명 <span className="text-red-400">*</span></label>
                                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task 명 입력" className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-medium text-[#A1A1AA]">회사명 (선택)</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="비워두면 내부업무" className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">관련 자산</label>
                                    <input type="text" value={relatedAsset} onChange={e => setRelatedAsset(e.target.value)} placeholder="IOTA 공통" className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]" />
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">마감일</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">상태</label>
                                    <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['아이데이션', '검토중', '진행중', '보류', '완료'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">우선순위</label>
                                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['높음', '중간', '낮음'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 h-full">
                                <label className="text-[13px] font-medium text-[#A1A1AA]">Next Action</label>
                                <textarea value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="진행 상황 및 다음 행동 입력" className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF] min-h-[120px] resize-none" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1.5 h-full">
                                <label className="text-[13px] font-medium text-[#A1A1AA]">내용 <span className="text-red-400">*</span></label>
                                <textarea value={logContent} onChange={e => setLogContent(e.target.value)} placeholder="협업 및 기록할 내용을 상세히 작성해주세요." className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF] min-h-[150px] resize-none" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">프로젝트</label>
                                    <select value={projectName} onChange={e => setProjectName(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['IOTA 공통', '427 PFV', '816 PFV', '421 Fund'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">목적</label>
                                    <select value={triageType} onChange={e => setTriageType(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['공유', '협업', '리스크 판단', '의사결정'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">상태</label>
                                    <select value={logStatus} onChange={e => setLogStatus(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['신규', '검토중', '진행중', '보류', '완료'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[13px] font-medium text-[#A1A1AA]">중요도</label>
                                    <select value={logPriority} onChange={e => setLogPriority(e.target.value)} className="bg-[#242423] border border-[#3A3A39] text-[#F4F4F1] text-[15px] rounded-lg p-3 outline-none focus:border-[#4C82FF]">
                                        {['높음', '중간', '낮음'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-2">
                                <p className="text-[12px] text-yellow-500 font-medium">관리자 및 부문대표는 항상 조회할 수 있습니다.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
