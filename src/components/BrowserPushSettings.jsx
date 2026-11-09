import React, { useEffect, useState } from 'react';
import { getBrowserPushStatus, requestFirebaseNotificationPermission } from '../utils/firebase';

export default function BrowserPushSettings({ userId }) {
    const [status, setStatus] = useState(getBrowserPushStatus);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        if (getBrowserPushStatus() === 'granted') {
            requestFirebaseNotificationPermission(userId).then(result => { if (active) setStatus(result.status); });
        }
        return () => { active = false; };
    }, [userId]);
    if (!userId || status === 'native') return null;
    const messages = {
        connected: '이 브라우저에서 푸시 알림을 받습니다.',
        denied: '알림이 차단되어 있습니다. 브라우저의 사이트 설정에서 알림을 허용해 주세요.',
        unsupported: 'iPhone·iPad에서는 홈 화면에 추가한 뒤 실행하여 알림을 켜 주세요.',
        insecure: '푸시 알림은 운영 사이트의 HTTPS 주소에서 켤 수 있습니다.',
        error: '푸시 연결에 실패했습니다. 다시 연결해 주세요.',
    };
    const canConnect = !['denied', 'unsupported', 'insecure', 'connected'].includes(status);
    const connect = async () => {
        setBusy(true);
        try {
            const result = await requestFirebaseNotificationPermission(userId, { prompt: true });
            setStatus(result.status);
        } catch { setStatus('error'); }
        finally { setBusy(false); }
    };
    return <div className="px-5 py-3 text-[12px] text-[#A1A1AA] flex items-center gap-3" role="status">
        <span className="flex-1">{messages[status] || '브라우저에서도 새 알림을 받아보세요.'}</span>
        {canConnect && <button type="button" onClick={connect} disabled={busy}
            className="shrink-0 rounded-lg border border-[#555] px-3 py-2 text-[#E5E5E5] hover:bg-[#333] cursor-pointer transition-colors disabled:opacity-50">
            {busy ? '연결 중…' : status === 'error' ? '다시 연결' : '알림 켜기'}
        </button>}
    </div>;
}
