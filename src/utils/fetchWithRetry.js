import { supabase } from './supabaseClient';

export const fetchWithRetry = async (queryFn, maxRetries = 3, delayMs = 500) => {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        const { data, error } = await queryFn();
        if (!error) return { data, error: null };
        
        lastError = error;
        // If it's a lock stolen error or network issue, retry
        if (error.message && error.message.includes('Lock') || error.message.includes('fetch')) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
        }
        
        // Break early for auth/RLS errors since they won't succeed on retry
        if (error.code && (error.code.startsWith('PGRST') || error.status === 401 || error.status === 403)) {
            break;
        }
    }
    // If we exhausted retries and it's STILL a lock error, we simply return the error.
    // NEVER forcefully log the user out or nuke storage here. Let the UI handle the error state gracefully.
    if (lastError && lastError.message && lastError.message.includes('Lock')) {
        console.warn('Supabase Lock error persisted after retries. Returning error to UI instead of crashing.');
    }

    return { data: null, error: lastError };
};
