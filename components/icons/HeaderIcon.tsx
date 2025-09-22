import React from 'react';

export const HeaderIcon: React.FC<{className?: string}> = ({className}) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M2 15L21 15L23 12L18 12L15 8L8 8L2 15Z" />
        <path d="M1 18C5 17 7 19 12 18S19 17 23 18" />
    </svg>
);
