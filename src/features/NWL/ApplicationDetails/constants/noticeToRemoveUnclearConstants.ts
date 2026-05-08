/**
 * Constants for Notice to Remove Unclear page
 */

import { SHARED_BREADCRUMBS, SHARED_TEXTAREA_LIMITS, SHARED_TEXTAREA_ERRORS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "Explain why you consider the Notice to Remove to be unclear",
  HELPER_TEXT: "Without a clear request to remove the electric line or apparatus you should not apply for a necessary wayleave. You may contact the owner or occupier before your application to check if they are happy for you to proceed and inform them that they can submit a new notice at any time.",
  ...SHARED_TEXTAREA_LIMITS,
} as const;

export const FORM_ERRORS = {
  MISSING_EXPLANATION: "Enter an explanation of why you consider the Notice to Remove to be unclear",
  ...SHARED_TEXTAREA_ERRORS,
} as const;
