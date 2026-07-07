/**
 * Labels and text constants for Additional Information section
 */

export const LABELS = {
  // Related Applications
  RELATED_APPLICATIONS_TITLE: 'Are there any other applications related to this one?',
  
  // Other Important Information
  OTHER_INFORMATION_TITLE: 'Is there any other important information our team should know?',
  IMPORTANT_INFORMATION_TITLE: 'Provide the important information',
  
  // Buttons
  CONTINUE: 'Save and continue',
};

export const HINTS = {
  RELATED_APPLICATIONS_INTRO: 'A related application could have the same objector, or where the land is adjacent to this application\'s land.',
  RELATED_APPLICATIONS_DETAILS: 'Provide details of the related application',
  RELATED_APPLICATIONS_GUIDANCE: 'Include application details such as DESNZ reference numbers, your internal references or site addresses. Ensure you list all related applications and explain why they are related.',
  
  OTHER_INFORMATION_DETAILS: 'Tell us what other important information our team should know.',
  
  CHARACTER_LIMIT: 'You can enter up to 4,000 characters',
};

export const FORM_LABELS = {
  YES: 'Yes',
  NO: 'No',
  ADDITIONAL_INFORMATION: 'Additional information',
  DOCUMENTS_UPLOADED: 'Documents uploaded',
  UPLOAD_DOCUMENTS: 'Upload any additional relevant documents for this application (optional)',
};

export const ERRORS = {
  RADIO_REQUIRED: 'Select yes if there are related applications',
  OTHER_INFO_RADIO_REQUIRED: 'Select yes if there is other important information',
  DETAILS_REQUIRED: 'Enter details of the related applications',
  DETAILS_TOO_SHORT: 'Details must be at least 1 characters',
  OTHER_INFO_REQUIRED: 'Enter the other important information',
  OTHER_INFO_TOO_SHORT: 'Details must be at least 1 characters',
  DETAILS_TOO_LONG: 'Details must be 4000 characters or less',
  API_ERROR: 'There was a problem saving your information. Please try again.',
};

export const CONTENT = {
  BREADCRUMBS: {
    TASK_LIST: 'Task list',
    RELATED_APPLICATIONS: 'Related applications',
    OTHER_IMPORTANT_INFORMATION: 'Other important information',
    IMPORTANT_INFORMATION_DETAILS: 'Important information',
  },
};

export const CHARACTER_LIMIT = 4000;
