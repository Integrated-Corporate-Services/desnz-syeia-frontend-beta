/**
 * Constants for Notice to Terminate page
 */

import { SHARED_BREADCRUMBS, SHARED_DATE_LABELS, SHARED_DATE_ERRORS, SHARED_UPLOAD_LABELS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Provide the Notice to Terminate",
  DATE_INSTRUCTION: "Enter the date the Notice to Terminate was served by the objector",
  UPLOAD_LABEL: "Upload any documents and correspondence related to the Notice to Terminate",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
  ...SHARED_UPLOAD_LABELS,
  ...SHARED_DATE_LABELS,
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of the Notice to Terminate",
  FUTURE_DATE: "Date must be in the past",
  MISSING_DAY: SHARED_DATE_ERRORS.MISSING_DAY,
  MISSING_MONTH: SHARED_DATE_ERRORS.MISSING_MONTH,
  MISSING_YEAR: SHARED_DATE_ERRORS.MISSING_YEAR,
  INVALID_DAY: SHARED_DATE_ERRORS.INVALID_DAY,
  INVALID_MONTH: SHARED_DATE_ERRORS.INVALID_MONTH,
  INVALID_YEAR: SHARED_DATE_ERRORS.INVALID_YEAR,
  INVALID_DATE: SHARED_DATE_ERRORS.INVALID_DATE,
  NO_FILES: "Upload at least one document",
} as const;
