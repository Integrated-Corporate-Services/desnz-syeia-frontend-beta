/**
 * Constants for Notice to Remove page
 */

import { SHARED_BREADCRUMBS, SHARED_DATE_LABELS, SHARED_DATE_ERRORS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Provide the Notice to Remove",
  DATE_LABEL: "Date of Notice to Remove sent by the owner or occupier",
  UPLOAD_LABEL: "Upload any documents and correspondence related to the Notice to Remove",
  UPLOAD_HINT: "You can upload .pdf, .png, .jpeg, .doc, .docx and .xlsx files. Files cannot be password protected.",
  ...SHARED_DATE_LABELS,
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of Notice to Remove",
  FUTURE_DATE: "Date must be in the past",
  MISSING_DAY: SHARED_DATE_ERRORS.MISSING_DAY,
  MISSING_MONTH: SHARED_DATE_ERRORS.MISSING_MONTH,
  MISSING_YEAR: SHARED_DATE_ERRORS.MISSING_YEAR,
  INVALID_DAY: SHARED_DATE_ERRORS.INVALID_DAY,
  INVALID_MONTH: SHARED_DATE_ERRORS.INVALID_MONTH,
  INVALID_YEAR: SHARED_DATE_ERRORS.INVALID_YEAR,
  INVALID_DATE: SHARED_DATE_ERRORS.INVALID_DATE,
} as const;
