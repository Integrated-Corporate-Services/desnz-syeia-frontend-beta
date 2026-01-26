/**
 * ApplicationTable Component
 * 
 * Displays applications in a data table with tab-specific columns.
 * Follows GOV.UK Design System table patterns.
 * 
 * @module features/Workbasket/components/ApplicationTable
 */

import React, { useMemo } from "react";
import { useApplicationNavigation } from "../../../hooks";
import type { Application } from "../../../types/application";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import type { TabType } from "../constants/filterOptions";

/**
 * Date formatting utility (Pure function)
 * Formats ISO date string to UK format (DD/MM/YYYY)
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string or fallback
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "—"; // Em dash for missing dates

  try {
    const date = new Date(dateString);
    
    // Check for invalid date
    if (isNaN(date.getTime())) {
      return "—";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return "—";
  }
};

/**
 * Get case type display label
 * Pure function for mapping case type values to display labels
 * 
 * @param type - Application type code
 * @returns Display label
 */
const getCaseTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    's37': 'Overhead lines (S37)',
    's-37': 'Overhead lines (S37)',
    'nwl': 'Necessary wayleaves',
    'tlp': 'Tree lopping and felling',
    'overhead-lines': 'Overhead lines (S37)',
    'necessary-wayleaves': 'Necessary wayleaves',
    'tree-lopping': 'Tree lopping and felling',
  };

  return typeMap[type.toLowerCase()] || type;
};

/**
 * Date column configuration for each tab
 * Following Open/Closed Principle - easy to extend without modifying existing code
 * 
 * Note: completed_at and archived_at fields will be added to Application type in Phase 3
 * For now, falling back to submitted_at or created_at
 */
const DATE_COLUMN_CONFIG: Record<TabType, { label: string; getDate: (app: Application) => string | undefined }> = {
  draft: { 
    label: 'Date started', 
    getDate: (app) => app.created_at 
  },
  active: { 
    label: 'Date submitted', 
    getDate: (app) => app.submitted_at || app.created_at 
  },
  completed: { 
    label: 'Date completed', 
    // TODO Phase 3: Use app.completed_at when backend field is added
    getDate: (app) => app.submitted_at || app.created_at 
  },
  archived: { 
    label: 'Date archived', 
    // TODO Phase 3: Use app.archived_at when backend field is added
    getDate: (app) => app.created_at 
  },
};

/**
 * Props interface following Interface Segregation Principle
 */
type Props = {
  /** Array of applications to display */
  applications: Application[];
  /** Active tab determines which date column to show - defaults to 'active' */
  activeTab?: TabType;
};

/**
 * ApplicationTable Component
 * 
 * Displays applications in a GOV.UK compliant data table with:
 * - Tab-specific date columns
 * - Semantic status badges
 * - Accessible markup
 * - Optimized rendering with memoization
 * 
 * @param props - Component props
 * @returns React component
 */
export const ApplicationTable: React.FC<Props> = ({ applications, activeTab = 'active' }) => {
  const { navigateToApplication } = useApplicationNavigation();

  /**
   * Get date column configuration for active tab
   * Defensive coding: default to 'active' if invalid tab provided
   */
  const dateColumnConfig = DATE_COLUMN_CONFIG[activeTab] || DATE_COLUMN_CONFIG.active;

  /**
   * Sort applications by date (most recent first)
   * Memoized to avoid unnecessary re-sorting
   */
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [applications]);

  /**
   * Handle application link click
   */
  const handleApplicationClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    app: Application
  ) => {
    e.preventDefault();
    navigateToApplication(app.type, app.application_id, "task-list");
  };

  return (
    <table className="govuk-table" aria-label="Applications list">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">
            DESNZ reference
          </th>
          <th scope="col" className="govuk-table__header">
            Your reference
          </th>
          <th scope="col" className="govuk-table__header">
            Case type
          </th>
          <th scope="col" className="govuk-table__header">
            Status
          </th>
          <th scope="col" className="govuk-table__header">
            {dateColumnConfig.label}
          </th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {sortedApplications.map((app) => (
          <tr className="govuk-table__row" key={app.application_id}>
            {/* DESNZ Reference - Clickable link */}
            <td className="govuk-table__cell">
              <a
                href="#"
                className="govuk-link"
                aria-label={`View application ${app.operator_ref || 'details'}`}
                onClick={(e) => handleApplicationClick(e, app)}
              >
                {app.operator_ref || 'N/A'}
              </a>
            </td>

            {/* Your Reference */}
            <td className="govuk-table__cell">
              {app.your_reference || "—"}
            </td>

            {/* Case Type */}
            <td className="govuk-table__cell">
              {getCaseTypeLabel(app.type)}
            </td>

            {/* Status - Using StatusBadge component */}
            <td className="govuk-table__cell">
              <StatusBadge status={app.status} />
            </td>

            {/* Date - Tab-specific column */}
            <td className="govuk-table__cell">
              {formatDate(dateColumnConfig.getDate(app))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Display name for React DevTools
ApplicationTable.displayName = 'ApplicationTable';

export default ApplicationTable;
