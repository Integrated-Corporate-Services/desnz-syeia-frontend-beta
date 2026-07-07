/**
 * Constants for Application Within Three Months page
 */

import { SHARED_BREADCRUMBS, SHARED_YES_NO_OPTIONS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Is your application being submitted within three months of the Notice to Remove?",
  HELPER_TEXT: "Applications can be submitted at any time, but temporary rights to retain the electric line on the property will not have been secured if the application is submitted more than three months after the Notice to Remove has been served.",
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if your application is being submitted within three months of the Notice to Remove",
} as const;

export const OPTIONS = SHARED_YES_NO_OPTIONS;
