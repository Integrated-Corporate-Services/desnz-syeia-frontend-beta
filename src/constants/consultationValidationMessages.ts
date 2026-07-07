/**
 * Consultation feature validation messages
 * Centralized error messages for all consultation-related forms
 */

export const CONSULTATION_VALIDATION_MESSAGES = {
  // Common validations
  common: {
    characterLimit: 'You cannot enter more than 4,000 characters',
    invalidFormat: 'You can only enter letters, numbers, spaces, apostrophes and hyphens',
  },

  // Public Notices Evidence
  firstDatePublished: {
    empty: 'Enter the first date the public notice was published',
    incomplete: 'The first date the public notice was published must include a (day/month/year)',
  },
  secondDatePublished: {
    empty: 'Enter the second date the public notice was published',
    incomplete: 'The second date the public notice was published must include a (day/month/year)',
  },
  publicNoticeUpload: {
    empty: 'You must upload evidence documents',
  },

  // Consultation Request
  consultationRequestUpload: {
    empty: 'You must upload evidence documents',
  },
  consultationRequestDate: {
    incomplete: 'The date the consultation request was sent must include a (day/month/year)',
  },

  // Consultation Not Required
  consultationNotRequiredReason: {
    empty: 'You must provide a reason why this consultation is not required',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },
  consultationNotRequiredUpload: {
    empty: 'You must upload at least one supporting document',
  },

  // Consultation Requests Required
  addOtherConsultations: {
    empty: 'Select yes if you want to add other consultations',
  },

  // Consultation Initial Question
  alreadySentRequest: {
    empty: "Select 'Yes' or 'No'",
  },

  // Other Consultee
  otherConsulteeOrganisation: {
    empty: 'Enter the name of another consultee',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },

  // Consultation Response
  consulteeContactName: {
    empty: 'Enter the consultee contact name',
  },
  consulteeEmail: {
    empty: 'Enter an email address',
    invalidFormat: 'Enter an email address in the correct format, like name@example.com',
  },
  hasObjection: {
    empty: "Select 'Yes' or 'No'",
  },

  // Consultation Response Documents
  responseDocumentsUpload: {
    emptyPublic: 'You must upload a document that shows a public response',
    emptyNonPublic: 'You must upload evidence documents',
  },
  consultationResponseDate: {
    incomplete: 'The date the consultation response was received must include a (day/month/year)',
  },

  // Consultation Response Review
  additionalComments: {
    tooLong: 'You cannot enter more than 4,000 characters',
  },
  responseReviewDeclaration: {
    emptyPublic: 'Confirm you have provided all relevant information, uploaded all supporting documents and want to close this public consultation',
    emptyNonPublic: 'Confirm you have provided all relevant information, uploaded all supporting documents and want to close this consultation',
  },

  // Evidence Response Not Received
  evidenceNotReceivedUpload: {
    empty: 'You must upload at least one document showing follow-up emails',
  },
  evidenceNotReceivedDeclaration: {
    empty: 'You must confirm you have provided all relevant information',
  },

  // LPA Details
  lpaContactName: {
    empty: 'LPA contact name is required',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },
  lpaContactEmail: {
    empty: 'LPA contact email is required',
    invalid: 'Enter a valid email address',
  },
  lpaContactPhone: {
    invalid: 'Enter a valid phone number',
  },

  // Proposed Development
  projectDescription: {
    empty: 'Project description is required',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },
  representationsObjections: {
    empty: 'Representations or objections are required',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },
  complianceDetails: {
    empty: 'Compliance details are required',
    characterLimit: 'You cannot enter more than 4,000 characters',
  },

  // Download LPA Form
  downloadLpaFormDeclaration: {
    empty: 'You must confirm you have downloaded the consultation form',
  },
};

