import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recoveryMode, setRecoveryMode] = useState(false);

    // Shared signout logic to avoid dependency issues in useEffect
    const handleSignOut = async () => {
        // 1. 즉각적인 로컬 로그아웃 처리 (무한 대기 방지)
        const keysToRemoveLocal = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-')) {
                keysToRemoveLocal.push(key);
            }
        }
        keysToRemoveLocal.forEach(k => localStorage.removeItem(k));

        const keysToRemoveSession = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('sb-')) {
                keysToRemoveSession.push(key);
            }
        }
        keysToRemoveSession.forEach(k => sessionStorage.removeItem(k));

        localStorage.removeItem('iota_last_activity');
        sessionStorage.removeItem('iota_last_activity');
        setUser(null);
        setMemberInfo(null);
        
        // 2. 서버 통신은 백그라운드에서 비동기로 실행 (Fire-and-forget)
        supabase.auth.signOut().catch(e => console.error("Background signout error:", e));

        // 3. 바로 로그인 화면으로 이동
        window.location.href = import.meta.env.BASE_URL + 'auth-setup';
    };

    // 4. 데드락 방지: user 객체가 변경될 때 독립적으로 memberInfo를 업데이트하는 훅
    useEffect(() => {
        if (user?.email) {
            fetchMemberInfo(user.email);
        } else {
            setMemberInfo(null);
        }
    }, [user?.email]);

    useEffect(() => {
        // Fetch current session and setup listener
        let subscription;
        let activityIntervalId;

        // 5. 브라우저 탭 복귀 시 조용히 세션 예열 (Auto-warmup) - Explicit refreshSession disabled to prevent signout on silent failures
        const handleVisibilityChange = () => {
            /*
            if (document.visibilityState === 'visible') {
                supabase.auth.refreshSession().catch(e => console.warn('Silent refresh failed', e));
            }
            */
        };
        window.addEventListener('visibilitychange', handleVisibilityChange);

        const initializeAuth = async () => {
            let timeoutId;
            try {
                // Manual fallback: forcefully trigger recovery mode if URL indicates a password reset link
                if (window.location.hash.includes('type=recovery') || window.location.search.includes('code=')) {
                    setRecoveryMode(true);
                } else if (window.location.search.includes('error=') || window.location.hash.includes('error=')) {
                    // Check if Supabase rejected the redirect
                    const urlParams = new URLSearchParams(window.location.search || window.location.hash.substring(1));
                    const errorDesc = urlParams.get('error_description') || urlParams.get('error');
                    if (errorDesc) {
                        alert('비밀번호 복구 링크 오류: ' + errorDesc + '\n수파베이스 Redirect URL 설정을 확인해주세요.');
                    }
                }

                // 6. 데드락 핵심 수정 사항: onAuthStateChange 내부에서는 절대 DB 통신(await)을 하지 않음!
                // IMPORTANT: Register listener BEFORE any await, so we don't miss the PASSWORD_RECOVERY event
                const { data } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'PASSWORD_RECOVERY') {
                        setRecoveryMode(true);
                    }

                    if (session?.user) {
                        setUser(session.user); // State만 변경. memberInfo는 위의 useEffect가 알아서 처리함
                    } else {
                        setUser(null);
                    }
                });
                
                if (data && data.subscription) {
                    subscription = data.subscription;
                }

                // Inactivity timeout check disabled to prevent continuous forced logouts on mobile/background tabs
                /*
                const lastActivityStr = localStorage.getItem('iota_last_activity');
                if (lastActivityStr) {
                    const lastActivity = parseInt(lastActivityStr, 10);
                    if (Date.now() - lastActivity > TIMEOUT_MS) {
                        localStorage.removeItem('iota_last_activity');
                        handleSignOut(); // await 제거: 서버 응답 기다리지 않고 즉시 강제 로컬 로그아웃
                        return; // Stop initialization
                    }
                }
                */

                // If we haven't timed out, update activity and start interval
                localStorage.setItem('iota_last_activity', Date.now().toString());
                activityIntervalId = setInterval(() => {
                    localStorage.setItem('iota_last_activity', Date.now().toString());
                }, 60000);

                // Increase timeout threshold to 15s to handle slower mobile cell network latencies without early redirection
                timeoutId = setTimeout(() => {
                    console.error("Auth initialization timed out! Forcing load.");
                    setLoading(false);
                }, 15000);

                const { data: { session } } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (session?.user) {
                    // 초기 부팅 시 화면 깜빡임 방지를 위해 동기적으로 1회만 조회 (setUser is handled by onAuthStateChange)
                    await fetchMemberInfo(session.user.email);
                } else {
                    setMemberInfo(null);
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            if (subscription) subscription.unsubscribe();
            if (activityIntervalId) clearInterval(activityIntervalId);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchMemberInfo = async (email) => {
        try {
            const { data, error } = await supabase
                .from('iota_seoul_pilot_members')
                .select('*')
                .eq('email', email)
                .single();
                
            if (data && !error) {
                setMemberInfo(data);
            }
        } catch (err) {
            console.error("Failed to fetch member info", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, memberInfo, loading, signOut: handleSignOut, recoveryMode, setRecoveryMode }}>
            {loading ? (
                <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#FDFDFD] dark:bg-[#111111] z-[99999]">
                    <div className="w-6 h-6 relative mb-5 animate-spin">
                        <div className="absolute top-0 left-1/2 -ml-[3px] w-[6px] h-[6px] bg-[#111] dark:bg-white rounded-full"></div>
                    </div>
                    <span className="text-[#86868B] dark:text-[#A1A1AA] text-[14px] font-medium tracking-tight">데이터를 불러오고 있습니다...</span>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
