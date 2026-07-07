/**
 * Constants for Notice to Remove Unclear page
 */

import { SHARED_BREADCRUMBS, SHARED_TEXTAREA_LIMITS, SHARED_TEXTAREA_ERRORS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Explain why you think the Notice to Remove is unclear",
  HELPER_TEXT: "You should not apply for a necessary wayleave without a clear request to remove the electric line or apparatus. You may contact the objector to explain why you consider their notice is insufficient to proceed and inform them that they can submit a new notice at any time.",
  ...SHARED_TEXTAREA_LIMITS,
} as const;

export const FORM_ERRORS = {
  MISSING_EXPLANATION: "Explain why you think the Notice to Remove is unclear",
  ...SHARED_TEXTAREA_ERRORS,
} as const;
