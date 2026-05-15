/**
 * Constants for Application Within Three Months page
 */

import { SHARED_BREADCRUMBS, SHARED_YES_NO_OPTIONS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Is your application being submitted within three months of the Notice to Remove?",
  HELPER_TEXT: "Applications can be submitted at any time, but necessarily should be to obtain the electric line or apparatus has not had three months from the date the wayleave has come to an end. The application must have been submitted more than three months after the Notice to Remove was sent.",
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if your application is being submitted within three months of the Notice to Remove",
} as const;

export const OPTIONS = SHARED_YES_NO_OPTIONS;
