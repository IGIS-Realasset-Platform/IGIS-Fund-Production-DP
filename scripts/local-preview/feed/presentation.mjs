// The local preview reuses the source JSX. Keep presentation overrides here
// so the source repository and its interactions are independent of this skin.
const avatarFiles = new Set([
    'WorkspaceActivityLog.jsx', 'WorkFeedComments.jsx', 'WorkFeedComposer.jsx', 'WorkFeedReactions.jsx',
]);
const commentIconFiles = new Set([
    'WorkspaceActivityLog.jsx', 'WorkFeedMobileFooter.jsx', 'WorkFeedReactions.jsx',
]);
const previousCommentPath = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z';
const roundedCommentPath = 'M21 11.5a9 9 0 0 1-9 9 9.4 9.4 0 0 1-4-.9L3 21l1.4-4.6A9 9 0 1 1 21 11.5Z';
const dateOptions = "{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}";
const dateWithYear = "{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}";

function replaceSource(code, original, replacement) {
    if (!code.includes(original)) throw Error('원본 피드 표시 구조가 바뀌었습니다. ' + original);
    return code.replace(original, replacement);
}

function stylePostDate(code) {
    code = "import {formatPostDate} from 'local-feed-visuals';\n" + code;
    code = replaceSource(code, 'const yy = String(d.getFullYear()).slice(2);',
        'const yy = String(d.getFullYear()).padStart(4, \'0\');');
    code = replaceSource(code, '{expandedLogs[log.log_id] && log.created_at && (',
        '{!feedKind && expandedLogs[log.log_id] && log.created_at && (');
    code = replaceSource(code, '{feedKind && !mobileMode && <div className="mb-5 flex items-start justify-between gap-6">',
        '{feedKind && <div className={mobileMode ? "mb-3" : "mb-5 flex items-start justify-between gap-6"}>');
    code = replaceSource(code, '{feedStatusActions}\n                                        </div>}',
        '{!mobileMode && feedStatusActions}\n                                        </div>}');
    return replaceSource(code, '<span className="text-[11px] text-[#86868B]">{new Date(log.created_at).toLocaleString(\'ko-KR\', ' + dateOptions + ')}</span>',
        '<span className="studio-feed-author-date text-[11px] text-[#86868B]">{formatPostDate(log.created_at)}</span>');
}

function styleFeedFilters(code) {
    code = "import {FeedColumnFilter} from 'local-feed-visuals';\n"
        + "import {feedProjectLabel, feedProjectFilterValue, feedProjectFilterOptions, useFeedProjectOptions} from 'local-feed-projects';\n" + code;
    code = replaceSource(code, 'import { getDirectorLogCell }', 'import { getDirectorLogCell, DIRECTOR_LOG_LINE_ORDER }');
    code = replaceSource(code, "const [filterPurpose, setFilterPurpose] = useState('');",
        "const [filterProject, setFilterProject] = useState('');\n    const [filterPurpose, setFilterPurpose] = useState('');");
    code = replaceSource(code, "setFilterCell('');\n        setLogSearchQuery('');",
        "setFilterCell('');\n        setFilterProject('');\n        setLogSearchQuery('');");
    code = replaceSource(code, 'const filteredLogs = logs.filter(log => {', `const registeredProjects = useFeedProjectOptions();
    const selectableLogs = feedKind ? logs.filter(log => !log.metadata?.is_task_board && checkUserAccess(log)) : [];
    const projectChoices = feedProjectFilterOptions(registeredProjects, selectableLogs);
    const cellLabel = cell => String(cell || '').replace(/-(LFC|DSC|EMC|SSC|KAM)$/, '');
    const cellChoices = [...new Set([...DIRECTOR_LOG_LINE_ORDER, ...selectableLogs.map(log => getLogCell(log))].map(cellLabel))]
        .filter(Boolean).map(label => ({value: label, label}));
    const selectedProject = projectChoices.some(option => option.value === filterProject) ? filterProject : '';
    const selectedCell = cellChoices.some(option => option.value === filterCell) ? filterCell : '';

    const changeColumnFilter = (setFilter, value) => {
        setFilter(value);
        setCurrentPage(1);
        setExpandedLogs({});
        if (readWorkFeedLocation().logId) writeWorkFeedLocation(feedKind, null, {replace: true});
    };
    const projectFilterControl = <FeedColumnFilter label="프로젝트" options={projectChoices}
        value={selectedProject} onChange={value => changeColumnFilter(setFilterProject, value)} />;
    const cellFilterControl = <FeedColumnFilter label="기능셀" options={cellChoices}
        value={selectedCell} onChange={value => changeColumnFilter(setFilterCell, value)} />;

    const filteredLogs = logs.filter(log => {`);
    code = replaceSource(code, 'if (filterCell && cell !== filterCell) return false;', `if (feedKind && (selectedProject || selectedCell) && !checkUserAccess(log)) return false;
        if (feedKind && selectedProject && feedProjectFilterValue(log) !== selectedProject) return false;
        if (feedKind ? selectedCell && cellLabel(cell) !== selectedCell : filterCell && cell !== filterCell) return false;`);
    code = replaceSource(code, '{/* Header Row (Only for workspace mode) */}', `{feedKind && mobileMode && <div className="studio-feed-mobile-filters">
                    {projectFilterControl}{cellFilterControl}
                </div>}
                {/* Header Row (Only for workspace mode) */}`);
    code = replaceSource(code, '<span className="text-[13px] font-bold text-[#86868B]">프로젝트</span>',
        '{feedKind ? projectFilterControl : <span className="text-[13px] font-bold text-[#86868B]">프로젝트</span>}');
    code = replaceSource(code, '<div className="text-[13px] font-bold text-[#86868B] px-[2px] py-[4px] text-center w-[60px]">\n                                        기능셀\n                                    </div>',
        '{feedKind ? cellFilterControl : <div className="text-[13px] font-bold text-[#86868B] px-[2px] py-[4px] text-center w-[60px]">기능셀</div>}');
    const start = code.indexOf("let projName = '427 PFV';");
    const end = code.indexOf('let textColorClass', start);
    if (start === -1 || end === -1) throw Error('원본 피드 프로젝트 표시 구조가 바뀌었습니다.');
    code = code.slice(0, start) + 'const projName = feedProjectLabel(log);\n                                        ' + code.slice(end);
    return replaceSource(code, '(isTaskBoard ? \'등록된 글이 없습니다.\' : \'등록된 업무가 없습니다.\')',
        '(feedKind && (selectedProject || selectedCell) ? \'선택한 조건에 맞는 게시글이 없습니다.\' : isTaskBoard ? \'등록된 글이 없습니다.\' : \'등록된 업무가 없습니다.\')');
}

function styleBoard(code) {
    code = replaceSource(code, 'const [masterStakeholders, setMasterStakeholders] = useState([]);',
        'const [masterStakeholders, setMasterStakeholders] = useState([]);\n    const [sharedDirectoryStatus, setSharedDirectoryStatus] = useState(null);');
    code = replaceSource(code, 'if (!membersOnly) setMasterStakeholders(directory.stakeholders);',
        'if (!membersOnly) {\n                setMasterStakeholders(directory.stakeholders);\n                setSharedDirectoryStatus(directory.sharedDirectoryStatus);\n            }');
    code = replaceSource(code, '{/* Log Viewer */}',
        `{feedKind && sharedDirectoryStatus && sharedDirectoryStatus !== 'fresh' && (
                <div role="status" className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-[#86868B]">
                    {sharedDirectoryStatus === 'cached' ? '최근에 조회한 공용 이해관계자를 표시합니다.' : '이오타 공용 이해관계자를 불러오지 못했습니다.'}
                    <button type="button" className="underline" onClick={() => fetchMasterStakeholders(true)}>다시 조회</button>
                </div>
            )}{/* Log Viewer */}`);
    code = replaceSource(code, 'feedKind && mobileMode ? "mb-[40px]"', 'feedKind ? "studio-feed-board mb-[40px]"');
    code = replaceSource(code, "feedKind && mobileMode ? 'min-w-0 flex-1' : `${feedKind ? 'rounded-[20px]' : 'rounded-[12px]'} min-w-0 p-[1px]",
        "feedKind ? 'studio-feed-detail min-w-0 flex-1' : `rounded-[12px] min-w-0 p-[1px]");
    code = replaceSource(code, "rounded-none shadow-[inset_0_0_0_1px_#82afb9]", "rounded-none");
    code = replaceSource(code, 'w-full h-full bg-transparent py-4', 'w-full h-full bg-transparent p-3');
    code = replaceSource(code, 'rounded-[19px] w-full h-full px-8 py-6', 'rounded-[18px] w-full h-full px-8 pt-6 pb-8');
    code = styleFeedFilters(stylePostDate(code));
    code = replaceSource(code, '<div className={`py-[6px] border rounded-[8px] text-[12px] font-bold ${textColorClass}',
        '<div title={feedKind ? projName : undefined} className={`${feedKind ? "truncate px-2" : ""} py-[6px] border rounded-[8px] text-[12px] font-bold ${textColorClass}');
    return replaceSource(code, '<span className="flex shrink-0 items-center gap-1.5"><svg width="13" height="13"',
        '<span className="flex shrink-0 items-center gap-1.5"><svg width="20" height="20" aria-hidden="true"');
}

function styleFeedProjectForm(code) {
    code = "import {resolveFeedProject, savedFeedProject, useFeedProjectOptions} from 'local-feed-projects';\n" + code;
    code = replaceSource(code, "const [projectId, setProjectId] = useState('IOTA_COMMON');",
        "const [projectId, setProjectId] = useState(() => feedKind && editMode ? savedFeedProject(initialData?.metadata).value : 'IOTA_COMMON');\n    const projectOptions = useFeedProjectOptions(editMode ? initialData?.metadata : null, projectId);");
    code = replaceSource(code, "if (meta.project_name === 'IOTA 공통') setProjectId('IOTA_COMMON');",
        "if (feedKind) setProjectId(savedFeedProject(meta).value);\n                else if (meta.project_name === 'IOTA 공통') setProjectId('IOTA_COMMON');");
    code = replaceSource(code, 'const logData = {',
        'const feedProject = feedKind ? resolveFeedProject(projectId, editMode ? initialData?.metadata : null) : null;\n            const logData = {');
    code = replaceSource(code, "project_name: projectId === 'IOTA_COMMON'",
        "...(feedProject ? {project_id: feedProject.projectId} : {}),\n                    project_name: feedProject ? feedProject.label : projectId === 'IOTA_COMMON'");
    code = replaceSource(code, 'if (isSubmitting || registrationPending.current) return;',
        `if (isSubmitting || registrationPending.current) return;
        if (feedKind && !projectOptions.some(option => option.value === projectId && !option.disabled)) {
            alert('프로젝트 목록에서 다시 선택해 주세요.');
            return;
        }`);
    return replaceSource(code, 'fields={{projectId, triageType,', 'fields={{projectId, projectOptions, triageType,');
}

export function applyFeedPresentation(file, code) {
    if (avatarFiles.has(file)) {
        code = "import {FeedAvatar} from 'local-feed-visuals';\n" + code.replace(/<img(?=\s+src=\{getProfileImageSrc\()/g, '<FeedAvatar');
    }
    if (commentIconFiles.has(file)) {
        code = code.replaceAll('d="' + previousCommentPath + '"', 'd="' + roundedCommentPath + '" strokeLinecap="round" strokeLinejoin="round"');
    }
    switch (file) {
        case 'WorkspaceActivityLog.jsx':
            return styleBoard(code);
        case 'LogWriteBox.jsx':
            return styleFeedProjectForm(replaceSource(code, 'compactMobileTrigger ? "w-full mb-1" :', 'compactMobileTrigger ? "w-full mb-1" : feedKind ? "studio-feed-composer w-full" :'));
        case 'WorkFeedComposer.jsx':
            code = replaceSource(code, "options={[{value:'IOTA_COMMON',label:'IOTA 공통'},{value:'P00030',label:'427 PFV'},{value:'P00037',label:'816 PFV'},{value:'112614',label:'421 Fund'},{value:'EXTERNAL',label:'외부'}]}",
                'options={fields.projectOptions}');
            code = replaceSource(code, '<option key={option.value || option} value={option.value || option}>',
                '<option key={option.value || option} value={option.value || option} disabled={option.disabled}>');
            code = replaceSource(code, 'rounded-[8px] px-2 text-[13px] font-semibold text-[#bcdbdb] transition-colors hover:bg-white/5', 'studio-feed-write-label px-3 text-[13px]');
            code = replaceSource(code, 'rounded-[23px] bg-[#262626] py-[13px] text-left hover:bg-[#2a2a2a]', 'studio-feed-write-trigger py-[13px] text-left');
            return replaceSource(code, 'shrink-0 rounded-[8px] border border-[#83adb5] bg-[#222] py-2 text-[13px] font-black text-[#e5e5e5]', 'studio-feed-write-label shrink-0 py-2 text-[13px]');
        case 'WorkFeedComments.jsx':
            code = replaceSource(code, dateOptions, dateWithYear);
            return replaceSource(code, '<div className="mt-4"><CommentInput mobileMode={mobileMode} label="댓글 작성"', '<div className="studio-feed-comment-form mt-4"><CommentInput mobileMode={mobileMode} label="댓글 작성"');
        case 'WorkFeedReactions.jsx':
            code = replaceSource(code, "size = 13, active = false, strokeWidth = 2", "size = 13, strokeWidth = 2");
            code = replaceSource(code, "fill={active ? 'currentColor' : 'none'}", 'fill="none"');
            code = replaceSource(code, '<FeedReactionIcon active={active} />', '<FeedReactionIcon size={compact ? 18 : 22} />');
            return replaceSource(code, 'aria-pressed={active}', 'aria-pressed={active} data-has-likes={emails.length > 0}');
        case 'WorkFeedMobileFooter.jsx':
            return replaceSource(code, '<svg width="12" height="12"', '<svg width="20" height="20"');
        default:
            return code;
    }
}
