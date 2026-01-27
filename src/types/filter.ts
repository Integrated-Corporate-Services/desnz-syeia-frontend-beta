/**
 * Filter Types
 * 
 * Type definitions for dashboard filtering functionality.
 * Follows Type Safety principles and supports URL-driven state.
 * 
 * @module types/filter
 */

import type { TabType } from '../features/Workbasket/constants/filterOptions';

/**
 * Submitted by filter type
 * 'me' - Show only user's own applications
 * 'all' - Show all applications (team/organization)
 */
export type SubmittedByType = 'me' | 'all';

/**
 * Complete filter state interface
 * Represents all filterable parameters in the dashboard
 */
export interface FilterState {
  /** Active tab (determines application status group) */
  tab: TabType;
  /** Search text for DESNZ ref or Your ref */
  searchText: string;
  /** Selected case types (multi-select) */
  caseTypes: string[];
  /** Selected statuses (multi-select) */
  statuses: string[];
  /** Submitted by filter value */
  submittedBy: SubmittedByType;
  /** Current page number (for pagination) */
  page: number;
  /** Items per page (for pagination) */
  limit: number;
}

/**
 * Pagination metadata returned from backend
 * Used for displaying page controls and counts
 */
export interface PaginationMetadata {
  /** Total number of applications matching filters */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of pages */
  pages: number;
}

/**
 * Default filter state values
 * Used for initialization and reset operations
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  tab: 'draft',
  searchText: '',
  caseTypes: [],
  statuses: [],
  submittedBy: 'me',
  page: 1,
  limit: 10,
};

/**
 * Type guard to check if a value is a valid TabType
 * 
 * @param value - Value to check
 * @returns True if value is a valid TabType
 */
export const isValidTabType = (value: unknown): value is TabType => {
  return (
    typeof value === 'string' &&
    ['draft', 'active', 'completed', 'archived'].includes(value)
  );
};

/**
 * Type guard to check if a value is a valid SubmittedByType
 * 
 * @param value - Value to check
 * @returns True if value is a valid SubmittedByType
 */
export const isValidSubmittedByType = (value: unknown): value is SubmittedByType => {
  return typeof value === 'string' && ['me', 'all'].includes(value);
};
