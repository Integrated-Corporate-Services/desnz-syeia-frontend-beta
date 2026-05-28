/**
 * Constants for Network Operator Details page
 */

export const MAX_REFERENCE_LENGTH = 24;

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  NETWORK_OPERATOR: "Applicant details",
} as const;

export const FORM_ERRORS = {
  MISSING_REFERENCE: "Enter a network operator reference (You cannot enter more than 24 characters)",
  INVALID_REFERENCE: "Only letters, numbers, spaces, and hyphens are allowed",
  MISSING_OPERATOR: "Select a network operator",
  MISSING_CONTACT_NAME: "Select a contact name",
  INVALID_EMAIL: "Enter a valid email address",
  DUPLICATE_EMAIL: "This email address has already been added",
  MISSING_ORGANISATION_ID:
    "No organisation selected. Please go back and select an organisation.",
} as const;

export const FORM_LABELS = {
  APPLICANT_REFERENCE: "Applicant's reference",
  APPLICANT_CONTACT: "Applicant contact name",
  EMAIL_ADDRESS: "Email address",
  ADDITIONAL_CONTACTS: "Additional contacts",
} as const;

export const FORM_HINTS = {
  CONSENT_NAME:
    "The consent will be issued in the name of the person selected here",
  ADDITIONAL_CONTACTS:
    "You can add more contact email addresses to this application",
} as const;

export const MESSAGES = {
  CONTACT_NOT_LISTED_TITLE: "The applicant contact is not listed",
  CONTACT_NOT_LISTED_TEXT_1:
    "You must contact the team coordinator in your organisation that you want to create an application for to provide you with access to their organisation.",
  CONTACT_NOT_LISTED_TEXT_2:
    "If you do not know who the team coordinator is then contact the service desk for advice at",
  SERVICE_DESK_EMAIL: "xxx@desnz.com",
} as const;