import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recoveryMode, setRecoveryMode] = useState(false);

    useEffect(() => {
        // Fetch current session and setup listener
        let subscription;

        const initializeAuth = async () => {
            let timeoutId;
            try {
                timeoutId = setTimeout(() => {
                    console.error("Auth initialization timed out! Forcing load.");
                    setLoading(false);
                }, 5000);

                const { data: { session } } = await supabase.auth.getSession();
                clearTimeout(timeoutId);

                if (session?.user) {
                    setUser(session.user);
                    await fetchMemberInfo(session.user.email);
                } else {
                    setUser(null);
                    setMemberInfo(null);
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
                
                // Only subscribe AFTER initial session is loaded to prevent concurrent lock conflicts
                const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'PASSWORD_RECOVERY') {
                        setRecoveryMode(true);
                    }

                    if (session?.user) {
                        setUser(session.user);
                        await fetchMemberInfo(session.user.email);
                    } else {
                        setUser(null);
                        setMemberInfo(null);
                    }
                    setLoading(false);
                });
                subscription = data.subscription;
            }
        };

        initializeAuth();

        return () => {
            subscription?.unsubscribe();
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

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error during sign out:", error);
        } finally {
            // Force clean up any corrupted supabase tokens in local storage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            setUser(null);
            setMemberInfo(null);
            // Hard redirect to login page to clear all React states
            window.location.href = import.meta.env.BASE_URL + 'auth-setup';
        }
    };

    return (
        <AuthContext.Provider value={{ user, memberInfo, loading, signOut, recoveryMode, setRecoveryMode }}>
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
