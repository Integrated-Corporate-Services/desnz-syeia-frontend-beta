/**
 * Shared constants used across multiple ApplicationDetails pages
 * Consolidates common breadcrumbs, labels, and error messages to follow DRY principle
 */

/**
 * Common breadcrumb labels used across all ApplicationDetails pages
 */
export const SHARED_BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

/**
 * Common date input field labels
 */
export const SHARED_DATE_LABELS = {
  DAY_LABEL: "Day",
  MONTH_LABEL: "Month",
  YEAR_LABEL: "Year",
} as const;

/**
 * Common date validation error messages
 */
export const SHARED_DATE_ERRORS = {
  MISSING_DATE: "Enter the date",
  MISSING_DAY: "Date must include a day",
  MISSING_MONTH: "Date must include a month",
  MISSING_YEAR: "Date must include a year",
  INVALID_DAY: "Day must be a number between 1 and 31",
  INVALID_MONTH: "Month must be a number between 1 and 12",
  INVALID_YEAR: "Year must be a 4-digit number",
  INVALID_DATE: "Date must be a real date",
  FUTURE_DATE: "Date cannot be in the future",
} as const;

/**
 * Common file upload labels
 */
export const SHARED_UPLOAD_LABELS = {
  DOCUMENTS_UPLOADED: "Documents uploaded",
} as const;
