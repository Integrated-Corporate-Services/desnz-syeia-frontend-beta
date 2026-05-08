/**
 * Constants for Grounds For Application page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "Choose the relevant option for this application",
  HELPER_TEXT: "You must choose the option that applies to this application for a necessary wayleave to retain existing lines, as per ",
  LEGISLATION_LINK_TEXT: "Paragraphs 8(2)(a) and 8 of Schedule 4 to the Electricity Act 1989 (opens in a new tab)",
  LEGISLATION_LINK_URL: "https://www.legislation.gov.uk/ukpga/1989/29/schedule/4/paragraph/8",
  GUIDANCE_LINK_TEXT: "See the full guidance (opens in a new tab)",
  GUIDANCE_LINK_URL: "https://www.gov.uk/guidance/necessary-wayleaves-and-tree-felling-or-lopping-applying-for-consent",
} as const;

export const FORM_ERRORS = {
  MISSING_GROUNDS: "Select the relevant option for this application",
} as const;

export const GROUNDS_OPTIONS = [
  {
    value: "wayleave_expired",
    label: "The wayleave has expired",
    hint: "The objector must have served a Notice to Remove at any time within 3 months before the wayleave's end date or after it has expired. Paragraphs 8(1)(a) and 8(2)(a) apply to this option.",
  },
  {
    value: "wayleave_terminated",
    label: "The wayleave has been terminated",
    hint: "The objector must have served a Notice to Remove, after the end of the termination period in line with a Notice to Terminate. Paragraphs 8(1)(a) and 8(2)(a) apply to this option.",
  },
  {
    value: "no_wayleave_exists",
    label: "No wayleave exists",
    hint: "The objector must have served a Notice to Remove following a change in ownership or occupation of the land. Paragraphs 8(1)(a) and 8(2)(a) apply to this option.",
  },
] as const;
