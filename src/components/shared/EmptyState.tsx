/**
 * EmptyState Component
 * 
 * Displays contextual empty state messaging for the Applications Dashboard.
 * Implements Strategy Pattern for different empty state variants.
 * 
 * @module components/shared/EmptyState
 * @see {@link https://design-system.service.gov.uk/patterns/empty-state/}
 */

import React, { useEffect, useRef } from 'react';

/**
 * Enum for empty state variants following Type Safety principles
 */
export type EmptyStateVariant = 
  | 'no-applications'     // User has zero applications
  | 'no-results'          // Filters returned zero results
  | 'loading-error';      // Failed to load applications

/**
 * Props interface following Interface Segregation Principle
 */
interface EmptyStateProps {
  /** The variant determining which message to display */
  variant: EmptyStateVariant;
  /** Optional callback when "Clear filters" is clicked (for no-results variant) */
  onClearFilters?: () => void;
  /** Optional error message (for loading-error variant) */
  errorMessage?: string;
  /** Optional custom heading */
  customHeading?: string;
  /** Optional custom body text */
  customBody?: string;
}

/**
 * Configuration object for each variant (Strategy Pattern)
 * Separates data from behavior, making it easy to add new variants
 */
const VARIANT_CONFIG: Record<EmptyStateVariant, {
  heading: string;
  body: string;
  icon?: string;
  showClearFiltersLink: boolean;
}> = {
  'no-applications': {
    heading: 'You have no applications yet',
    body: 'You can start a new application to begin the consent process.',
    showClearFiltersLink: false,
  },
  'no-results': {
    heading: 'No applications match your filters',
    body: 'Try adjusting your filters or clear all filters to see all applications.',
    showClearFiltersLink: true,
  },
  'loading-error': {
    heading: 'Sorry, there is a problem with the service',
    body: 'Try again later. We have not been able to load your applications.',
    showClearFiltersLink: false,
  },
};

/**
 * EmptyState - Contextual empty state messaging component
 * 
 * Features:
 * - Multiple variants for different scenarios
 * - WCAG 2.1 AA compliant
 * - Screen reader announcements via role="status"
 * - Focus management for better UX
 * - Extensible via props (Open/Closed Principle)
 * 
 * @example
 * ```tsx
 * // No applications (first-time user)
 * <EmptyState variant="no-applications" />
 * 
 * // No results from filters
 * <EmptyState 
 *   variant="no-results" 
 *   onClearFilters={() => clearAllFilters()} 
 * />
 * 
 * // Loading error
 * <EmptyState 
 *   variant="loading-error" 
 *   errorMessage="Connection timeout"
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  onClearFilters,
  errorMessage,
  customHeading,
  customBody,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = VARIANT_CONFIG[variant];

  // Announce to screen readers when variant changes
  useEffect(() => {
    if (containerRef.current) {
      // Focus management - helps screen reader users
      const heading = containerRef.current.querySelector('h2');
      if (heading && 'focus' in heading) {
        // Set tabindex temporarily for focus
        heading.setAttribute('tabindex', '-1');
        (heading as HTMLElement).focus();
        
        // Remove tabindex after focus (cleanup)
        setTimeout(() => {
          heading.removeAttribute('tabindex');
        }, 100);
      }
    }
  }, [variant]);

  /**
   * Handle clear filters click with null safety
   */
  const handleClearFilters = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Determine heading and body text (Strategy Pattern)
  const heading = customHeading || config.heading;
  const body = customBody || config.body;

  return (
    <div 
      ref={containerRef}
      className="govuk-!-padding-6 govuk-!-margin-top-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid={`empty-state-${variant}`}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        {/* Error variant shows warning text */}
        {variant === 'loading-error' && (
          <p className="govuk-body govuk-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span>
            {errorMessage || 'An error occurred'}
          </p>
        )}

        {/* Main heading */}
        <h2 
          className="govuk-heading-m govuk-!-margin-bottom-4"
          style={{ fontSize: '1.5rem' }}
        >
          {heading}
        </h2>

        {/* Body text */}
        <p className="govuk-body govuk-!-margin-bottom-6">
          {body}
        </p>

        {/* Clear filters link (only for no-results variant) */}
        {config.showClearFiltersLink && onClearFilters && (
          <p className="govuk-body">
            <a 
              href="#clear-filters" 
              className="govuk-link"
              onClick={handleClearFilters}
              aria-label="Clear all filters and show all applications"
            >
              Clear filters
            </a>
          </p>
        )}

        {/* Loading error shows additional guidance */}
        {variant === 'loading-error' && (
          <details className="govuk-details govuk-!-margin-top-4">
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                What you can do
              </span>
            </summary>
            <div className="govuk-details__text">
              <ul className="govuk-list govuk-list--bullet">
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Try again in a few minutes</li>
                <li>Contact support if the problem continues</li>
              </ul>
            </div>
          </details>
        )}
      </div>

      {/* Visually hidden announcement for screen readers */}
      <div className="govuk-visually-hidden" aria-live="polite">
        {variant === 'no-results' && 'No applications found matching your filters'}
        {variant === 'no-applications' && 'You have no applications'}
        {variant === 'loading-error' && 'Error loading applications'}
      </div>
    </div>
  );
};

// Display name for React DevTools
EmptyState.displayName = 'EmptyState';
