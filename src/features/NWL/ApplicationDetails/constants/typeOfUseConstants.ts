/**
 * Constants for Type of Use page
 */

import { SHARED_BREADCRUMBS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Is this application for new or existing electric lines?",
} as const;

export const FORM_ERRORS = {
  MISSING_TYPE_OF_USE: "Select if this application is for new or existing electric lines",
} as const;

export const TYPE_OF_USE_OPTIONS = [
  {
    value: "new_lines",
    label: "New lines",
  },
  {
    value: "existing_lines",
    label: "Existing lines",
  },
] as const;
