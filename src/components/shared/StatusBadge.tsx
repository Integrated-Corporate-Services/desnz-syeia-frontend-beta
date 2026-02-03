/**
 * StatusBadge Component
 *
 * A reusable component for displaying application status with semantic GOV.UK Design System styling.
 * Implements Single Responsibility Principle - only responsible for status display.
 *
 * @module components/shared/StatusBadge
 * @see {@link https://design-system.service.gov.uk/components/tag/}
 */

import React from "react";
import { getStatusDisplay } from "../../features/Workbasket/constants/statusDisplay";

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
 * StatusBadge - Displays application status with semantic GOV.UK tag styling
 *
 * Features:
 * - WCAG 2.1 AA compliant color contrast ratios
 * - Semantic HTML using <strong> for emphasis
 * - Screen reader friendly with proper ARIA attributes
 * - Handles unknown statuses gracefully with fallback styling
 * - Type-safe with TypeScript
 * - Custom display labels (e.g., "Submitted" → "Application submitted")
 *
 * @example
 * ```tsx
 * <StatusBadge status="Submitted" />
 * // Renders: <strong class="govuk-tag govuk-tag--turquoise">Application submitted</strong>
 *
 * <StatusBadge status="In Abeyance" ariaLabel="Application status: In abeyance" />
 * // Renders with custom aria-label
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(
  ({ status, className = "", ariaLabel }) => {
    // Get custom label and CSS class based on status
    const { label: displayText, className: tagClass } =
      getStatusDisplay(status);

    // Combine classes (Open/Closed Principle - extensible via className prop)
    const combinedClassName =
      `${tagClass} ${className} govuk-!-font-size-19`.trim();

    // Construct ARIA label for screen readers
    const ariaLabelText = ariaLabel || `Status: ${displayText}`;

    return (
      <strong
        className={combinedClassName}
        aria-label={ariaLabelText}
        role="status"
        style={{
          display: "inline-flex",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          overflow: "visible",
        }}
      >
        {displayText}
      </strong>
    );
  },
  // Memoization optimization - only re-render if props change
  (prevProps, nextProps) =>
    prevProps.status === nextProps.status &&
    prevProps.className === nextProps.className &&
    prevProps.ariaLabel === nextProps.ariaLabel,
);

// Display name for React DevTools
StatusBadge.displayName = "StatusBadge";
