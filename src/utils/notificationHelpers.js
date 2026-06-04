import { supabase } from './supabaseClient';

const VIP_AUTH_IDS = [
    '4d855717-1e30-4c50-9c5a-621740e686b6', // 이시정
    '492127cc-eb2a-4522-bf25-68640ebc326b', // 이관용
    '9ba52276-9705-4230-a12d-984f999833f4'  // 전기영
];

export const notifyVIPsOnTaskCreation = async (taskId, taskName, workspaceName, workspaceCode) => {
    if (!taskName) return;
    
    const notificationPayload = VIP_AUTH_IDS.map(userId => ({
        user_id: userId,
        title: `[${workspaceName}] 신규 Task 등록`,
        body: `새로운 Task가 등록되었습니다: ${taskName}`,
        type: 'task',
        reference_id: taskId && workspaceCode ? `${taskId}|${workspaceCode}` : null,
        is_read: false,
        created_at: new Date().toISOString()
    }));

    try {
        const { error } = await supabase
            .from('iota_notifications')
            .insert(notificationPayload);
            
        if (error) {
            console.error('Failed to insert VIP notifications:', error);
        } else {
            console.log('VIP notifications sent for task:', taskName);
        }
    } catch (err) {
        console.error('Error in notifyVIPsOnTaskCreation:', err);
    }
};

/**
 * 협업글(Log) 생성 시 워크스페이스 소속원 및 마스터/디렉터에게 알림 전송 (비동기 백그라운드 구동 권장)
 */
export const notifyMembersOnLogCreation = async (logId, logContent, workspace, writerEmail) => {
    if (!logId || !workspace?.code) return;

    try {
        // 1. 활성화 상태이고 auth_id가 매핑된 멤버 전체 조회
        const { data: members, error: memberError } = await supabase
            .from('iota_seoul_pilot_members')
            .select('auth_id, email, staff_name, org_name, role_code, workspace_code')
            .eq('is_active', true)
            .not('auth_id', 'is', null);

        if (memberError) {
            console.error('Failed to fetch members for notifications:', memberError);
            return;
        }

        // 2. 작성자 정보 및 멘션(@) 파싱
        const writerMember = members.find(m => m.email && writerEmail && m.email.toLowerCase() === writerEmail.toLowerCase());
        const writerName = writerMember ? writerMember.staff_name : '누군가';

        // 본문에서 @이름 패턴 추출
        const mentionMatches = [...logContent.matchAll(/@([가-힣a-zA-Z0-9]+)/g)].map(m => m[1]);
        const mentionedMembers = members.filter(member => 
            mentionMatches.includes(member.staff_name) &&
            member.email && writerEmail && member.email.toLowerCase() !== writerEmail.toLowerCase()
        );
        const mentionedAuthIds = [...new Set(mentionedMembers.map(m => m.auth_id))];

        // 3. 수신자 매핑 알고리즘:
        // - 소속 워크스페이스 멤버 (workspace.orgNames 가 member.org_name을 포함하거나 member.workspace_code === workspace.code)
        // - 또는 director / master 권한 보유자
        // - 단, 작성자 본인(writerEmail)은 제외
        const recipientIds = members
            .filter(member => {
                const orgMatch = workspace.orgNames && workspace.orgNames.includes(member.org_name);
                const codeMatch = member.workspace_code === workspace.code;
                const isSameWorkspace = orgMatch || codeMatch;
                
                const isDirectorOrMaster = member.role_code === 'master' || member.role_code === 'director';
                const isNotWriter = member.email && writerEmail && member.email.toLowerCase() !== writerEmail.toLowerCase();

                return (isSameWorkspace || isDirectorOrMaster) && isNotWriter;
            })
            .map(member => member.auth_id);

        const uniqueRecipientIds = [...new Set(recipientIds)];

        // 일반 알림 대상자 중에서 언급(태그) 대상자를 제외하여 중복 수신 방지
        const ordinaryRecipientIds = uniqueRecipientIds.filter(id => !mentionedAuthIds.includes(id));

        const summaryText = logContent.length > 80 ? logContent.slice(0, 80) + '...' : logContent;
        const notificationPayload = [];

        // 일반 알림 페이로드 추가
        ordinaryRecipientIds.forEach(userId => {
            notificationPayload.push({
                user_id: userId,
                title: `[${workspace.label}] 신규 협업글 등록`,
                body: summaryText,
                type: 'log',
                reference_id: `${logId}|${workspace.code}`,
                is_read: false,
                created_at: new Date().toISOString()
            });
        });

        // 언급(태그) 알림 페이로드 추가
        mentionedAuthIds.forEach(userId => {
            notificationPayload.push({
                user_id: userId,
                title: `[@언급] ${writerName}님이 회원님을 태그했습니다.`,
                body: summaryText,
                type: 'log',
                reference_id: `${logId}|${workspace.code}`,
                is_read: false,
                created_at: new Date().toISOString()
            });
        });

        if (notificationPayload.length === 0) {
            console.log('No recipients to notify for log:', logId);
            return;
        }

        // 4. iota_notifications 테이블에 Bulk Insert 진행
        const { error: insertError } = await supabase
            .from('iota_notifications')
            .insert(notificationPayload);

        if (insertError) {
            console.error('Failed to insert log notifications:', insertError);
        } else {
            console.log(`Log notifications successfully sent to ${notificationPayload.length} users (Mentions: ${mentionedAuthIds.length}).`);
        }
    } catch (err) {
        console.error('Error in notifyMembersOnLogCreation:', err);
    }
};

/**
 * Task 생성 시 워크스페이스 소속원 및 마스터/디렉터에게 알림 전송 (비동기 백그라운드 구동 권장)
 */
export const notifyMembersOnTaskCreation = async (taskId, taskName, workspace, writerEmail) => {
    if (!taskName || !workspace?.code) return;

    try {
        // 1. 활성화 상태이고 auth_id가 매핑된 멤버 전체 조회
        const { data: members, error: memberError } = await supabase
            .from('iota_seoul_pilot_members')
            .select('auth_id, email, staff_name, org_name, role_code, workspace_code')
            .eq('is_active', true)
            .not('auth_id', 'is', null);

        if (memberError) {
            console.error('Failed to fetch members for task notifications:', memberError);
            return;
        }

        // 2. 수신자 매핑 알고리즘:
        // - 소속 워크스페이스 멤버 (workspace.orgNames 가 member.org_name을 포함하거나 member.workspace_code === workspace.code)
        // - 또는 director / master 권한 보유자
        // - 또는 워크스페이스 무관 고정 수신 VIP (이시정, 이관용, 전기영, 이철승, 강순용, 권순일)
        // - 단, 작성자 본인(writerEmail)은 제외
        const TASK_VIP_NAMES = ['이시정', '이관용', '전기영', '이철승', '강순용', '권순일'];
        
        const recipientIds = members
            .filter(member => {
                const orgMatch = workspace.orgNames && workspace.orgNames.includes(member.org_name);
                const codeMatch = member.workspace_code === workspace.code;
                const isSameWorkspace = orgMatch || codeMatch;

                const isDirectorOrMaster = member.role_code === 'master' || member.role_code === 'director';
                const isTaskVIP = TASK_VIP_NAMES.includes(member.staff_name);
                const isNotWriter = member.email && writerEmail && member.email.toLowerCase() !== writerEmail.toLowerCase();

                return (isSameWorkspace || isDirectorOrMaster || isTaskVIP) && isNotWriter;
            })
            .map(member => member.auth_id);

        const uniqueRecipientIds = [...new Set(recipientIds)];

        if (uniqueRecipientIds.length === 0) {
            console.log('No recipients to notify for task:', taskName);
            return;
        }

        // 3. iota_notifications 테이블에 Bulk Insert 진행
        const notificationPayload = uniqueRecipientIds.map(userId => ({
            user_id: userId,
            title: `[${workspace.label}] 신규 Task 등록`,
            body: `새로운 Task가 등록되었습니다: ${taskName}`,
            type: 'task',
            reference_id: taskId ? `${taskId}|${workspace.code}` : null,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
            .from('iota_notifications')
            .insert(notificationPayload);

        if (insertError) {
            console.error('Failed to insert task notifications:', insertError);
        } else {
            console.log(`Task notifications successfully sent to ${uniqueRecipientIds.length} users.`);
        }
    } catch (err) {
        console.error('Error in notifyMembersOnTaskCreation:', err);
    }
};
