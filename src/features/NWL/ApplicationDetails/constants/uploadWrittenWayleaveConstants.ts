/**
 * Constants for Upload Written Wayleave page
 */

import { SHARED_BREADCRUMBS, SHARED_UPLOAD_LABELS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Upload evidence of the written wayleave",
  UPLOAD_LABEL: "Upload the relevant documents",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
  ...SHARED_UPLOAD_LABELS,
} as const;

export const FORM_ERRORS = {
  NO_FILES: "Upload at least one document",
} as const;
