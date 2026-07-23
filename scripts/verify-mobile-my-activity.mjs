import assert from 'node:assert/strict';
import { buildMobileMyActivities } from '../src/utils/mobileMyActivity.js';

const memberInfo = {
    staff_name: '전기영',
    email: 'director@example.com',
};

const pmoTasks = [
    {
        id: 'task-1',
        task_name: '통합 업무',
        task_type: '정규',
        project_code: 'IOTA_SEOUL',
        assignee: '전기영',
    },
    {
        id: 'popup-1',
        task_name: '단발성 요청',
        task_type: '팝업',
        requester: '전기영 / 기획추진',
        created_by_email: 'director@example.com',
        task_purpose: '@전기영 검토 필요',
        created_at: '2026-07-23T09:00:00Z',
    },
];

const dbLogs = [
    {
        log_id: 'workspace-1',
        writer_name: '전기영',
        writer_staff_id: 'director@example.com',
        summary: '내 워크스페이스 글',
        raw_text: '업무 메시지 본문',
        created_at: '2026-07-23T10:00:00Z',
        metadata: {
            workspace_code: 'WS_PM2',
            workspace_label: '사업 PM 2',
            comments: [{
                id: 'comment-1',
                author: '전기영',
                author_email: 'director@example.com',
                text: '내 댓글',
                created_at: '2026-07-23T10:10:00Z',
            }],
        },
    },
    {
        log_id: 'task-log-1',
        writer_name: '전기영',
        writer_staff_id: 'director@example.com',
        summary: '통합업무 상세 글',
        raw_text: '업무 진행 내용',
        created_at: '2026-07-23T11:00:00Z',
        metadata: {
            is_task_board: true,
            task_id: 'task-1',
            workspace_code: 'WS_PMO',
            workspace_label: '통합업무보드',
            comments: [{
                id: 'comment-2',
                author: '한찬호',
                author_email: 'other@example.com',
                text: '@전기영 확인 부탁드립니다.',
                created_at: '2026-07-23T11:10:00Z',
            }],
        },
    },
    {
        log_id: 'mentioned-1',
        writer_name: '한찬호',
        summary: '협업 요청',
        raw_text: '관련 내용을 공유합니다.',
        created_at: '2026-07-23T12:00:00Z',
        metadata: {
            workspace_code: 'WS_PM2',
            workspace_label: '사업 PM 2',
        },
        iota_seoul_log_stakeholders: [{
            sh_name: '전기영',
            role_category: '협업',
        }],
    },
];

const directorLogs = [{
    id: 'director-1',
    writer_name: '전기영',
    title: 'Director 보고',
    summary: '보고 내용',
    work_date: '2026-07-23',
    line: '기획추진',
}];

const activities = buildMobileMyActivities({
    dbLogs,
    directorLogs,
    pmoTasks,
    memberInfo,
});

assert.deepEqual(
    activities.posts.map((activity) => activity.id).sort(),
    [
        'post:director:director-1',
        'post:log:task-log-1',
        'post:log:workspace-1',
        'post:task:popup-1',
    ].sort()
);
assert.equal(activities.comments.length, 1);
assert.equal(activities.comments[0].content, '내 댓글');
assert.equal(activities.mentions.length, 3);
assert.ok(activities.mentions.some((activity) => activity.id === 'mention:comment:task-log-1:comment-2'));
assert.ok(activities.mentions.some((activity) => activity.id === 'mention:log:mentioned-1'));
assert.ok(activities.mentions.some((activity) => activity.id === 'mention:task:popup-1'));
assert.ok(!activities.posts.some((activity) => activity.id === 'post:task:task-1'));

console.log('Mobile My activity coverage verified.');
