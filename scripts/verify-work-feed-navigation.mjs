import assert from 'node:assert/strict';
import { getDefaultWorkFeed, resolveWorkFeed, MOBILE_PRIMARY_TABS, isMobileTabActive } from '../src/utils/workFeedNavigation.js';
import { getWorkFeedPermissions } from '../src/utils/workFeedPermissions.js';
import { getWorkFeedNotificationTarget } from '../src/utils/notificationState.js';

for (const staff_name of ['이철승', '권순일', '양준모', '강순용']) {
    assert.equal(getDefaultWorkFeed({ staff_name }), 'committee');
    assert.equal(resolveWorkFeed({ staff_name }, 'open'), 'open', 'Explicit tab choice wins over director default');
}
for (const member of [null, {staff_name:'전기영', role_code:'master'}, {staff_name:'이시정', organization:'기획추진'}, {staff_name:'추가 열람자', role_code:'director'}]) {
    assert.equal(getDefaultWorkFeed(member), 'open', 'Role or broad access must not select the director landing tab');
    assert.equal(resolveWorkFeed(member, 'committee'), 'committee', 'A direct notification can open the committee tab for additional readers');
}
assert.equal(getDefaultWorkFeed({name:' 권순일 '}), 'committee');
assert.equal(MOBILE_PRIMARY_TABS.length, 4);
assert.deepEqual(MOBILE_PRIMARY_TABS.map(tab=>tab.label), ['통합업무','기능셀','논의/협업','MY']);
assert.equal(isMobileTabActive(1, 0), true, 'Full task/report lists stay inside integrated work navigation');
assert.equal(isMobileTabActive(5, 0), false);
const permissions=getWorkFeedPermissions('committee',{individuals:['추가 열람자'],groups:[]});
assert(permissions.individuals.includes('추가 열람자'), 'Default tab changes must retain additional post readers');
assert(getWorkFeedNotificationTarget({reference_id:'post-1|FEED_COMMITTEE|comment-1'}).includes('logId=post-1&commentId=comment-1'));
console.log('PASS: mobile menus, four director defaults, explicit deep links, and existing reader permissions');
