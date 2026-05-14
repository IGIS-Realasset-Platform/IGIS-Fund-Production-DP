import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

export default function SystemAdmin() {
    const { user, memberInfo } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    
    // Login History Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const AUTHORIZED_USERS = ['전기영', '이시정', '이관용'];

    useEffect(() => {
        const checkAccessAndFetch = async () => {
            // Check Authorization
            if (!memberInfo || !AUTHORIZED_USERS.includes(memberInfo.staff_name)) {
                setAccessDenied(true);
                setLoading(false);
                return;
            }

            try {
                // Fetch Logs
                const { data, error } = await supabase
                    .from('iota_seoul_pilot_members')
                    .select('staff_name, email, org_name, role_code, last_login_at')
                    .order('last_login_at', { ascending: false, nullsFirst: false });

                if (error) {
                    console.error("Error fetching logs:", error);
                } else {
                    setLogs(data || []);
                }
            } catch (err) {
                console.error("Unexpected error fetching logs:", err);
            } finally {
                setLoading(false);
            }
        };

        checkAccessAndFetch();
    }, [memberInfo]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#FDFDFD] dark:bg-[#111111] flex items-center justify-center">
                <div className="w-6 h-6 relative mb-5 animate-spin">
                    <div className="absolute top-0 left-1/2 -ml-[3px] w-[6px] h-[6px] bg-[#111] dark:bg-white rounded-full"></div>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="w-full h-screen bg-[#FDFDFD] dark:bg-[#111111] flex flex-col items-center justify-center text-[#1D1D1F] dark:text-[#E5E5E5]">
                <svg className="w-16 h-16 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-[#86868B] mb-8">You do not have permission to view this page.</p>
                <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-[#111] dark:bg-white text-white dark:text-[#111111] font-semibold rounded-xl hover:opacity-80 transition-opacity"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const getRoleName = (roleCode) => {
        if (roleCode === 'master') return '마스터';
        if (roleCode === 'director') return '책임';
        if (roleCode === 'manager') return '매니저';
        return roleCode || '-';
    };

    const handleRowClick = async (email, staffName) => {
        setSelectedUser({ email, staffName });
        setLoadingHistory(true);
        setHistoryLogs([]);

        try {
            const { data, error } = await supabase
                .from('iota_seoul_login_history')
                .select('login_time')
                .eq('email', email)
                .order('login_time', { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setHistoryLogs(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="w-full h-screen overflow-y-auto bg-[#FDFDFD] dark:bg-[#111111] text-[#1D1D1F] dark:text-[#E5E5E5] font-sans p-10 md:p-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
                        <p className="text-[#86868B]">System Access Logs</p>
                    </div>
                    <button 
                        onClick={() => {
                            window.close();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg text-sm font-medium hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        Close Window
                    </button>
                </div>

                <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F7] dark:bg-[#2C2C2E] border-b border-black/10 dark:border-white/10">
                                    <th className="py-4 px-6 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Department</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Position</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Email</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Last Login At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {logs.map((log, index) => (
                                    <tr 
                                        key={index} 
                                        onClick={() => handleRowClick(log.email, log.staff_name)}
                                        className="hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6 text-[15px] font-medium">{log.staff_name}</td>
                                        <td className="py-4 px-6 text-[14px] text-[#666] dark:text-[#A1A1AA]">{log.org_name || '-'}</td>
                                        <td className="py-4 px-6 text-[14px] text-[#666] dark:text-[#A1A1AA]">{getRoleName(log.role_code)}</td>
                                        <td className="py-4 px-6 text-[14px] text-[#666] dark:text-[#A1A1AA]">{log.email}</td>
                                        <td className="py-4 px-6 text-[14px] text-[#666] dark:text-[#A1A1AA] font-mono tracking-tight">{formatDate(log.last_login_at)}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-[#86868B]">No access logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-[#1C1C1E] w-[500px] max-h-[80vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-[20px] font-bold text-[#1D1D1F] dark:text-white tracking-tight">{selectedUser.staffName} 접속 기록</h3>
                                <p className="text-[14px] text-[#86868B] dark:text-[#A1A1AA] mt-1">{selectedUser.email}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <svg className="w-5 h-5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-[#FDFDFD] dark:bg-[#111111]">
                            {loadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-5 h-5 border-2 border-[#111] dark:border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                                    <p className="text-[14px] text-[#86868B]">기록을 불러오는 중...</p>
                                </div>
                            ) : historyLogs.length > 0 ? (
                                <>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-[13px] font-semibold text-[#1D1D1F] dark:text-white bg-[#F5F5F7] dark:bg-[#2C2C2E] px-3 py-1 rounded-full">
                                            총 {historyLogs.length}회 접속
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {historyLogs.map((h, i) => (
                                            <div key={i} className="flex items-center px-4 py-2.5 rounded-lg border border-black/5 dark:border-white/5 bg-white dark:bg-[#1C1C1E] shadow-sm">
                                                <span className="text-[15px] font-medium text-[#1D1D1F] dark:text-white font-mono tracking-tight">
                                                    {formatDate(h.login_time)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[15px] font-medium text-[#1D1D1F] dark:text-white mb-1">상세 기록이 없습니다.</p>
                                    <p className="text-[14px] text-[#86868B]">이 사용자는 새로운 로그인 히스토리 시스템<br/>도입 이후 접속한 기록이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
