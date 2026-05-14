import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key';

let supabaseInstance;

if (!window.__SUPABASE_CLIENT__) {
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

    const cookieStorage = {
        getItem: (key) => {
            const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        },
        setItem: (key, value) => {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; secure; samesite=lax`;
        },
        removeItem: (key) => {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
    };

    window.__SUPABASE_CLIENT__ = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storageKey: 'sb-iota-auth-token',
            storage: cookieStorage
        },
        global: {
            fetch: customFetch
        }
    });
}
supabaseInstance = window.__SUPABASE_CLIENT__;

export const supabase = supabaseInstance;
