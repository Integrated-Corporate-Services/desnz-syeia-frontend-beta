/**
 * Constants for Notice to Terminate page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Date of the Notice to Terminate",
  DATE_QUESTION: "When did the owner or occupier serve the Notice to Terminate?",
  DAY_LABEL: "Day",
  MONTH_LABEL: "Month",
  YEAR_LABEL: "Year",
  DOCUMENTS_UPLOADED_LABEL: "Documents uploaded",
  UPLOAD_LABEL: "Upload a copy of any relevant documents and correspondence related to the Notice to Terminate",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls and .xlsx files of up to 25MB each. Files cannot be password protected.",
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of the Notice to Terminate",
  MISSING_DAY: "Date must include a day",
  MISSING_MONTH: "Date must include a month",
  MISSING_YEAR: "Date must include a year",
  INVALID_DAY: "Day must be a number between 1 and 31",
  INVALID_MONTH: "Month must be a number between 1 and 12",
  INVALID_YEAR: "Year must be a 4-digit number",
  INVALID_DATE: "Date must be a real date",
  FUTURE_DATE: "Date must be in the past",
} as const;
