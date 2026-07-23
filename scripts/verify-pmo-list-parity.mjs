import assert from 'node:assert/strict';
import {
    calculatePmoPriorityScore,
    comparePmoTasksByPriority,
    getPmoMeetingGrade,
    matchesPmoStatusFilter,
} from '../src/utils/pmoTaskPriority.js';

const scoringTask = {
    importance_level: 'PF필수',
    is_blocker: true,
    needs_decision: true,
    support_needed: '지원 필요',
    due_date: '2026-08-31',
    status: '진행중',
    task_type: '정규',
};

assert.equal(calculatePmoPriorityScore(scoringTask, new Date('2026-07-23T09:00:00+09:00')), 75);
assert.equal(calculatePmoPriorityScore({ ...scoringTask, due_date: '2026-07-27' }, new Date('2026-07-23T09:00:00+09:00')), 85);
assert.equal(calculatePmoPriorityScore({ ...scoringTask, due_date: '2026-07-22', status: '지연' }, new Date('2026-07-23T09:00:00+09:00')), 90);
assert.equal(calculatePmoPriorityScore({ ...scoringTask, task_type: '팝업' }, new Date('2026-07-23T09:00:00+09:00')), 75);
assert.deepEqual([24, 25, 39, 40, 59, 60].map(getPmoMeetingGrade), ['D', 'C', 'C', 'B', 'B', 'A']);
assert.equal(matchesPmoStatusFilter({ status: '완료' }, '전체'), false);
assert.equal(matchesPmoStatusFilter({ status: '완료' }, '전체보기'), false);
assert.equal(matchesPmoStatusFilter({ status: '완료' }, '완료'), true);
assert.equal(matchesPmoStatusFilter({ status: '진행중' }, '전체'), true);

const databaseRows = [
    { id: 'task-85', priority_score: 85, created_at: '2026-07-02T00:00:00Z' },
    { id: 'task-75', priority_score: 75, created_at: '2026-07-03T00:00:00Z' },
    { id: 'task-70-due-first', priority_score: 70, due_date: '2026-07-26', created_at: '2026-07-04T00:00:00Z' },
    { id: 'task-70-blocker', priority_score: 70, due_date: '2026-07-27', is_blocker: true, created_at: '2026-07-05T00:00:00Z' },
    { id: 'task-70-decision', priority_score: 70, due_date: '2026-07-27', needs_decision: true, created_at: '2026-07-06T00:00:00Z' },
    { id: 'task-70-recalculates-to-85', priority_score: 70, created_at: '2026-07-01T00:00:00Z', ...scoringTask, due_date: '2026-07-27', is_blocker: false, needs_decision: false },
];

const desktopOrder = [...databaseRows].sort(comparePmoTasksByPriority).map((task) => task.id);
const mobileOrder = [...databaseRows].sort(comparePmoTasksByPriority).map((task) => task.id);
const expectedOrder = ['task-85', 'task-75', 'task-70-due-first', 'task-70-blocker', 'task-70-decision', 'task-70-recalculates-to-85'];

assert.deepEqual(desktopOrder, expectedOrder);
assert.deepEqual(mobileOrder, expectedOrder);
assert.deepEqual(desktopOrder, mobileOrder);

console.log('PMO list parity verified:', expectedOrder.join(' > '));
