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
  REPRESENTATIVE_QUESTION_TITLE: "Does the objector have a  representative?",
  REPRESENTATIVE_DETAILS_TITLE: "Enter the representative's details",
  REPRESENTATIVE_ADDRESS_TITLE: "Enter the representative's address",
  CONTINUE: "Save and continue",
} as const;

export const INTRODUCTION_CONTENT = {
  HEADING: "On the next pages we'll ask you about:",
  POINTS: [
    "the objector - the person who served a Notice to Remove or refused to grant a voluntary wayleave",
    "the landowner, if they are not the objector",
    "any representative appointed by the objector",
  ],
} as const;

export const VALIDATION_LIMITS = {
  FULL_NAME_MAX_LENGTH: 70,
  ADDRESS_LINE1_MAX_LENGTH: 150,
  ADDRESS_LINE2_MAX_LENGTH: 150,
  TOWN_MAX_LENGTH: 100,
  COUNTY_MAX_LENGTH: 100,
  POSTCODE_MAX_LENGTH: 10,
} as const;

export const FORM_ERRORS = {
  MISSING_TITLE: "Select a title",
  MISSING_FULL_NAME: "Enter a full name",
  FULL_NAME_TOO_LONG: `Full name must be ${VALIDATION_LIMITS.FULL_NAME_MAX_LENGTH} characters or less`,
  INVALID_EMAIL: "Enter a valid email address",
  INVALID_PHONE: "Enter a valid phone number",
  MISSING_ADDRESS_LINE1: "Enter address line 1",
  ADDRESS_LINE1_TOO_LONG: `Address line 1 must be ${VALIDATION_LIMITS.ADDRESS_LINE1_MAX_LENGTH} characters or less`,
  ADDRESS_LINE2_TOO_LONG: `Address line 2 must be ${VALIDATION_LIMITS.ADDRESS_LINE2_MAX_LENGTH} characters or less`,
  MISSING_TOWN: "Enter a town or city",
  TOWN_TOO_LONG: `Town or city must be ${VALIDATION_LIMITS.TOWN_MAX_LENGTH} characters or less`,
  COUNTY_TOO_LONG: `County must be ${VALIDATION_LIMITS.COUNTY_MAX_LENGTH} characters or less`,
  MISSING_POSTCODE: "Enter a postcode",
  POSTCODE_TOO_LONG: `Postcode must be ${VALIDATION_LIMITS.POSTCODE_MAX_LENGTH} characters or less`,
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
