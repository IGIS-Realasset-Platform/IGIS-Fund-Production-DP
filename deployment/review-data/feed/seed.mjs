// Snapshot of the post, visible collaborators and stakeholder verified on the
// original open board. Source account IDs and mail addresses are not required
// for choosing colleagues by name and department in this local workspace.
const departments = {
    'CFT 총괄': ['우형석', '이철승', '윤관식', '정조민'],
    기획추진: ['이시정', '이관용', '전기영', '황재민'],
    개발솔루션: ['김대익', '김형주', '채원', '김보성', '장성진', '이정훈', '박봉서', '홍장군', '전승희', '김현진', '남민호'],
    공간솔루션: ['정수명', '김현수', '현철호', '신민호', '방채미', '임수빈', '이지원', '이가현'],
    사업1파트: ['전무경', '권순일', '김제익', '류홍', '박만진', '박일훈', '이정원', '윤주형'],
    사업2파트: ['전혜림', '이종준', '이수정', '조영비', '한찬호', '소현준', '강순용', '박채현', '한수정'],
};
const email = 'jk.jeon@igisam.com';
const company = '현대자동차그룹';
const contact = '정선이';
const category = 'SI(기업)';

export const feedSeed = {
    pilotMembers: Object.entries(departments).flatMap(([org_name, names]) =>
        names.map(staff_name => ({staff_name, org_name, is_active: true, ...(staff_name === '전기영' ? {email} : {})}))),
    stakeholders: [{company_name: company, contact_name: contact, role_category: category}],
    posts: [{
        log_id: 'iota_issue_1793950519262_olc5g',
        feed_kind: 'open',
        writer_name: '전기영',
        writer_staff_id: email,
        work_date: '2026-11-06',
        created_at: '2026-11-06T07:35:19.262Z',
        summary: '[공유] 실무 업무피드 안내',
        raw_text: [
            '자유롭게 이슈를 등록하고 논의하고 협업하세요. ',
            '- 동료 태그 : @박채현 @한찬호 골뱅이로 동료 테그하면 해당 동료에게 알림이 갑니다.',
            '- 열람권한 : 열람 가능 동료를 지정할수 있습니다. 기능 사용시, 열람 권한이 없는 직원은 해당 글의 제목과 본문이 블라인드처리되어 확인 불가합니다.',
            '- 이해관계자 : 이미 등록된 관계자는 자동완성 기능에따라 클릭하여 사용하시거나, 신규로 등록하실수도 있습니다. ',
        ].join('\n'),
        metadata: {
            workspace_code: 'FEED_OPEN',
            workspace_label: '실무 업무피드',
            project_name: 'IOTA 공통',
            triage_type: '공유',
            issue_status: '진행중',
            priority: '높음',
            permissions: {groups: [], individuals: []},
            mentions: ['박채현', '한찬호'].map(label => ({type: 'person', label})),
            reactions: {like: [email]},
            attachedFiles: [],
            comments: [{
                id: 'local-source-comment-1',
                author: '전기영',
                author_email: email,
                created_at: '2026-11-06T07:39:00Z',
                updated_at: '2026-11-06T07:39:00Z',
                text: '댓글 등록 수정 테스트\n댓글 등록 수정 테스트',
                reactions: {like: []},
            }],
        },
        iota_seoul_log_stakeholders: [{sh_name: `${company} - ${contact}`, role_category: category}],
    }],
};
