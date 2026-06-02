/**
 * Constants for Notice to Remove Clear page
 */

import { SHARED_BREADCRUMBS, SHARED_YES_NO_OPTIONS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Does the Notice to Remove clearly refer to the removal of the electric line?",
  HELPER_TEXT: "The Notice to Remove must make a clear reference to the removal of the electric line or apparatus from the land.",
  GUIDANCE_TITLE: "See more requirements for a Notice to Remove",
  GUIDANCE_CONTENT: `The Notice to Remove must make a clear reference to the removal of the electric line or apparatus from the land.

It should not simply be a request to reposition, move, divert, relocate or underground the electric line, unless the notice also makes clear that the line must be removed from the land.

A request to the licence holder to make contact and discuss what can be done about the electric line is not a Notice to Remove.`,
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if the Notice to Remove clearly refers to the removal of the electric line",
} as const;

export const OPTIONS = SHARED_YES_NO_OPTIONS;

