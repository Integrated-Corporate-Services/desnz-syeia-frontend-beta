import React from 'react';

/**
 * SkipLink component for accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 * WCAG 2.1 Level A - Success Criterion 2.4.1 (Bypass Blocks)
 */
export const SkipLink: React.FC = () => {
  return (
    <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
      Skip to main content
    </a>
  );
};

export default SkipLink;
