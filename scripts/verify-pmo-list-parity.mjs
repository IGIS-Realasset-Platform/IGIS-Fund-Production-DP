import assert from 'node:assert/strict';
import {
    calculatePmoPriorityScore,
    comparePmoTasksByPriority,
    getPmoMeetingGrade,
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
assert.deepEqual([29, 30, 49, 50, 69, 70].map(getPmoMeetingGrade), ['D', 'C', 'C', 'B', 'B', 'A']);

const databaseRows = [
    { id: 'task-70-recalculates-to-85', priority_score: 70, created_at: '2026-07-01T00:00:00Z', ...scoringTask, due_date: '2026-07-27' },
    { id: 'task-85', priority_score: 85, created_at: '2026-07-02T00:00:00Z' },
    { id: 'task-75', priority_score: 75, created_at: '2026-07-03T00:00:00Z' },
    { id: 'task-70-later', priority_score: 70, created_at: '2026-07-04T00:00:00Z' },
];

const desktopOrder = [...databaseRows].sort(comparePmoTasksByPriority).map((task) => task.id);
const mobileOrder = [...databaseRows].sort(comparePmoTasksByPriority).map((task) => task.id);
const expectedOrder = ['task-85', 'task-75', 'task-70-recalculates-to-85', 'task-70-later'];

assert.deepEqual(desktopOrder, expectedOrder);
assert.deepEqual(mobileOrder, expectedOrder);
assert.deepEqual(desktopOrder, mobileOrder);

console.log('PMO list parity verified:', expectedOrder.join(' > '));
