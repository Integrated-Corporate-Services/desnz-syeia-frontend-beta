/**
 * WorkbasketFilters Component
 * 
 * Filter panel for Applications Dashboard with Apply/Clear functionality.
 * Follows GOV.UK Design System patterns for forms and filters.
 * 
 * @module features/Workbasket/components/WorkbasketFilters
 */

import React, { useMemo } from "react";
import { CASE_TYPE_OPTIONS, STATUS_OPTIONS } from "../constants/filterOptions";

/**
 * Props interface following Interface Segregation Principle
 */
interface WorkbasketFiltersProps {
  /** Whether the filter panel is visible */
  showFilters: boolean;
  /** Search text value */
  searchText: string;
  /** Submitted by filter value */
  submittedBy: "me" | "all";
  /** Selected case types */
  caseTypes: string[];
  /** Selected statuses */
  statuses: string[];
  /** Whether to show "Submitted by" filter (only for coordinators/admins) */
  showSubmittedByFilter?: boolean;
  /** Callback when search text changes */
  onSearchChange: (value: string) => void;
  /** Callback when submitted by changes */
  onSubmittedByChange: (value: "me" | "all") => void;
  /** Callback when case type is toggled */
  onCaseTypeToggle: (caseType: string) => void;
  /** Callback when status is toggled */
  onStatusToggle: (status: string) => void;
  /** Callback when Apply filters button is clicked */
  onApplyFilters: () => void;
  /** Callback when Clear filters button is clicked */
  onClearFilters: () => void;
}

/**
 * WorkbasketFilters - Filter panel with Apply/Clear functionality
 * 
 * Features:
 * - WCAG 2.1 AA compliant with proper fieldset/legend structure
 * - Keyboard accessible
 * - Screen reader friendly with descriptive labels
 * - Controlled components for predictable state management
 * - Clear button to reset all filters
 * 
 * @example
 * ```tsx
 * <WorkbasketFilters
 *   showFilters={true}
 *   searchText={searchText}
 *   submittedBy="me"
 *   caseTypes={['overhead-lines']}
 *   statuses={['under-review']}
 *   showSubmittedByFilter={isCoordinator}
 *   onSearchChange={setSearchText}
 *   onSubmittedByChange={setSubmittedBy}
 *   onCaseTypeToggle={toggleCaseType}
 *   onStatusToggle={toggleStatus}
 *   onApplyFilters={handleApplyFilters}
 *   onClearFilters={handleClearFilters}
 * />
 * ```
 */
export const WorkbasketFilters: React.FC<WorkbasketFiltersProps> = ({
  showFilters,
  searchText,
  submittedBy,
  caseTypes,
  statuses,
  showSubmittedByFilter = true,
  onSearchChange,
  onSubmittedByChange,
  onCaseTypeToggle,
  onStatusToggle,
  onApplyFilters,
  onClearFilters,
}) => {
  // Early return if filters are hidden (Guard Clause Pattern)
  if (!showFilters) return null;

  /**
   * Helper to get display label for a filter value
   */
  const getFilterLabel = (type: 'caseType' | 'status', value: string): string => {
    switch (type) {
      case 'caseType': {
        const option = CASE_TYPE_OPTIONS.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      case 'status': {
        const option = STATUS_OPTIONS.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      default:
        return value;
    }
  };

  /**
   * Build filter pills array (memoized for performance)
   */
  const filterPills = useMemo(() => {
    const pills: Array<{
      id: string;
      type: 'search' | 'caseType' | 'status' | 'submittedBy';
      label: string;
      value: string;
    }> = [];

    if (searchText.trim()) {
      pills.push({
        id: 'search',
        type: 'search',
        label: `Search: ${searchText}`,
        value: searchText,
      });
    }

    caseTypes.forEach(caseType => {
      const label = getFilterLabel('caseType', caseType);
      pills.push({
        id: `case-type-${caseType}`,
        type: 'caseType',
        label: `Case type: ${label}`,
        value: caseType,
      });
    });

    statuses.forEach(status => {
      const label = getFilterLabel('status', status);
      pills.push({
        id: `status-${status}`,
        type: 'status',
        label: `Status: ${label}`,
        value: status,
      });
    });

    if (showSubmittedByFilter && submittedBy === 'all') {
      pills.push({
        id: 'submitted-by',
        type: 'submittedBy',
        label: 'Submitted by: All users',
        value: 'all',
      });
    }

    return pills;
  }, [searchText, caseTypes, statuses, submittedBy, showSubmittedByFilter]);

  /**
   * Handle removing a specific filter pill
   */
  const handleRemovePill = (pill: typeof filterPills[0]) => {
    switch (pill.type) {
      case 'search':
        onSearchChange('');
        break;
      case 'caseType':
        onCaseTypeToggle(pill.value);
        break;
      case 'status':
        onStatusToggle(pill.value);
        break;
      case 'submittedBy':
        onSubmittedByChange('me');
        break;
    }
  };

  /**
   * Handle form submission (Enter key support)
   */
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onApplyFilters();
  };

  /**
   * Check if any filters are active (for better UX feedback)
   */
  const hasActiveFilters = 
    searchText.trim() !== '' || 
    caseTypes.length > 0 || 
    statuses.length > 0 ||
    (showSubmittedByFilter && submittedBy === 'all');

  return (
    <form onSubmit={handleFormSubmit} role="search" aria-label="Filter applications">
      <h2 className="govuk-heading-m">Filter</h2>

      {/* Selected Filters Pills */}
      {filterPills.length > 0 && (
        <div className="govuk-!-margin-bottom-4" data-testid="selected-filters">
          <h3 className="govuk-heading-s govuk-!-margin-bottom-3">
            Selected filters
          </h3>
          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              marginBottom: '15px'
            }}
          >
            {filterPills.map(pill => (
              <span
                key={pill.id}
                className="govuk-tag govuk-tag--blue"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 8px',
                }}
              >
                <span>{pill.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePill(pill)}
                  aria-label={`Remove ${pill.label} filter`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '0 0 0 4px',
                    fontSize: '18px',
                    lineHeight: '1',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - Moved to top after pills */}
      <div className="govuk-button-group govuk-!-margin-bottom-6">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          aria-label="Apply selected filters"
        >
          Apply filters
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={onClearFilters}
            aria-label="Clear all filters and reset to default view"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Visual separator */}
      <hr 
        className="govuk-section-break govuk-section-break--m govuk-section-break--visible" 
        aria-hidden="true"
      />

      {/* Search */}
      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-!-font-weight-bold"
          htmlFor="search"
        >
          Search
        </label>
        <div className="govuk-hint" id="search-hint">
          Search by DESNZ reference or your reference
        </div>
        <input
          className="govuk-input"
          id="search"
          name="search"
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-describedby="search-hint"
          autoComplete="off"
        />
      </div>

      {/* Submitted by - Only shown for coordinators/admins */}
      {showSubmittedByFilter && (
        <div className="govuk-form-group">
          <fieldset 
            className="govuk-fieldset"
            aria-describedby="submitted-by-hint"
          >
            <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
              Submitted by
            </legend>
            <div className="govuk-hint govuk-!-margin-bottom-2" id="submitted-by-hint">
              Filter by applications you created or all team applications
            </div>
            <div className="govuk-radios govuk-radios--small">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="submitted-me"
                  name="submitted-by"
                  type="radio"
                  value="me"
                  checked={submittedBy === "me"}
                  onChange={() => onSubmittedByChange("me")}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor="submitted-me"
                >
                  Me
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="submitted-all"
                  name="submitted-by"
                  type="radio"
                  value="all"
                  checked={submittedBy === "all"}
                  onChange={() => onSubmittedByChange("all")}
                />
                <label
                  className="govuk-label govuk-radios__label"
                  htmlFor="submitted-all"
                >
                  All users
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      )}

      {/* Case type */}
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Case type
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small">
            {CASE_TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`case-type-${option.value}`}
                  name="case-type"
                  type="checkbox"
                  value={option.value}
                  checked={caseTypes.includes(option.value)}
                  onChange={() => onCaseTypeToggle(option.value)}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={`case-type-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Status of application */}
      <div className="govuk-form-group">
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-!-font-weight-bold">
            Status of application
          </legend>
          <div className="govuk-checkboxes govuk-checkboxes--small">
            {STATUS_OPTIONS.map((option) => (
              <div key={option.value} className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={`status-${option.value}`}
                  name="status"
                  type="checkbox"
                  value={option.value}
                  checked={statuses.includes(option.value)}
                  onChange={() => onStatusToggle(option.value)}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={`status-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </form>
  );
};

// Display name for React DevTools
WorkbasketFilters.displayName = 'WorkbasketFilters';
