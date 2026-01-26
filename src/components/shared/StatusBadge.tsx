/**
 * StatusBadge Component
 * 
 * A reusable component for displaying application status with semantic GOV.UK Design System styling.
 * Implements Single Responsibility Principle - only responsible for status display.
 * 
 * @module components/shared/StatusBadge
 * @see {@link https://design-system.service.gov.uk/components/tag/}
 */

import React from 'react';
import { getStatusTagClass } from '../../features/Workbasket/constants/statusDisplay';

/**
 * Props interface following Interface Segregation Principle
 */
interface StatusBadgeProps {
  /** The application status to display */
  status: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional ARIA label for screen readers */
  ariaLabel?: string;
}

/**
 * Formats status text for display (Title Case with proper spacing)
 * Pure function following functional programming principles
 * 
 * @param status - Raw status string
 * @returns Formatted status string
 */
const formatStatusText = (status: string): string => {
  if (!status || typeof status !== 'string') {
    return 'Unknown';
  }

  return status
    .toLowerCase()
    .trim()
    .split(/[-_\s]+/) // Handle hyphens, underscores, and spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * StatusBadge - Displays application status with semantic GOV.UK tag styling
 * 
 * Features:
 * - WCAG 2.1 AA compliant color contrast ratios
 * - Semantic HTML using <strong> for emphasis
 * - Screen reader friendly with proper ARIA attributes
 * - Handles unknown statuses gracefully with fallback styling
 * - Type-safe with TypeScript
 * 
 * @example
 * ```tsx
 * <StatusBadge status="under-review" />
 * // Renders: <strong class="govuk-tag govuk-tag--blue">Under Review</strong>
 * 
 * <StatusBadge status="granted" ariaLabel="Application status: Granted" />
 * // Renders with custom aria-label
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(
  ({ status, className = '', ariaLabel }) => {
    // Get semantic CSS class based on status
    const tagClass = getStatusTagClass(status);
    
    // Format status for display
    const displayText = formatStatusText(status);
    
    // Combine classes (Open/Closed Principle - extensible via className prop)
    const combinedClassName = `${tagClass} ${className}`.trim();
    
    // Construct ARIA label for screen readers
    const ariaLabelText = ariaLabel || `Status: ${displayText}`;

    return (
      <strong 
        className={combinedClassName}
        aria-label={ariaLabelText}
        role="status"
      >
        {displayText}
      </strong>
    );
  },
  // Memoization optimization - only re-render if props change
  (prevProps, nextProps) => 
    prevProps.status === nextProps.status && 
    prevProps.className === nextProps.className &&
    prevProps.ariaLabel === nextProps.ariaLabel
);

// Display name for React DevTools
StatusBadge.displayName = 'StatusBadge';

/**
 * Export helper function for standalone use
 */
export { formatStatusText };
