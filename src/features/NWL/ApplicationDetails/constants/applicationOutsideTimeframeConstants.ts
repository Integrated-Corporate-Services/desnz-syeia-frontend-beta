/**
 * Constants for Application Outside Timeframe page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Why is your application being submitted more than 3 months after the Notice to Remove?",
  HELPER_TEXT: "You need to provide a justification if your application is outside the three-month timeframe. This will be reviewed in the processing of your application.",
  TEXTAREA_LABEL: "Explain why your application is outside the three-month timeframe",
  CHAR_LIMIT: 4000,
} as const;

export const FORM_ERRORS = {
  MISSING_EXPLANATION: "Enter an explanation of why your application is outside the three-month timeframe",
  EXCEEDS_LIMIT: "Explanation must be 4000 characters or fewer",
} as const;
