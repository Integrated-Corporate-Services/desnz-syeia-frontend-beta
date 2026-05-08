/**
 * Constants for Wayleave Offer page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Wayleave offer",
  DATE_LABEL: "Date of your offer or letter to the owner or occupier",
  DOCUMENTS_UPLOADED: "Documents uploaded",
  UPLOAD_LABEL: "Upload a copy of the offer or letter",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.",
  DAY_LABEL: "Day",
  MONTH_LABEL: "Month",
  YEAR_LABEL: "Year",
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of your offer or letter",
  INVALID_DATE: "Date must be a real date",
  FUTURE_DATE: "Date cannot be in the future",
  MISSING_DAY: "Date must include a day",
  MISSING_MONTH: "Date must include a month",
  MISSING_YEAR: "Date must include a year",
  INVALID_DAY: "Day must be a number between 1 and 31",
  INVALID_MONTH: "Month must be a number between 1 and 12",
  INVALID_YEAR: "Year must be a 4-digit number",
  MISSING_FILE: "Upload a copy of the offer or letter",
  FILE_TOO_LARGE: "The selected file must be smaller than 25MB",
  INVALID_FILE_TYPE: "The selected file must be a PDF, JPG, JPEG, PNG, MSG, DOC, DOCX, XLS or XLSX",
} as const;

export const ACCEPTED_FILE_TYPES = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.msg',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
