/**
 * Constants for Application Within Three Months page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Is your application being submitted within three months of the Notice to Remove?",
  HELPER_TEXT: "Applications can be submitted at any time, but necessarily should be to obtain the electric line or apparatus has not had three months from the date the wayleave has come to an end. The application must have been submitted more than three months after the Notice to Remove was sent.",
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if your application is being submitted within three months of the Notice to Remove",
} as const;

export const OPTIONS = [
  {
    value: "yes",
    label: "Yes",
  },
  {
    value: "no",
    label: "No",
  },
] as const;
