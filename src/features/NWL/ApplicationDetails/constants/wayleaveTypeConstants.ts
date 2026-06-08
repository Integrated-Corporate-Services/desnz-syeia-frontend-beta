/**
 * Constants for Wayleave Type page
 * Content varies based on grounds_for_application selection
 */

import { SHARED_BREADCRUMBS } from './sharedConstants';

export const BREADCRUMBS = SHARED_BREADCRUMBS;

export const LABELS = {
  PAGE_TITLE: "What type of wayleave existed?",
} as const;

export const FORM_ERRORS = {
  MISSING_TYPE: "Select the type of wayleave that existed",
} as const;

/**
 * Options for WAYLEAVE_EXPIRED flow
 * When grounds_for_application === 'wayleave_expired'
 */
export const WAYLEAVE_EXPIRED_OPTIONS = [
  {
    value: "interim_necessary_wayleave",
    label: "Inherited necessary wayleave",
    hint: "The objector inherited a necessary wayleave over the relevant land, as granted by the Secretary of State.",
  },
  {
    value: "wayleave",
    label: "Wayleave",
    hint: "The objector had a wayleave agreement with the applicant.",
  },
] as const;

export const WAYLEAVE_EXPIRED_DETAILS = {
  // SUMMARY: "What is an inherited wayleave?",
  // TEXT_1: "An inherited necessary wayleave is a contractual wayleave created by conduct. Whether a contractual wayleave arises from conduct will depend on the particular facts of the case.",
  // TEXT_2: "One example of where an inherited wayleave may be created is where the objector has been receiving payments (compensation) for the electric line on their property.",
  // TEXT_3: "For an inherited wayleave to be created, payments must have been made for several years, one or two payments is unlikely to constitute an inherited wayleave.",
  // LINK_TEXT: "Read the guidance (opens in a new tab)",
  // LINK_URL: "https://www.gov.uk/guidance",
} as const;

/**
 * Options for WAYLEAVE_TERMINATED flow
 * When grounds_for_application === 'wayleave_terminated'
 */
export const WAYLEAVE_TERMINATED_OPTIONS = [
  {
    value: "interim_necessary_wayleave",
    label: "Implied wayleave",
    hint: "The objector has an implied wayleave with the applicant.",
  },
  {
    value: "wayleave",
    label: "Wayleave",
    hint: "The objector had a written wayleave agreement with the applicant.",
  },
] as const;

export const WAYLEAVE_TERMINATED_DETAILS = {
  SUMMARY: "What is an implied wayleave?",
  TEXT_1: "An implied wayleave is a contractual wayleave created by conduct. Whether a contractual wayleave arises from conduct will depend on the particular facts of the case.",
  TEXT_2: "One example of where an implied wayleave may be created is where the objector has been receiving payments (compensation) for the electric line on their property.",
  TEXT_3: "For an implied wayleave to be created, payments must have been made for several years, one or two payments is unlikely to constitute an implied wayleave.",
  LINK_TEXT: "guidance (opens in a new tab)",
  LINK_URL: "https://www.gov.uk/government/publications/granting-a-necessary-compulsory-electricity-wayleave-guidance-for-applicants-and-landowner-and-or-occupiers",
} as const;

/**
 * Legacy options for backward compatibility
 * @deprecated Use WAYLEAVE_EXPIRED_OPTIONS or WAYLEAVE_TERMINATED_OPTIONS instead
 */
export const WAYLEAVE_TYPE_OPTIONS = WAYLEAVE_TERMINATED_OPTIONS;
