import React from 'react';
import ReactDom from 'react-dom';

export default function VirtualMouse({ isVisible, style }) {
    if (typeof window === 'undefined') return null;

    return ReactDom.createPortal(
        <div 
            className={`fixed z-[99999] pointer-events-none transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ ...style, transitionProperty: 'top, left, right, bottom, opacity, transform' }}
        >
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(3px 5px 6px rgba(0,0,0,0.4))' }}>
                <path d="M6 3 L6 25 L11 20.5 L15 28 L18 26.5 L14 19 L21 19 Z" fill="black" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
        </div>,
        document.body
    );
}
