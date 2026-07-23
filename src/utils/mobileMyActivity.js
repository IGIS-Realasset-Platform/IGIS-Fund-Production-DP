import {
    formatDirectorLogText,
    getDirectorLogCell,
    getDirectorLogTitle,
} from './directorWorkflowLogs.js';
import { normalizeIotaOrganization } from './iotaOrganizations.js';

const getText = (value) => String(value || '').trim();

const getFirstContentLine = (value) => getText(value)
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) || '';

const getTimestamp = (value) => {
    if (!value) return 0;
    const text = String(value).trim();
    const normalizedValue = /^\d{8}$/.test(text)
        ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00+09:00`
        : text;
    const timestamp = new Date(normalizedValue).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeEmail = (value) => getText(value).toLowerCase();

const normalizePersonName = (value) => getText(value)
    .split(/\s*[-/|]\s*/)[0]
    .trim();

const isSamePerson = ({ name, email }, identity) => {
    const candidateEmail = normalizeEmail(email);
    if (candidateEmail && identity.email && candidateEmail === identity.email) return true;

    const candidateName = normalizePersonName(name);
    return Boolean(candidateName && identity.name && candidateName === identity.name);
};

const containsMention = (value, name) => {
    if (!name) return false;
    return getText(value).toLowerCase().includes(`@${name}`.toLowerCase());
};

const normalizeDepartmentName = (value) => {
    const department = typeof value === 'object' ? value?.dept_name : value;
    return normalizeIotaOrganization(department, '공통');
};

const getTaskText = (task) => [
    task.task_name,
    task.task_purpose,
    task.deliverables,
    task.next_action,
    task.support_needed,
    task.notes,
    task.agenda_reason,
].filter(Boolean).join('\n');

const getTaskMap = (tasks) => new Map(
    (tasks || []).filter((task) => task?.id).map((task) => [String(task.id), task])
);

const getLogSource = (log, taskMap) => {
    const metadata = log?.metadata || {};
    const taskId = metadata.task_id ? String(metadata.task_id) : '';
    const task = taskId ? taskMap.get(taskId) : null;
    const isTaskBoard = Boolean(metadata.is_task_board || taskId);
    const isPopup = task?.task_type === '팝업'
        || getText(metadata.workspace_label).includes('단발성 업무 요청');

    if (isTaskBoard) {
        return {
            sourceType: isPopup ? 'popup' : 'task',
            sourceLabel: isPopup ? '단발성 업무 글' : '통합업무 글',
            contextTitle: task?.task_name || getText(metadata.workspace_label) || '업무 상세',
            contextLabel: task?.project_code || metadata.task_project || 'IOTA SEOUL',
            taskId,
            taskType: isPopup ? '팝업' : task?.task_type || '정규',
            navigationType: isPopup ? 'popup' : 'task',
            department: normalizeDepartmentName(task?.lead_dept?.dept_name || task?.lead_dept_code),
        };
    }

    const workspaceLabel = getText(metadata.workspace_label);
    if (metadata.workspace_code || workspaceLabel) {
        return {
            sourceType: 'workspace',
            sourceLabel: '워크스페이스 게시글',
            contextTitle: workspaceLabel || '워크스페이스',
            contextLabel: getDirectorLogCell(log),
            logId: log.log_id || log.id,
            workspaceCode: metadata.workspace_code || '',
            navigationType: 'workspace',
            department: getDirectorLogCell(log),
        };
    }

    return {
        sourceType: 'other',
        sourceLabel: '업무 게시글',
        contextTitle: 'IOTA SEOUL',
        contextLabel: getDirectorLogCell(log),
        logId: log.log_id || log.id,
        navigationType: null,
        department: getDirectorLogCell(log),
    };
};

const normalizeDbPost = (log, taskMap) => {
    const source = getLogSource(log, taskMap);
    const logId = String(log.log_id || log.id || '');
    const content = formatDirectorLogText(log.raw_text || log.body_text || log.summary || '');
    const dateValue = log.created_at || log.updated_at || log.work_date;

    return {
        id: `post:log:${logId}`,
        kind: 'post',
        title: getText(log.summary || log.title) || getFirstContentLine(content) || '업무 게시글',
        content,
        authorName: getText(log.writer_name) || '작성자 미상',
        authorEmail: getText(log.writer_staff_id || log.writer_email),
        dateValue,
        timestamp: getTimestamp(dateValue),
        logId,
        sourceUrl: getText(log.source_url),
        recordType: 'db-log',
        ...source,
    };
};

const normalizeDirectorPost = (log) => {
    const logId = String(log.id || log.log_id || '');
    const dateValue = log.updated_at || log.created_at || log.work_date;

    return {
        id: `post:director:${logId}`,
        kind: 'post',
        sourceType: 'director',
        sourceLabel: 'Director 업무보고',
        contextTitle: getText(log.category || log.task_type) || 'Director T5T',
        contextLabel: getDirectorLogCell(log),
        title: getDirectorLogTitle(log),
        content: formatDirectorLogText(log.display_text || log.raw_text || log.body_text || log.summary || ''),
        authorName: getText(log.writer_name) || '작성자 미상',
        authorEmail: getText(log.writer_email || log.writer_staff_id),
        dateValue,
        timestamp: getTimestamp(dateValue),
        directorLogId: logId,
        sourceUrl: getText(log.source_url),
        recordType: 'director-log',
        navigationType: 'director',
        department: getDirectorLogCell(log),
    };
};

const normalizeTaskPost = (task) => {
    const taskId = String(task.id || '');
    const isPopup = task.task_type === '팝업';
    const dateValue = task.updated_at || task.created_at || task.request_date;

    return {
        id: `post:task:${taskId}`,
        kind: 'post',
        sourceType: isPopup ? 'popup' : 'task',
        sourceLabel: isPopup ? '단발성 업무' : '통합업무',
        contextTitle: task.project_code || 'IOTA SEOUL',
        contextLabel: normalizeDepartmentName(task.lead_dept?.dept_name || task.lead_dept_code),
        title: getText(task.task_name) || '제목 없는 업무',
        content: formatDirectorLogText(getTaskText(task)),
        authorName: normalizePersonName(task.requester) || '등록자',
        authorEmail: getText(task.created_by_email),
        dateValue,
        timestamp: getTimestamp(dateValue),
        taskId,
        taskType: task.task_type || '정규',
        recordType: 'pmo-task',
        navigationType: isPopup ? 'popup' : 'task',
        department: normalizeDepartmentName(task.lead_dept?.dept_name || task.lead_dept_code),
    };
};

const normalizeComment = (comment, parentPost, prefix) => {
    const commentId = String(comment.id || `${parentPost.logId}-${comment.created_at || comment.text}`);
    const dateValue = comment.created_at || parentPost.dateValue;

    return {
        ...parentPost,
        id: `${prefix}:comment:${parentPost.logId}:${commentId}`,
        kind: prefix === 'mention' ? 'mention' : 'comment',
        sourceLabel: prefix === 'mention'
            ? `${parentPost.sourceLabel} 댓글 언급`
            : `${parentPost.sourceLabel} 댓글`,
        title: parentPost.title,
        content: getText(comment.text),
        authorName: getText(comment.author) || '작성자 미상',
        authorEmail: getText(comment.author_email),
        dateValue,
        timestamp: getTimestamp(dateValue),
        parentTitle: parentPost.contextTitle,
        commentId,
    };
};

const isStakeholderMention = (log, name) => (log.iota_seoul_log_stakeholders || [])
    .some((stakeholder) => normalizePersonName(stakeholder.sh_name) === name);

const isTaskAuthoredBy = (task, identity) => {
    if (normalizeEmail(task.created_by_email) === identity.email && identity.email) return true;
    if (task.task_type !== '팝업') return false;
    return normalizePersonName(task.requester) === identity.name && Boolean(identity.name);
};

const sortActivities = (activities) => activities.sort((firstActivity, secondActivity) => (
    secondActivity.timestamp - firstActivity.timestamp
    || firstActivity.id.localeCompare(secondActivity.id)
));

export const buildMobileMyActivities = ({
    dbLogs = [],
    directorLogs = [],
    pmoTasks = [],
    memberInfo,
}) => {
    const identity = {
        name: getText(memberInfo?.staff_name || memberInfo?.name),
        email: normalizeEmail(memberInfo?.email),
    };

    if (!identity.name && !identity.email) {
        return { posts: [], comments: [], mentions: [] };
    }

    const taskMap = getTaskMap(pmoTasks);
    const dbPosts = dbLogs
        .filter((log) => log?.log_id || log?.id)
        .map((log) => normalizeDbPost(log, taskMap));
    const dbLogIds = new Set(dbPosts.map((post) => post.logId));
    const directorPosts = directorLogs
        .filter((log) => log?.id || log?.log_id)
        .map(normalizeDirectorPost)
        .filter((post) => !dbLogIds.has(post.directorLogId));
    const taskPosts = pmoTasks
        .filter((task) => task?.id)
        .map(normalizeTaskPost);

    const posts = [
        ...dbPosts.filter((post) => isSamePerson({
            name: post.authorName,
            email: post.authorEmail,
        }, identity)),
        ...directorPosts.filter((post) => isSamePerson({
            name: post.authorName,
            email: post.authorEmail,
        }, identity)),
        ...taskPosts.filter((post) => {
            const task = taskMap.get(post.taskId);
            return task && isTaskAuthoredBy(task, identity);
        }),
    ];

    const comments = [];
    const mentions = [];

    dbLogs.forEach((log) => {
        const parentPost = normalizeDbPost(log, taskMap);
        const logText = [
            parentPost.title,
            parentPost.content,
        ].join('\n');

        if (
            containsMention(logText, identity.name)
            || isStakeholderMention(log, identity.name)
        ) {
            mentions.push({
                ...parentPost,
                id: `mention:log:${parentPost.logId}`,
                kind: 'mention',
            });
        }

        const logComments = Array.isArray(log.metadata?.comments)
            ? log.metadata.comments
            : [];

        logComments.forEach((comment) => {
            if (isSamePerson({
                name: comment.author,
                email: comment.author_email,
            }, identity)) {
                comments.push(normalizeComment(comment, parentPost, 'my'));
            }

            if (containsMention(comment.text, identity.name)) {
                mentions.push(normalizeComment(comment, parentPost, 'mention'));
            }
        });
    });

    directorPosts.forEach((post) => {
        if (containsMention(`${post.title}\n${post.content}`, identity.name)) {
            mentions.push({
                ...post,
                id: `mention:director:${post.directorLogId}`,
                kind: 'mention',
            });
        }
    });

    taskPosts.forEach((post) => {
        const task = taskMap.get(post.taskId);
        if (task && containsMention(getTaskText(task), identity.name)) {
            mentions.push({
                ...post,
                id: `mention:task:${post.taskId}`,
                kind: 'mention',
            });
        }
    });

    return {
        posts: sortActivities(posts),
        comments: sortActivities(comments),
        mentions: sortActivities(mentions),
    };
};

export const filterMobileMyActivities = (activities, query) => {
    const normalizedQuery = getText(query).toLowerCase();
    if (!normalizedQuery) return activities;

    return activities.filter((activity) => [
        activity.title,
        activity.content,
        activity.authorName,
        activity.sourceLabel,
        activity.contextTitle,
        activity.contextLabel,
    ].some((value) => getText(value).toLowerCase().includes(normalizedQuery)));
};
