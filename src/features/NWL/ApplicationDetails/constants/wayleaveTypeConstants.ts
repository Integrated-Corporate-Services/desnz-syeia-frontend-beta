/**
 * Constants for Wayleave Type page
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  APPLICATION_DETAILS: "Application details",
} as const;

export const LABELS = {
  PAGE_TITLE: "What type of wayleave existed?",
  DETAILS_SUMMARY: "What is an implied wayleave?",
  DETAILS_TEXT_1: "An implied wayleave is a contractual wayleave, created by conduct. Whether a contractual wayleave arises from conduct will depend on the particular facts of the case.",
  DETAILS_TEXT_2: "One example of where an implied wayleave may be created is, where the owner or occupier has been receiving payments (compensation) for the electric line on their property.",
  DETAILS_TEXT_3: "For an implied wayleave to be created, payments must have made for several years, one or two payments is unlikely to constitute an implied wayleave.",
  DETAILS_LINK_TEXT: "Read the guidance (opens in a new tab)",
  DETAILS_LINK_URL: "https://www.gov.uk/guidance",
} as const;

export const FORM_ERRORS = {
  MISSING_TYPE: "Select the type of wayleave that existed",
} as const;

export const WAYLEAVE_TYPE_OPTIONS = [
  {
    value: "interim_necessary_wayleave",
    label: "Implied wayleave",
    hint: "The current owner or occupier has an implied wayleave with the applicant.",
  },
  {
    value: "wayleave",
    label: "Wayleave",
    hint: "The current owner or occupier had a written wayleave agreement with the applicant.",
  },
] as const;
