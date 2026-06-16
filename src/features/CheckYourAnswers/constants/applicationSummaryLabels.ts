// src/features/CheckYourAnswers/constants/applicationSummaryLabels.ts
/**
 * Application Summary UI Labels
 * All user-facing text and labels
 */

export const PAGE_LABELS = {
  TITLE: 'Application summary',
  TITLE_CHECK_ANSWERS: 'Check your answers before sending your application',
  BREADCRUMB_TASK_LIST: 'Task list',
  BREADCRUMB_SUBMIT: 'Submit Section 37 application',
  BACK_LINK: 'Back',
  BACK_LINK_APPLICATION_DASHBOARD: 'Application Dashboard',
  APPLICATION_DASHBOARD_LINK: '/application-dashboard'
} as const;

export const SECTION_HEADINGS = {
  SUMMARY: 'Summary',
  PAYMENT_DETAILS: 'Payment details',
  APPLICANT_DETAILS: 'Applicant details',
  NETWORK_OPERATOR: 'Network operator details',
  PROJECT_DETAILS: 'Project details',
  PROJECT_OVERVIEW: 'Project overview',
  ASSETS: 'Assets',
  ASSETS_INFORMATION: 'Assets Information',
  ROUTES: 'Routes',
  ROUTE: 'Route',
  ROUTE_MAP: 'Route map',
  WORKS_OVERVIEW: 'Works overview',
  PARISHES: 'Parishes',
  SENSITIVE_AREA_CHECK: 'Sensitive area check',
  SENSITIVE_AREA_REVIEW: 'Sensitive area review',
  POST_CONSULTATION_ACTIONS: 'Post consultation actions',
  POST_CONSULTATION: 'Post consultation',
  SUPPORTING_INFORMATION: 'Supporting information',
  EIA_FEES: 'EIA fees',
  CONSULTATION: 'Consultation',
  SUBMIT_APPLICATION: 'Submit application'
} as const;

export const FIELD_LABELS = {
  // Summary fields
  DESNZ_REF: 'DESNZ reference',
  CASE_TYPE: 'Case type',
  STATUS: 'Application status',
  
  // Network operator fields
  OPERATOR_REF: 'Applicant Reference',
  APPLICANT_NAME: 'Applicant name',
  APPLICANT_CONTACT_NAME: 'Applicant contact name',
  ORGANISATION_NAME: 'Organisation name',
  CONTACT_NAME: 'Contact name',
  ADDRESS: 'Address',
  EMAIL: 'Email address',
  PHONE: 'Phone number',
  ADDITIONAL_CONTACTS: 'Additional contacts',
  
  // Payment fields
  PAYMENT_REFERENCE: 'Payment reference number',
  TRANSACTION_NUMBER: 'Transaction number',
  INVOICE: 'Invoice',
  TOTAL_AMOUNT: 'Total amount',
  
  // Project fields
  PROJECT_NAME: 'Project name',
  PROJECT_DESCRIPTION: 'Project description',
  PLAN_REFERENCE: 'Plan reference',
  EARLIEST_WORK_START: 'Earliest work start date',
  LATEST_WORK_START: 'Latest work start date',
  MAX_STRUCTURE_HEIGHT: 'What is the height of the tallest existing pole?',
  LAST_UPDATED: 'Last updated',
  PLAN_INFO_DOCS: 'Plan information documents',
  RELATED_APPLICATIONS: 'Related applications',
  RELATED_APPLICATIONS_DETAILS: 'Related application details',
  RELATED_CPO: 'Related CPO',
  RELATED_CPO_DETAILS: 'Related CPO details',
  
  // Asset fields
  STANDARD_SPEC_REF: 'Standard specification reference number',
  TYPE_OF_LINE: 'Type of Line',
  TORI_NOI_CODE: 'TORI/NOI code for this project',
  LINE_VOLTAGE: 'Line voltage',
  LINE_LENGTH: 'Line length',
  
  WITHDRAWAL_REQUEST_STATUS: 'Withdrawal request',
  WITHDRAWAL_NOTIFICATION_BANNER: 'You sent a request to withdraw this application. This is being reviewed by your case officer.',
  // Route fields
  EASTING: 'Easting',
  NORTHING: 'Northing',
  DISCONNECTED_JUSTIFICATION: 'Disconnected route justification',
  
  // Sensitive area fields
  TOLERANCE_REQUIRED: 'Tolerance required',
  TOLERANCE: 'Tolerance',
  SENSITIVE_AREAS: 'Sensitive areas the route passes through',
  OTHER_AREAS: 'Other areas the route passes through',
  ENV_ARCH_DOCS: 'Environmental and archaeological documents',
  POLES_LINES_SENSITIVE: 'Poles/lines within sensitive areas',
  
  // Parish fields
  PARISH: 'Parish',
  PARISHES: 'Parishes',
  
  ASSET_INFORMATION: 'Assets information',

  //Asset presentation fields
  POLES_WITHIN_SENSITIVE_AREAS: 'There are poles within the sensitive areas',
  POLES_OUTSIDE_SENSITIVE_AREAS: 'All poles are outside of the sensitive areas with only the overhead lines passing above them',
  NO_POLES_SENSITIVE_AREAS: 'No poles are within a sensitive area and no overhead lines pass above them',
  
  // Consultation fields
  CONSULTEE_STATUS: 'Status',
  DATE_CONSULTATION_REQUEST: 'Date of consultation request',
  EVIDENCE_REQUEST: 'Evidence of request',
  CONSULTEE_CONTACT_NAME: 'Consultee contact name',
  CONSULTEE_CONTACT_EMAIL: 'Consultee contact email',
  OBJECTION_RAISED: 'Objection raised',
  DATE_CLOSED: 'Date closed',
  RESPONSE_DOCS: 'Response documents',
  CLOSE_COMMENTS: 'Close comments',
  EVIDENCE_NOT_RECEIVED: 'Evidence of response not received',
  WHY_NOT_REQUIRED: 'Why this consultation is not required',
  SUPPORTING_DOCS: 'Supporting documents',
  FIRST_DATE_PUBLISHED: 'First date published',
  SECOND_DATE_PUBLISHED: 'Second date published',
  EVIDENCE_OF_PUBLICATION: 'Evidence of publication',
  PUBLIC_RESPONSE_DOCS: 'Public response documents',
  COMMENTS: 'Comments'
} as const;

// Post-consultation questions
export const POST_CONSULTATION_QUESTIONS = {
  LPA_CONDITIONS_IMPOSED: "Was the Local Planning Authority's (LPA) agreement to the proposal subject to modifications or conditions being applied to the consent?",
  LPA_CONDITIONS_ACCEPTED: 'Do you accept all the conditions imposed by the LPA?',
  LPA_CONDITIONS_REASON: "Explain why you do not accept all the LPA's conditions",
  CONSULTEES_RECOMMENDATIONS: 'Were any recommendations made or conditions requested by the consultees? (Not including the LPA)',
  CONSULTEES_ACCEPTED: 'Do you accept the recommendations made by the consultees?',
  CONSULTEES_REASON: "Explain why you do not accept all the consultees' recommendations"
} as const;

// Works overview questions
export const WORKS_OVERVIEW_QUESTIONS = {
  ADDING_REPLACING_POLES: 'Are you adding or replacing any poles?',
  POLE_MATERIAL: 'Pole material',
  CHEMICAL_TREATMENTS: 'Chemical treatments',
  POLES_ADDED: 'Poles added',
  POLES_REPLACED: 'Poles replaced',
  POLE_COMMENTS: 'Comments on poles',
  ADDING_REPLACING_LINES: 'Are you adding or replacing any overhead lines?',
  OVERHEAD_LINE_DESC: 'Overhead line description',
  ESTIMATED_DURATION: 'Estimated duration',
  VEHICLES_REQUIRED: 'Vehicles required',
  ROAD_CLOSURES: 'Will any road closures or traffic calming measures be required?',
  ROAD_CLOSURES_DETAILS: 'Please provide details of the road closures, lane closures, temporary traffic lights, road, times, duration',
  EXCAVATION_REQUIRED: 'Are excavation works required?',
  EXCAVATION_DETAILS: 'Excavation details',
  VEGETATION_CLEARANCE: 'Is vegetation clearance required?',
  VEGETATION_DETAILS: 'Vegetation clearance details',
  EXISTING_ACCESS_ROUTES: 'Are you using pre-existing access routes and/or storage sites?',
  ACCESS_ROUTES_DETAILS: 'Access routes details',
  PROPOSED_ACCESS_ROUTES_DETAILS: 'Proposed access routes details',
  TALLEST_NEW_POLE_HEIGHT: 'What is the height of the tallest new pole?',
  REMOVING_EQUIPMENT: 'Are you removing existing equipment?',
  REMOVAL_DESCRIPTION: 'Removal description',
  GENERAL_COMMENTS: 'General comments'
} as const;

// Supporting information questions
export const SUPPORTING_INFO_QUESTIONS = {
  WAYLEAVES_OBTAINED: 'Have all wayleaves been obtained?',
  WAYLEAVES_REASON: 'Why have all wayleaves not been obtained?',
  ESQCR_COMPLIANCE: 'I confirm that the works will comply with The Electricity Safety, Quality and Continuity Regulations 2002',
  ADDITIONAL_DOCS: 'Do you have any further supporting documents to provide?',
  APPLICANT_COMMENTS: 'Do you have any comments to make in support of your application?',
  SUPPORTING_INFO_DOCS: 'Supporting information documents'
} as const;

// EIA questions
export const EIA_QUESTIONS = {
  REQUIRES_FULL_EIA: 'Does this application require a full EIA?',
  SCREENING_ONLY: 'Is this application for screening only?'
} as const;

export const VALIDATION_MESSAGES = {
  DECLARATION_REQUIRED: 'You must confirm you have read and understood the information',
  SAVE_DECLARATION_FAILED: 'Failed to save declaration. Please try again.',
  ERROR_SUMMARY_TITLE: 'There is a problem'
} as const;

export const BUTTON_LABELS = {
  WITHDRAW_APPLICATION: 'Withdraw application',
  SAVE_AND_CONTINUE: 'Save and continue',
  PAY_AND_SUBMIT: 'Pay and submit application',
  SUBMIT_WITHDRAWAL: 'Submit withdrawal request',
  SUBMITTING: 'Submitting...'
} as const;

// Withdrawal page labels
export const WITHDRAWAL_LABELS = {
  PAGE_TITLE: 'Withdraw your application',
  CONFIRMATION_TITLE: 'Withdrawal request submitted',
  WHAT_HAPPENS_NEXT: 'What happens next',
  INSET_TEXT: "Your request will be sent to your case officer and your application's status will not change until they have made a decision.",
  VOLUNTARY_AGREEMENT_QUESTION: 'Have you reached a voluntary agreement with the landowner or occupier?',
  REASON_LABEL: 'Reason for withdrawal (optional)',
  REASON_HINT: 'You can provide a reason for your withdrawal request to help your case officer make their decision.',
  WARNING_TEXT: 'You cannot undo this request after you submit it.',
  CONFIRMATION_MESSAGE_1: 'Your withdrawal request has been sent to your case officer and you do not need to do anything else.',
  CONFIRMATION_MESSAGE_2: "Your application's status will not change until a decision has been made.",
  CONFIRMATION_MESSAGE_3: 'You will receive an email to confirm whether your request has been approved or not.',
  MISTAKE_MESSAGE: 'If you submitted this withdrawal request by mistake, contact',
  RETURN_TO_SUMMARY: 'Return to your application summary',
  GO_TO_DASHBOARD: 'Go to your applications dashboard'
} as const;

export const EMPTY_VALUE = '-';

// Common phrases
export const COMMON_TEXT = {
  YES: 'Yes',
  NO: 'No',
  CLOSED: 'Closed',
  ROUTE_PREFIX: 'Route',
  CONFIRMATION_TEXT: "I confirm I've read and understood the information I've provided, and that it's accurate to the best of my knowledge."
} as const;