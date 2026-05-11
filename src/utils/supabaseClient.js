import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key';
const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

let supabaseInstance;

if (!hasSupabaseConfig) {
    supabaseInstance = {
        auth: {
            async getSession() {
                return { data: { session: null }, error: null };
            },
            onAuthStateChange() {
                return { data: { subscription: { unsubscribe() {} } } };
            },
            async signOut() {
                return { error: null };
            },
            async updateUser() {
                return { data: null, error: new Error('Supabase environment is not configured.') };
            }
        },
        from() {
            return {
                select() {
                    return this;
                },
                eq() {
                    return this;
                },
                async single() {
                    return { data: null, error: null };
                }
            };
        }
    };
} else if (!window.__SUPABASE_CLIENT__) {
    const customFetch = (url, options) => {
        const isAuthRequest = url.includes('/auth/v1/');
        const controller = new AbortController();
        let timeoutId;

        // Only apply global timeout to data requests, not auth endpoints
        // to prevent token refresh from being aborted, which causes sudden logouts.
        if (!isAuthRequest) {
            timeoutId = setTimeout(() => {
                console.warn(`Supabase fetch timeout exceeded for url: ${url}`);
                controller.abort();
            }, 8000); // 8 seconds global timeout
        }

        if (options && options.signal) {
            options.signal.addEventListener('abort', () => controller.abort());
        }

        return fetch(url, { ...options, signal: controller.signal })
            .finally(() => {
                if (timeoutId) clearTimeout(timeoutId);
            });
    };

    window.__SUPABASE_CLIENT__ = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storageKey: 'sb-iota-auth-token'
        },
        global: {
            fetch: customFetch
        }
    });
    supabaseInstance = window.__SUPABASE_CLIENT__;
} else {
    supabaseInstance = window.__SUPABASE_CLIENT__;
}

export const supabase = supabaseInstance;
