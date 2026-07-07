/**
 * Constants for Upload Implied Wayleave page
 */

import { SHARED_BREADCRUMBS, SHARED_UPLOAD_LABELS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Provide evidence of the implied wayleave",
  HELPER_TEXT: "You must provide evidence of the actions that led to the creation of an implied wayleave. For example, a history of payments showing the date of each payment.",
  UPLOAD_LABEL: "Upload evidence of the implied wayleave",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
  ...SHARED_UPLOAD_LABELS,
} as const;

export const FORM_ERRORS = {
  NO_FILES: "Upload at least one document",
} as const;
