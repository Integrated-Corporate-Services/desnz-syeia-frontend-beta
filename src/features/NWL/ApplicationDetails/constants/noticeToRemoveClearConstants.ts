/**
 * Constants for Notice to Remove Clear page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Does the Notice to Remove clearly refer to the removal of the electric line?",
  HELPER_TEXT: "The Notice to Remove must make a clear reference to the removal of the electric line or apparatus from the land.",
  GUIDANCE_TITLE: "See more requirements for a Notice to Remove",
  GUIDANCE_CONTENT: `It should not simply be a request to negotiate, move, divert, reposition or change the electric line.

If there is no explicit reference to removing (or uninstalling) the electric line from the owner or occupier, you cannot continue unless you have spoken to or got consent from the Secretary of State before you apply.

A request to the owner holder to remove the electric line because the owner or occupier would like to discuss removing/moving it will not be considered a Notice to Remove.`,
} as const;

export const FORM_ERRORS = {
  MISSING_SELECTION: "Select yes if the Notice to Remove clearly refers to the removal of the electric line",
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
