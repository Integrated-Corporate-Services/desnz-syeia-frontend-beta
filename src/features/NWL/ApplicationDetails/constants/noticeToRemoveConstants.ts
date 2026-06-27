/**
 * Constants for Notice to Remove page
 */

import { SHARED_BREADCRUMBS, SHARED_DATE_LABELS, SHARED_DATE_ERRORS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Provide the Notice to Remove",
  DATE_LABEL: "Enter the date the Notice to Remove was served by the objector",
  UPLOAD_LABEL: "Upload any documents and correspondence related to the Notice to Remove",
  UPLOAD_HINT: "You can upload .pdf, .png, .jpeg, .doc, .docx and .xlsx files. Files cannot be password protected.",
  ...SHARED_DATE_LABELS,
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of Notice to Remove",
  FUTURE_DATE: "Date the Notice to Remove was served cannot be in the future",
  MISSING_DAY: SHARED_DATE_ERRORS.MISSING_DAY,
  MISSING_MONTH: SHARED_DATE_ERRORS.MISSING_MONTH,
  MISSING_YEAR: SHARED_DATE_ERRORS.MISSING_YEAR,
  INVALID_DAY: SHARED_DATE_ERRORS.INVALID_DAY,
  INVALID_MONTH: SHARED_DATE_ERRORS.INVALID_MONTH,
  INVALID_YEAR: SHARED_DATE_ERRORS.INVALID_YEAR,
  INVALID_DATE: SHARED_DATE_ERRORS.INVALID_DATE,
  NO_FILES: "Upload at least one document",
} as const;
