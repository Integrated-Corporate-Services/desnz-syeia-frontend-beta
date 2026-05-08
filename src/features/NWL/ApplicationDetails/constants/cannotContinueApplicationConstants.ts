/**
 * Constants for Cannot Continue Application page
 */

import { SHARED_BREADCRUMBS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "You cannot continue this application yet",
  HELPER_TEXT: "The termination period has not expired. A Notice to Remove cannot be served by the current owner or occupier until the termination period has expired.",
  GUIDANCE_TITLE: "You should:",
  GUIDANCE_POINTS: [
    "inform the owner or occupier that the termination period has not yet expired",
    "save this application for later and return when the termination period has expired",
  ],
  CONTACT_INFO: "If you're unsure for what time-period on this application will be kept. You can contact us from your application dashboard.",
  SAVE_FOR_LATER_BUTTON: "Save for later",
  RETURN_TO_TASK_LIST_BUTTON: "Return to task list",
} as const;
