/**
 * Constants for Standard Term page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Are you applying for the standard term of 15 years?",
  HELPER_TEXT: "Necessary wayleaves are normally granted for 15 years, but in exceptional cases a shorter or longer term may be granted.",
  TEXTAREA_LABEL: "Tell us what term you are requesting and explain why it is justified",
  CHAR_LIMIT: 4000,
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if you are applying for the standard term of 15 years",
  MISSING_EXPLANATION: "Enter an explanation of what term you are requesting and why",
  EXCEEDS_LIMIT: "Explanation must be 4000 characters or fewer",
} as const;

export const OPTIONS = [
  {
    value: "yes",
    label: "Yes",
  },
  {
    value: "no",
    label: "No",
    conditional: true,
  },
] as const;
