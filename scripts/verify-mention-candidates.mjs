import assert from 'node:assert/strict';
import { buildMentionCandidates, resolveMentionedAuthIds } from '../src/utils/mentionHelpers.js';
import { getMemberIotaOrganization, getIotaOrganizationByStaff } from '../src/utils/iotaOrganizations.js';

const members = [
    { staff_name: '양준모', org_name: '펀딩스트레티지2파트', is_active: true, auth_id: null, email: 'yang@example.test' },
    { staff_name: '신규직원', org_name: 'CM부문', is_active: true, auth_id: null },
    { staff_name: '신설부서직원', org_name: '새로운부서', is_active: true, auth_id: 'new-dept-user', email: 'new@example.test' },
    { staff_name: '비활성직원', org_name: '비활성부서', is_active: false, auth_id: 'inactive' },
];
const candidates = buildMentionCandidates(members);
assert(candidates.some(m => m.type === 'person' && m.label === '양준모' && m.organization === 'CM'));
assert(candidates.some(m => m.type === 'person' && m.label === '신규직원'));
assert.equal(candidates.filter(m => m.type === 'department' && m.label === 'CM').length, 1);
assert(candidates.some(m => m.type === 'department' && m.label === '새로운부서'));
assert(!candidates.some(m => m.label.startsWith('비활성')));
assert.equal(getMemberIotaOrganization({ org_name: 'CM부문' }), 'CM');
assert.equal(getMemberIotaOrganization({ workspace_code: 'WS_CM' }), 'CM');
assert.equal(getIotaOrganizationByStaff('양준모'), 'CM');
assert.deepEqual(resolveMentionedAuthIds({members, content:'@양준모 @CM'}), []);
assert.deepEqual(resolveMentionedAuthIds({members:[{...members[0],auth_id:'enrolled-yang'}], content:'@CM'}), ['enrolled-yang']);
assert.deepEqual(resolveMentionedAuthIds({members, content:'@새로운부서'}), ['new-dept-user']);
assert.deepEqual(resolveMentionedAuthIds({members, content:'@신설부서직원',writerEmail:'new@example.test'}), []);
console.log('PASS: 신규 직원·CM·신설 부서 자동완성, 중복 제거, 비활성 제외, 계정 연결 후 부서 멘션 수신');
