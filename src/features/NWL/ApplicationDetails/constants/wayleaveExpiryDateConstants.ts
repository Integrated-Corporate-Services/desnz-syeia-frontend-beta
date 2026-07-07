/**
 * Constants for Wayleave Expiry Date page
 */

import { SHARED_BREADCRUMBS, SHARED_DATE_LABELS, SHARED_DATE_ERRORS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Confirm the expiry date",
  DATE_LABEL: "Expiry date",
  UPLOAD_LABEL: "Upload the relevant documents",
  UPLOAD_HINT: "You can upload .pdf, .png, .jpeg, .doc, .docx and .xlsx files. Files cannot be password protected.",
  ...SHARED_DATE_LABELS,
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the expiry date",
  MISSING_DAY: "Expiry date must include a day",
  MISSING_MONTH: "Expiry date must include a month",
  MISSING_YEAR: "Expiry date must include a year",
  INVALID_DATE: "Expiry date must be a real date",
  FUTURE_DATE: "Expiry date cannot be in the future",
  INVALID_DAY: SHARED_DATE_ERRORS.INVALID_DAY,
  INVALID_MONTH: SHARED_DATE_ERRORS.INVALID_MONTH,
  INVALID_YEAR: SHARED_DATE_ERRORS.INVALID_YEAR,
  NO_FILES: "Upload at least one document",
} as const;
