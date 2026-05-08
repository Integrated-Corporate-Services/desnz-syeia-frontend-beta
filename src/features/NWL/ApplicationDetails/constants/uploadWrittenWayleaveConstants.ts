/**
 * Constants for Upload Written Wayleave page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Upload evidence of the written wayleave",
  DOCUMENTS_UPLOADED_LABEL: "Documents uploaded",
  UPLOAD_LABEL: "Upload the relevant documents",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
} as const;

export const FORM_ERRORS = {
  NO_FILES: "Upload at least one document",
} as const;
