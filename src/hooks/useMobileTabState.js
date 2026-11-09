import { useEffect, useState } from 'react';

// Session storage survives refresh without sharing another account's navigation.
export default function useMobileTabState(name, userId, fallback, allowedValues, initialOverride) {
    const key = userId ? `iota:mobile-tabs:v1:${userId}:${name}` : null;
    const restore = () => {
        if (allowedValues.includes(initialOverride)) return initialOverride;
        try {
            const saved = key ? JSON.parse(window.sessionStorage.getItem(key)) : null;
            if (allowedValues.includes(saved)) return saved;
        } catch {
            // Private browsing or invalid stored data must not block navigation.
        }
        return fallback;
    };
    const [state, setState] = useState(() => ({ key, value: restore() }));
    const value = state.key === key ? state.value : restore();
    if (state.key !== key) setState({ key, value });

    useEffect(() => {
        if (!key || value == null) return;
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
            // The current tab still works when storage is unavailable.
        }
    }, [key, value]);

    const setValue = (next) => setState(previous => ({
        key,
        value: typeof next === 'function' ? next(previous.key === key ? previous.value : value) : next,
    }));
    return [value, setValue];
}
