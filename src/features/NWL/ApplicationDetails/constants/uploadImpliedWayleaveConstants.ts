/**
 * Constants for Upload Implied Wayleave page
 */

import { SHARED_BREADCRUMBS, SHARED_UPLOAD_LABELS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Upload evidence of the implied wayleave",
  HELPER_TEXT: "Upload evidence of the conduct that led to the creation of an implied wayleave. For example, a history of payments showing that rent was being paid.",
  UPLOAD_LABEL: "Upload evidence of the implied wayleave / Upload the relevant documents?",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
  ...SHARED_UPLOAD_LABELS,
} as const;

export const FORM_ERRORS = {
  NO_FILES: "Upload at least one document",
} as const;
