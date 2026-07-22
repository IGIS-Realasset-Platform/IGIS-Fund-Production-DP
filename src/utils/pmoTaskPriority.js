export const parseTaskBoolean = (value) => (
    value === true
    || value === 'Y'
    || value === 'y'
    || value === 'yes'
    || value === 1
    || value === '1'
    || value === 'true'
);

export const calculatePmoPriorityScore = (task, fallbackItem = {}) => {
    if (!task) return 0;

    let score = 0;
    const importance = task.importance_level || fallbackItem.importance_level || '중간';

    if (importance === '준공필수') {
        score += 30;
    } else if (importance === 'PF필수') {
        score += 25;
    }

    if (parseTaskBoolean(task.is_blocker !== undefined ? task.is_blocker : fallbackItem.is_blocker)) {
        score += 20;
    }

    if (parseTaskBoolean(task.needs_decision !== undefined ? task.needs_decision : fallbackItem.needs_decision)) {
        score += 15;
    }

    const support = task.support_needed || fallbackItem.support_needed || '';
    const cleanSupport = String(support).trim().toLowerCase();
    const invalidSupportValues = ['', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'];

    if (cleanSupport && !invalidSupportValues.includes(cleanSupport)) {
        score += 15;
    }

    let delayScore = 0;
    const dueDateString = task.due_date || fallbackItem.due_date || '';
    const status = task.status || fallbackItem.status || '진행중';

    if (status === '지연') {
        delayScore = 15;
    }

    if (String(dueDateString).trim() !== '' && status !== '완료') {
        const dueDate = new Date(dueDateString);

        if (!Number.isNaN(dueDate.getTime())) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                delayScore = Math.max(delayScore, 15);
            } else {
                const limitDate = new Date(today);
                limitDate.setDate(today.getDate() + 7);

                if (dueDate <= limitDate) {
                    delayScore = Math.max(delayScore, 10);
                }
            }
        }
    }

    score += delayScore;

    const taskType = task.task_type || fallbackItem.task_type || '정규';
    if (taskType === '팝업') {
        score += 5;
    }

    return score;
};
