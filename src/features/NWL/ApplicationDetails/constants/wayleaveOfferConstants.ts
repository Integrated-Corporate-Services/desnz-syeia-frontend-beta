/**
 * Constants for Wayleave Offer page
 */

import { SHARED_BREADCRUMBS, SHARED_DATE_LABELS, SHARED_DATE_ERRORS, SHARED_UPLOAD_LABELS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Wayleave offer",
  DATE_LABEL: "Date of your offer or letter to the owner or occupier",
  UPLOAD_LABEL: "Upload a copy of the offer or letter",
  UPLOAD_HINT: "You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password protected.",
  ...SHARED_UPLOAD_LABELS,
  ...SHARED_DATE_LABELS,
} as const;

export const FORM_ERRORS = {
  MISSING_DATE: "Enter the date of your offer or letter",
  MISSING_FILE: "Upload a copy of the offer or letter",
  FILE_TOO_LARGE: "The selected file must be smaller than 25MB",
  INVALID_FILE_TYPE: "The selected file must be a PDF, JPG, JPEG, PNG, MSG, DOC, DOCX, XLS or XLSX",
  MISSING_DAY: SHARED_DATE_ERRORS.MISSING_DAY,
  MISSING_MONTH: SHARED_DATE_ERRORS.MISSING_MONTH,
  MISSING_YEAR: SHARED_DATE_ERRORS.MISSING_YEAR,
  INVALID_DAY: SHARED_DATE_ERRORS.INVALID_DAY,
  INVALID_MONTH: SHARED_DATE_ERRORS.INVALID_MONTH,
  INVALID_YEAR: SHARED_DATE_ERRORS.INVALID_YEAR,
  INVALID_DATE: SHARED_DATE_ERRORS.INVALID_DATE,
  FUTURE_DATE: SHARED_DATE_ERRORS.FUTURE_DATE,
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
