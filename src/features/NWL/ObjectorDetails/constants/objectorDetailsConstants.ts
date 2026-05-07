/**
 * Constants for Objector Details pages
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  OBJECTOR_DETAILS: "Objector details",
} as const;

export const LABELS = {
  INTRODUCTION_TITLE: "The objector and other parties' details",
  OBJECTOR_DETAILS_TITLE: "Enter the objector's details",
  OBJECTOR_ADDRESS_TITLE: "Enter the objector's address",
  LANDOWNER_QUESTION_TITLE: "Is the objector also the landowner?",
  LANDOWNER_DETAILS_TITLE: "Enter the landowner's details",
  LANDOWNER_ADDRESS_TITLE: "Enter the landowner's address",
  REPRESENTATIVE_QUESTION_TITLE: "Is there an objector representative?",
  REPRESENTATIVE_DETAILS_TITLE: "Enter the representative's details",
  REPRESENTATIVE_ADDRESS_TITLE: "Enter the representative's address",
  CONTINUE: "Save and continue",
  SAVE_FOR_LATER: "Save for later",
} as const;

export const INTRODUCTION_CONTENT = {
  HEADING: "On the next pages we'll ask you about:",
  POINTS: [
    "the objector - the person who served a Notice to Remove or counter-notice, or refused to grant a voluntary wayleave",
    "the landowner, if they are not the objector",
    "any representative appointed by the objector",
  ],
} as const;

export const FORM_ERRORS = {
  MISSING_TITLE: "Select a title",
  MISSING_FULL_NAME: "Enter a full name",
  INVALID_EMAIL: "Enter a valid email address",
  INVALID_PHONE: "Enter a valid phone number",
  MISSING_ADDRESS_LINE1: "Enter address line 1",
  MISSING_TOWN: "Enter a town or city",
  MISSING_POSTCODE: "Enter a postcode",
  MISSING_RADIO_SELECTION: "Select an option",
} as const;

export const FORM_LABELS = {
  TITLE: "Title (optional)",
  FULL_NAME: "Full name",
  ORGANISATION: "Organisation (optional)",
  EMAIL: "Email address (optional)",
  PHONE: "Phone number (optional)",
  ADDRESS_LINE1: "Address line 1",
  ADDRESS_LINE2: "Address line 2 (optional)",
  TOWN: "Town or city",
  COUNTY: "County (optional)",
  POSTCODE: "Postcode",
  IS_LANDOWNER_YES: "Yes",
  IS_LANDOWNER_NO: "No",
  HAS_REPRESENTATIVE_YES: "Yes",
  HAS_REPRESENTATIVE_NO: "No",
} as const;

export const FORM_HINTS = {
  LANDOWNER_QUESTION: "If the same person owns the land and served the counter notice, answer Yes.",
} as const;

export const TITLE_OPTIONS = [
  { value: "", text: "Select a title" },
  { value: "Mr", text: "Mr" },
  { value: "Mrs", text: "Mrs" },
  { value: "Miss", text: "Miss" },
  { value: "Ms", text: "Ms" },
  { value: "Dr", text: "Dr" },
  { value: "Prof", text: "Prof" },
  { value: "Rev", text: "Rev" },
  { value: "Other", text: "Other" },
] as const;
