/**
 * Constants for Termination Period Expired page
 */

import { SHARED_BREADCRUMBS, SHARED_YES_NO_OPTIONS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Has the termination period expired?",
  HELPER_TEXT: "If the termination period has not expired, a Notice to Remove cannot be served by the current owner or occupier. You should not make an application until the termination period has expired.",
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if the termination period has expired",
} as const;

export const OPTIONS = SHARED_YES_NO_OPTIONS;
