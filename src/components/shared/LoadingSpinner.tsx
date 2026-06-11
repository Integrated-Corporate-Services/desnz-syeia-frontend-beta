/**
 * Loading Spinner Component
 * GDS-compliant loading indicator for async operations
 * Created: 2026-06-09
 * ✅ P1 FIX: Loading states for all reassignment pages
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div 
      className={`govuk-!-margin-top-6 govuk-!-margin-bottom-6 ${className}`}
      role="status" 
      aria-live="polite"
    >
      <p className="govuk-body">
        <span className="govuk-visually-hidden">{message}</span>
        <svg 
          className="loading-spinner" 
          width="40" 
          height="40" 
          viewBox="0 0 40 40"
          aria-hidden="true"
          style={{
            verticalAlign: 'middle',
            marginRight: '10px',
          }}
        >
          <circle 
            cx="20" 
            cy="20" 
            r="18" 
            stroke="#505a5f" 
            strokeWidth="4" 
            fill="none"
            strokeDasharray="90, 150"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 20 20"
              to="360 20 20"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <span>{message}</span>
      </p>
    </div>
  );
};

export default LoadingSpinner;
