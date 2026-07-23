import assert from 'node:assert/strict';
import {
    compareDirectorWorkflowLogs,
    getDirectorLogLineOptions,
    getDirectorWorkspacePath,
    normalizeDirectorWorkflowLog,
} from '../src/utils/directorWorkflowLogs.js';

const currentApiShape = normalizeDirectorWorkflowLog({
    id: 'notion-1',
    writer_name: '권순일',
    line: 'B Line',
    task_type: '프로젝트',
    title: '-',
    summary: '광장 임차조건 확정\n후속 협의 필요',
    work_date: '2026-07-16',
});

assert.equal(currentApiShape.line, '사업1파트');
assert.equal(currentApiShape.source_line, 'B Line');
assert.equal(currentApiShape.category, '프로젝트');
assert.equal(currentApiShape.title, '광장 임차조건 확정');
assert.equal(currentApiShape.display_text, '광장 임차조건 확정\n후속 협의 필요');

assert.equal(getDirectorWorkspacePath({ metadata: { workspace_code: 'WS_PM1' }, writer_name: '권순일' }), 'platform/iotaseoul/workspace/pm1');
assert.equal(getDirectorWorkspacePath({ metadata: { workspace_code: 'WS_PM2' }, writer_name: '강순용' }), 'platform/iotaseoul/workspace/pm2');
assert.equal(getDirectorWorkspacePath({ metadata: { workspace_code: 'WS_PM' }, writer_name: '강순용' }), 'platform/iotaseoul/workspace/pm2');
assert.equal(getDirectorWorkspacePath({ metadata: { workspace_code: 'WS_PMO' }, writer_name: '전기영' }), null);

const sortedIds = [
    { id: 'older', work_date: '2026-07-10' },
    { id: 'latest-a', work_date: '2026-07-16', updated_at: '2026-07-16T09:00:00Z' },
    { id: 'latest-b', work_date: '2026-07-16', updated_at: '2026-07-16T10:00:00Z' },
].sort(compareDirectorWorkflowLogs).map((log) => log.id);

assert.deepEqual(sortedIds, ['latest-b', 'latest-a', 'older']);
assert.deepEqual(
    getDirectorLogLineOptions([{ line: '공통' }, { line: '사업 PM 2' }, { line: '사업 PM 1' }]),
    ['전체', '사업1파트', '사업2파트', '공통']
);

console.log('Director workflow log normalization verified.');
