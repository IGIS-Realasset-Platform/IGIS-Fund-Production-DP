export const parseTaskBoolean = (value) => (
    value === true
    || value === 'Y'
    || value === 'y'
    || value === 'yes'
    || value === 1
    || value === '1'
    || value === 'true'
);

const DUE_DATE_MIGRATION_CUTOFF = '2026-07-20';
const DUE_DATE_MIGRATION_TARGET = '2026-07-27';

const formatLocalDateKey = (date) => (
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const getDateKey = (value) => {
    if (!value) return '';

    const rawValue = String(value).trim();
    const dateOnlyMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateOnlyMatch) return dateOnlyMatch[1];

    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? '' : formatLocalDateKey(date);
};

const getDayDifference = (fromDateKey, toDateKey) => {
    const [fromYear, fromMonth, fromDay] = fromDateKey.split('-').map(Number);
    const [toYear, toMonth, toDay] = toDateKey.split('-').map(Number);
    const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
    const toTime = Date.UTC(toYear, toMonth - 1, toDay);
    return Math.round((toTime - fromTime) / 86400000);
};

export const normalizePmoTaskPriorityState = (task, now = new Date()) => {
    if (!task) return task;

    const normalizedTask = { ...task };
    const originalDueDateKey = getDateKey(normalizedTask.due_date);
    let dueDateKey = originalDueDateKey;
    let status = normalizedTask.status || '진행중';

    if (dueDateKey && dueDateKey < DUE_DATE_MIGRATION_CUTOFF) {
        dueDateKey = DUE_DATE_MIGRATION_TARGET;
        normalizedTask.due_date = DUE_DATE_MIGRATION_TARGET;
        if (status === '지연') status = '진행중';
    }

    const todayKey = formatLocalDateKey(now);
    if (dueDateKey && status !== '완료' && status !== '지연' && dueDateKey < todayKey) {
        status = '지연';
    }

    normalizedTask.status = status;
    return normalizedTask;
};

export const calculatePmoPriorityScore = (task, now = new Date()) => {
    if (!task) return 0;

    const normalizedTask = normalizePmoTaskPriorityState(task, now);
    let score = 0;
    const importance = normalizedTask.importance_level || '중간';

    if (importance === '준공필수') {
        score += 30;
    } else if (importance === 'PF필수') {
        score += 25;
    }

    if (parseTaskBoolean(normalizedTask.is_blocker)) {
        score += 20;
    }

    if (parseTaskBoolean(normalizedTask.needs_decision)) {
        score += 15;
    }

    const support = normalizedTask.support_needed || '';
    const cleanSupport = String(support).trim().toLowerCase();
    const invalidSupportValues = ['', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'];

    if (cleanSupport && !invalidSupportValues.includes(cleanSupport)) {
        score += 15;
    }

    let delayScore = 0;
    const dueDateKey = getDateKey(normalizedTask.due_date);
    const status = normalizedTask.status || '진행중';

    if (status === '지연') {
        delayScore = 15;
    }

    if (dueDateKey && status !== '완료') {
        const daysUntilDue = getDayDifference(formatLocalDateKey(now), dueDateKey);
        if (daysUntilDue < 0) {
            delayScore = Math.max(delayScore, 15);
        } else if (daysUntilDue <= 7) {
            delayScore = Math.max(delayScore, 10);
        }
    }

    score += delayScore;

    return score;
};

export const getPmoMeetingGrade = (score) => {
    if (score >= 60) return 'A';
    if (score >= 40) return 'B';
    if (score >= 25) return 'C';
    return 'D';
};

export const getStoredPmoPriorityScore = (task) => {
    const score = Number(task?.priority_score);
    return Number.isFinite(score) ? score : 0;
};

export const matchesPmoStatusFilter = (task, selectedStatus) => {
    const status = task?.status || '진행중';
    if (selectedStatus === '전체' || selectedStatus === '전체보기') return status !== '완료';
    return status === selectedStatus;
};

const getCreatedAtTime = (task) => {
    const createdAtTime = new Date(task?.created_at || 0).getTime();
    return Number.isNaN(createdAtTime) ? 0 : createdAtTime;
};

const getDueDateTime = (task) => {
    const dueDateKey = getDateKey(task?.due_date);
    if (!dueDateKey) return Number.POSITIVE_INFINITY;
    const dueDateTime = Date.parse(`${dueDateKey}T00:00:00Z`);
    return Number.isNaN(dueDateTime) ? Number.POSITIVE_INFINITY : dueDateTime;
};

export const comparePmoTasksByCreatedAt = (firstTask, secondTask) => {
    const createdAtDifference = getCreatedAtTime(firstTask) - getCreatedAtTime(secondTask);
    if (createdAtDifference !== 0) return createdAtDifference;
    return String(firstTask?.id || '').localeCompare(String(secondTask?.id || ''));
};

export const comparePmoTasksByPriority = (firstTask, secondTask, order = 'desc') => {
    const scoreDifference = getStoredPmoPriorityScore(secondTask) - getStoredPmoPriorityScore(firstTask);
    if (scoreDifference !== 0) return order === 'asc' ? -scoreDifference : scoreDifference;

    const firstDueDate = getDueDateTime(firstTask);
    const secondDueDate = getDueDateTime(secondTask);
    if (firstDueDate !== secondDueDate) return firstDueDate - secondDueDate;

    const blockerDifference = Number(parseTaskBoolean(secondTask?.is_blocker)) - Number(parseTaskBoolean(firstTask?.is_blocker));
    if (blockerDifference !== 0) return blockerDifference;

    const decisionDifference = Number(parseTaskBoolean(secondTask?.needs_decision)) - Number(parseTaskBoolean(firstTask?.needs_decision));
    if (decisionDifference !== 0) return decisionDifference;

    return comparePmoTasksByCreatedAt(firstTask, secondTask);
};
