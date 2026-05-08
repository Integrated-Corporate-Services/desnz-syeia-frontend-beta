/**
 * Constants for Notice to Remove page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Provide the Notice to Remove",
  DATE_LABEL: "Date of Notice to Remove sent by the owner or occupier",
  DAY_LABEL: "Day",
  MONTH_LABEL: "Month",
  YEAR_LABEL: "Year",
  UPLOAD_LABEL: "Upload any documents and correspondence related to the Notice to Remove",
  UPLOAD_HINT: "You can upload .pdf, .png, .jpeg, .doc, .docx and .xlsx files. Files cannot be password protected.",
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of Notice to Remove",
  MISSING_DAY: "Date must include a day",
  MISSING_MONTH: "Date must include a month",
  MISSING_YEAR: "Date must include a year",
  INVALID_DAY: "Day must be a number between 1 and 31",
  INVALID_MONTH: "Month must be a number between 1 and 12",
  INVALID_YEAR: "Year must be a 4-digit number",
  INVALID_DATE: "Date must be a real date",
  FUTURE_DATE: "Date must be in the past",
} as const;
