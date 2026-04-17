import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Default to light mode (white version) as requested, true = light, false = dark
    const [isLightMode, setIsLightMode] = useState(true);

    useEffect(() => {
        const root = document.documentElement;
        if (isLightMode) {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
    }, [isLightMode]);

    const toggleTheme = () => setIsLightMode(!isLightMode);

    return (
        <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
