import React from 'react';

export const BoyIcon = ({ size = 15, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`gender-svg-icon boy-svg ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Boy Head */}
    <circle cx="12" cy="7.5" r="3.5" />
    {/* Boy Short Hair line */}
    <path d="M9.5 5.5c.8-.8 2-1.2 3.5-1.2 1.5 0 2.2.4 2.8.9" />
    {/* Boy Body & Shoulders */}
    <path d="M5.5 20.5v-1.5a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v1.5" />
    {/* Tie / School Collar */}
    <path d="M12 14.5v3" />
  </svg>
);

export const GirlIcon = ({ size = 15, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`gender-svg-icon girl-svg ${className}`}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Girl Head */}
    <circle cx="12" cy="7.5" r="3.5" />
    {/* Girl Left Pigtail */}
    <path d="M8.5 7.5c-1.8 0-3 1.2-3 2.8 0 1.5 1 2.2 2 2.2" />
    {/* Girl Right Pigtail */}
    <path d="M15.5 7.5c1.8 0 3 1.2 3 2.8 0 1.5-1 2.2-2 2.2" />
    {/* Girl Body & Shoulders */}
    <path d="M5.5 20.5v-1.5a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v1.5" />
  </svg>
);

export default { BoyIcon, GirlIcon };
