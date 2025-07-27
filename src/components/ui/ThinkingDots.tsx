import React from 'react';

export const ThinkingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-block align-middle ${className}`} aria-label="AI is thinking" style={{ minWidth: 32 }}>
    <span className="dot dot1">.</span>
    <span className="dot dot2">.</span>
    <span className="dot dot3">.</span>
    <style>{`
      .dot {
        display: inline-block;
        font-size: 2rem;
        line-height: 1;
        color: var(--tw-prose-invert, #888);
        opacity: 0.7;
        animation: wave 1.2s infinite;
      }
      .dot1 { animation-delay: 0s; }
      .dot2 { animation-delay: 0.2s; }
      .dot3 { animation-delay: 0.4s; }
      @keyframes wave {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-8px);
          opacity: 1;
        }
      }
    `}</style>
  </span>
);
