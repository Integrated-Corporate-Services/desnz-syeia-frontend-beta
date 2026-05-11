/**
 * Constants for NWL Check Your Answers page
 * Following GDS Design System patterns and terminology
 */

export const BREADCRUMBS = {
  TASK_LIST: "Task list",
  CHECK_YOUR_ANSWERS: "Check your answers",
} as const;

export const PAGE_LABELS = {
  TITLE: "Check your answers before sending your application",
  SUBMIT_BUTTON: "Accept and send application",
  SAVE_FOR_LATER: "Save for later",
} as const;

export const SECTION_HEADINGS = {
  APPLICANT_DETAILS: "Applicant details",
  NETWORK_OPERATOR_DETAILS: "Network operator contact details",
  APPLICATION_DETAILS: "Application details",
  NOTICE_AND_COMPLIANCE: "Notice and compliance",
  OWNER_OCCUPIER_DETAILS: "Owner and/or occupier details",
  LANDOWNER_DETAILS: "Landowner details",
  REPRESENTATIVE_DETAILS: "Representative details",
  LAND_DETAILS: "Land details",
  ASSETS: "Assets",
  NEGOTIATIONS: "Negotiations",
  ADDITIONAL_INFORMATION: "Additional information",
  DECLARATION: "Declaration",
} as const;

export const FIELD_LABELS = {
  // Applicant details
  APPLICANT_NAME: "Applicant name",
  APPLICANT_DETAILS: "Applicant details",
  YOUR_REFERENCE: "Your reference",
  OPERATOR_REFERENCE: "Operator reference",
  ORGANISATION_NAME: "Organisation name",
  ADDRESS: "Address",
  EMAIL: "Email address",
  PHONE: "Phone number",
  
  // Network operator contact
  CONTACT_NAME: "Contact name",
  CONTACT_EMAIL: "Contact email",
  CONTACT_PHONE: "Contact phone",
  
  // Application details
  APPLICATION_TYPE: "Application type",
  TYPE_OF_USE: "Type of use",
  WAYLEAVE_OFFER_DATE: "Wayleave offer date",
  GROUNDS_FOR_APPLICATION: "Grounds for application",
  WAYLEAVE_TYPE: "Wayleave type",
  
  // Notice and compliance
  WAYLEAVE_EXPIRY_DATE: "Wayleave expiry date",
  NOTICE_TO_TERMINATE_DATE: "Notice to terminate date",
  TERMINATION_PERIOD_EXPIRED: "Termination period expired",
  NOTICE_TO_REMOVE_DATE: "Notice to remove date",
  NOTICE_TO_REMOVE_CLEAR: "Is notice to remove clear",
  NOTICE_TO_REMOVE_EXPLANATION: "Explanation",
  WITHIN_THREE_MONTHS: "Application within three months",
  TIMEFRAME_EXPLANATION: "Explanation for outside timeframe",
  STANDARD_TERM: "Standard term",
  STANDARD_TERM_EXPLANATION: "Standard term explanation",
  
  // Objector details
  OBJECTOR_TITLE: "Title",
  OBJECTOR_NAME: "Objector name",
  OBJECTOR_FULL_NAME: "Full name",
  OBJECTOR_ORGANISATION: "Organisation",
  OBJECTOR_EMAIL: "Email",
  OBJECTOR_PHONE: "Phone",
  OBJECTOR_ADDRESS: "Objector address",
  
  // Landowner details
  IS_LANDOWNER: "Is objector also landowner",
  LANDOWNER_TITLE: "Title",
  LANDOWNER_NAME: "Landowner name",
  LANDOWNER_FULL_NAME: "Full name",
  LANDOWNER_ORGANISATION: "Organisation",
  LANDOWNER_EMAIL: "Email",
  LANDOWNER_PHONE: "Phone",
  LANDOWNER_ADDRESS: "Landowner address",
  
  // Representative details
  HAS_REPRESENTATIVE: "Has representative",
  REPRESENTATIVE_TITLE: "Title",
  REPRESENTATIVE_NAME: "Representative name",
  REPRESENTATIVE_FULL_NAME: "Full name",
  REPRESENTATIVE_ORGANISATION: "Organisation",
  REPRESENTATIVE_EMAIL: "Email",
  REPRESENTATIVE_PHONE: "Phone",
  REPRESENTATIVE_ADDRESS: "Representative address",
  
  // Land details
  SITE_ADDRESS: "Site address",
  LAND_REGISTRY_REFERENCE: "Land Registry reference",
  LAND_REGISTRY_DOCUMENT: "Land Registry document",
  OS_GRID_REFERENCE: "OS Grid reference",
  EASTING: "Easting",
  NORTHING: "Northing",
  IDENTIFYING_INFORMATION: "Identifying information",
  
  // Assets
  LINE_TYPE: "Line type",
  LINE_VOLTAGE: "Line voltage",
  LINE_DESCRIPTION: "Description",
  APPLICATION_PLAN: "Application plan",
  PLAN_VERIFICATION: "Plan verification",
  
  // Negotiations
  HAS_NEGOTIATIONS: "Negotiations taken place",
  NEGOTIATION_START_DATE: "Negotiation start date",
  NEGOTIATION_COMMENTS: "Additional comments",
  NEGOTIATION_DOCUMENTS: "Supporting documents",
  NO_NEGOTIATIONS_REASON: "Reason for no negotiations",
  
  // Additional information
  RELATED_APPLICATIONS: "Related applications",
  RELATED_APPLICATIONS_DETAILS: "Details",
  OTHER_IMPORTANT_INFORMATION: "Other important information",
  ADDITIONAL_DOCUMENTS: "Additional documents",
} as const;

export const CHANGE_LINK_TEXT = "Change" as const;

export const DISPLAY_VALUES = {
  YES: "Yes",
  NO: "No",
  NOT_PROVIDED: "Not provided",
  NOT_APPLICABLE: "Not applicable",
} as const;

export const ERROR_MESSAGES = {
  MISSING_DECLARATION: "You must confirm you have read and understood the information",
  FAILED_TO_SAVE: "Failed to save declaration. Please try again.",
  FAILED_TO_LOAD: "Failed to load application data. Please try again.",
} as const;

export const DECLARATION_TEXT = {
  HEADING: "Declaration",
  CONTENT: [
    "I confirm that, to the best of my knowledge and belief, the information I have provided is correct and I understand that:",
    "• giving false or misleading information is a criminal offence",
    "• the information will be processed in accordance with the Data Protection Act 2018",
  ],
  CHECKBOX_LABEL: "I agree that I have read and understood the information I am providing and that it is accurate",
} as const;
