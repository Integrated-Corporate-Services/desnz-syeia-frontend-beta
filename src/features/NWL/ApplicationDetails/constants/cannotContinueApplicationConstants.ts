/**
 * Constants for Cannot Continue Application page
 */

import { SHARED_BREADCRUMBS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "You cannot complete this section now",
  HELPER_TEXT: "The termination period has not expired. A Notice to Remove cannot be served by the objector until the termination period has expired.",
  GUIDANCE_TEXT: "You should inform the objector that the termination period has not yet expired.",
  INFO_TEXT: "If you return to your task list, we'll save your progress and all the information you've entered so far.",
  SAVE_FOR_LATER_BUTTON: "Save for later",
  RETURN_TO_TASK_LIST_BUTTON: "Return to task list",
} as const;
