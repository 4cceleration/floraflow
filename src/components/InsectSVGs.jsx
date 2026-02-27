import React from 'react';

export const AntSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
        <g fill="currentColor">
            <ellipse cx="50" cy="50" rx="10" ry="25" />
            <circle cx="50" cy="20" r="8" />
            <ellipse cx="50" cy="80" rx="12" ry="18" />
            <path d="M 40 40 Q 20 20 20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 40 50 Q 15 50 15 60" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 40 60 Q 20 80 20 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 40 Q 80 20 80 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 50 Q 85 50 85 60" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 60 Q 80 80 80 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 45 15 Q 30 0 25 10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 55 15 Q 70 0 75 10" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>
    </svg>
);

export const BeetleSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
        <g fill="currentColor">
            <ellipse cx="50" cy="60" rx="25" ry="35" />
            <path d="M 50 25 L 50 95" stroke="#030a05" strokeWidth="3" />
            <ellipse cx="50" cy="20" rx="15" ry="10" />
            <path d="M 40 15 Q 30 0 45 5" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 60 15 Q 70 0 55 5" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 40 L 10 30" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 60 L 5 60" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 80 L 10 90" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 75 40 L 90 30" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 75 60 L 95 60" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 75 80 L 90 90" stroke="currentColor" strokeWidth="3" fill="none" />
        </g>
    </svg>
);

export const FrogSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}>
        <g fill="currentColor">
            <ellipse cx="50" cy="55" rx="20" ry="30" />
            <circle cx="35" cy="25" r="8" />
            <circle cx="65" cy="25" r="8" />
            <path d="M 35 35 Q 10 20 15 10" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 65 35 Q 90 20 85 10" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 30 70 Q 5 60 10 90" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 70 70 Q 95 60 90 90" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
    </svg>
);

export const CentipedeSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
        <g fill="currentColor">
            <circle cx="50" cy="20" r="12" />
            <path d="M 43 12 Q 30 -5 20 5" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 57 12 Q 70 -5 80 5" stroke="currentColor" strokeWidth="2" fill="none" />
            {[...Array(10)].map((_, i) => {
                const cy = 40 + i * 15;
                return (
                    <g key={i}>
                        <ellipse cx="50" cy={cy} rx="10" ry="8" />
                        <path d={`M 40 ${cy} Q 15 ${cy - 10} 10 ${cy + 5}`} stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d={`M 60 ${cy} Q 85 ${cy - 10} 90 ${cy + 5}`} stroke="currentColor" strokeWidth="2" fill="none" />
                    </g>
                );
            })}
        </g>
    </svg>
);

export const ButterflySVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}>
        <g fill="currentColor">
            <ellipse cx="50" cy="50" rx="8" ry="30" fill="#2d3748" />
            <path d="M 50 40 Q 15 10 5 45 Q 25 70 50 60" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="2" />
            <path d="M 50 40 Q 85 10 95 45 Q 75 70 50 60" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="2" />
            <path d="M 50 55 Q 30 75 25 95 Q 45 90 50 70" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2" />
            <path d="M 50 55 Q 70 75 75 95 Q 55 90 50 70" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2" />
            <path d="M 45 20 Q 30 5 25 10" stroke="#2d3748" strokeWidth="3" fill="none" />
            <path d="M 55 20 Q 70 5 75 10" stroke="#2d3748" strokeWidth="3" fill="none" />
        </g>
    </svg>
);

export const BeeSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
        <g>
            <ellipse cx="30" cy="40" rx="15" ry="35" fill="white" fillOpacity="0.5" transform="rotate(-30 30 40)" />
            <ellipse cx="70" cy="40" rx="15" ry="35" fill="white" fillOpacity="0.5" transform="rotate(30 70 40)" />
            <ellipse cx="50" cy="55" rx="20" ry="35" fill="currentColor" />
            <path d="M 32 45 Q 50 50 68 45" stroke="#1a202c" strokeWidth="6" fill="none" />
            <path d="M 30 65 Q 50 70 70 65" stroke="#1a202c" strokeWidth="6" fill="none" />
            <circle cx="50" cy="20" r="12" fill="#1a202c" />
            <path d="M 45 10 Q 35 -5 40 -10" stroke="#1a202c" strokeWidth="3" fill="none" />
            <path d="M 55 10 Q 65 -5 60 -10" stroke="#1a202c" strokeWidth="3" fill="none" />
            <path d="M 45 90 L 50 100 L 55 90 Z" fill="#1a202c" />
        </g>
    </svg>
);

export const LadybugSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
        <g fill="currentColor">
            <circle cx="50" cy="55" r="35" fill="currentColor" />
            <path d="M 50 20 L 50 90" stroke="#1a202c" strokeWidth="4" />
            <path d="M 15 55 Q 50 30 85 55" stroke="#1a202c" strokeWidth="4" fill="none" />
            <circle cx="30" cy="45" r="6" fill="#1a202c" />
            <circle cx="70" cy="45" r="6" fill="#1a202c" />
            <circle cx="35" cy="70" r="7" fill="#1a202c" />
            <circle cx="65" cy="70" r="7" fill="#1a202c" />
            <ellipse cx="50" cy="20" rx="15" ry="10" fill="#1a202c" />
            <path d="M 45 15 Q 35 0 30 5" stroke="#1a202c" strokeWidth="3" fill="none" />
            <path d="M 55 15 Q 65 0 70 5" stroke="#1a202c" strokeWidth="3" fill="none" />
        </g>
    </svg>
);

export const FireflySVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 15px currentColor)' }}>
        <g>
            <ellipse cx="35" cy="50" rx="12" ry="30" fill="#a0aec0" fillOpacity="0.4" transform="rotate(-20 35 50)" />
            <ellipse cx="65" cy="50" rx="12" ry="30" fill="#a0aec0" fillOpacity="0.4" transform="rotate(20 65 50)" />
            <ellipse cx="50" cy="40" rx="15" ry="20" fill="#2d3748" />
            <ellipse cx="50" cy="75" rx="14" ry="20" fill="currentColor" fillOpacity="0.9" />
            <circle cx="50" cy="20" r="10" fill="#1a202c" />
            <path d="M 45 12 Q 35 0 30 5" stroke="#1a202c" strokeWidth="2" fill="none" />
            <path d="M 55 12 Q 65 0 70 5" stroke="#1a202c" strokeWidth="2" fill="none" />
        </g>
    </svg>
);
