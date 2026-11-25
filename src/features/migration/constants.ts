/**
 * Content and configuration for the Tech Admin migration pages.
 * All user-facing copy lives here so it can be reviewed in one place.
 */

export const MIGRATION_BASE_PATH = '/admin/migration';

export const MIGRATION_PATHS = {
  NEW_BATCH: `${MIGRATION_BASE_PATH}/batches/new`,
  NEW_BATCH_FILE: `${MIGRATION_BASE_PATH}/batches/new/file`,
  NEW_BATCH_CHECK: `${MIGRATION_BASE_PATH}/batches/new/check`,
  NEW_BATCH_CONFIRMATION: `${MIGRATION_BASE_PATH}/batches/new/confirmation`,
  BATCHES: `${MIGRATION_BASE_PATH}/batches`,
  BATCH_DETAILS: `${MIGRATION_BASE_PATH}/batches/:batchId/details`,
  APPLICATION: `${MIGRATION_BASE_PATH}/applications/:migratedApplicationId`,
  ADD_DOCUMENT: `${MIGRATION_BASE_PATH}/applications/:migratedApplicationId/documents/new`,
  /** Where "Back" from the first page and the batches list goes. */
  OPERATIONAL_TASKS: '/admin/reporting?tab=operational-tasks&subTab=migration',
} as const;

export const migrationPaths = {
  batch: (batchId: string) => `${MIGRATION_BASE_PATH}/batches/${encodeURIComponent(batchId)}/details`,
  application: (reference: string) => `${MIGRATION_BASE_PATH}/applications/${encodeURIComponent(reference)}`,
  addDocument: (reference: string) =>
    `${MIGRATION_BASE_PATH}/applications/${encodeURIComponent(reference)}/documents/new`,
};

export const MIGRATION_API_BASE = '/admin/migration';

export const BATCH_ID_MAX_LENGTH = 80;
export const BATCH_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
export const CASES_FILE_MAX_BYTES = 20 * 1024 * 1024;
export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const BATCHES_PAGE_SIZE = 20;
/** Above this many case IDs the check page hides them in a details component. */
export const CASE_IDS_INLINE_LIMIT = 10;

export const WIZARD_STORAGE_KEY = 'syeia.migration.newBatch';
export const LAST_STARTED_BATCH_STORAGE_KEY = 'syeia.migration.lastStartedBatch';

export const MIGRATION_ERRORS = {
  BATCH_ID_REQUIRED: 'Enter a batch ID',
  BATCH_ID_TOO_LONG: `Batch ID must be ${BATCH_ID_MAX_LENGTH} characters or fewer`,
  BATCH_ID_PATTERN: 'Batch ID can only include letters, numbers, hyphens and underscores',
  BATCH_ID_TAKEN: 'A batch with this ID already exists. Enter a different batch ID',
  FILE_REQUIRED: 'Select an Excel file',
  FILE_NOT_XLSX: 'The selected file must be an XLSX',
  FILE_TOO_LARGE: 'The selected file must be smaller than 20MB',
  FILE_EMPTY: 'The selected file is empty',
  DOCUMENT_TYPE_REQUIRED: 'Select a document type',
  DOCUMENT_FILE_REQUIRED: 'Select a file',
  REFERENCE_REQUIRED: 'Enter a DESNZ reference or application ID',
  START_CONFLICT: 'A batch with this ID has already been started. Start again with a different batch ID',
  APPLICATION_NOT_FOUND: 'Application not found or not migrated',
  BATCH_NOT_FOUND: 'Batch not found',
  SERVICE: 'Sorry, there is a problem with the service. Try again later.',
  VIRUS_CHECK_NOT_CLEAN: 'The selected file could not be checked for viruses. Try uploading it again',
  TOO_MANY_REQUESTS: 'There have been too many requests. Wait a few minutes and try again.',
} as const;

export const MIGRATION_CONTENT = {
  CAPTION: 'Migration',
  BACK: 'Back',
  BATCH_ID: {
    TITLE: 'What is the batch ID?',
    HINT: 'Use letters, numbers, hyphens and underscores only, for example INP-25-NOV-001. Each batch ID can only be used once.',
    CONTINUE: 'Continue',
  },
  FILE: {
    TITLE: 'Upload the cases file',
    LABEL: 'Upload a file',
    HINT: 'The file must be an XLSX file smaller than 20MB, with one row per case and an ENERGY_PORTAL_REF column.',
    CONTINUE: 'Upload and continue',
    UPLOADING: 'Uploading and checking the file. This can take a few moments.',
  },
  CHECK: {
    TITLE: 'Check the batch before you start',
    BATCH_ID: 'Batch ID',
    FILE: 'Cases file',
    SIZE: 'File size',
    CASE_COUNT: 'Number of cases',
    CASE_IDS: 'Case IDs found',
    SHOW_CASE_IDS: (count: number) => `Show all ${count} case IDs`,
    CHANGE: 'Change',
    WARNINGS_TITLE: 'Check these warnings before you start',
    CANNOT_UNDO: 'Starting a migration cannot be undone. The cases will be loaded into the service and sent to Salesforce.',
    START: 'Start migration',
    STARTING: 'Starting migration',
  },
  CONFIRMATION: {
    TITLE: 'Migration started',
    PANEL_BODY: (batchId: string) => `Batch ${batchId} has been sent for migration`,
    NEXT_HEADING: 'What happens next',
    NEXT_BODY: [
      'The file is checked first. If the checks pass, the cases are loaded into the service and then sent to Salesforce.',
      'This can take several minutes for a large batch. You can follow its progress on the batch details page.',
      'If a check fails, the batch page will tell you why. You will need to fix the file and start a new batch with a different batch ID.',
    ],
    VIEW_BATCH: 'View this batch',
    VIEW_BATCHES: 'View all migration batches',
  },
  BATCHES: {
    TITLE: 'Migration batches',
    EMPTY: 'No migration batches have been started yet.',
    START_LINK: 'Start a migration batch',
    HEADERS: {
      BATCH_ID: 'Batch ID',
      STATUS: 'Status',
      EXPECTED: 'Cases expected',
      LOADED: 'Cases loaded',
      FAILED: 'Cases failed',
      STARTED: 'Started',
      UPDATED: 'Last updated',
    },
  },
  BATCH_DETAILS: {
    TITLE: (batchId: string) => `Batch ${batchId}`,
    STATUS: 'Status',
    PREFLIGHT_STATUS: 'Upload checks',
    EXPECTED: 'Cases expected',
    VALIDATED: 'Cases that passed checks',
    LOADED: 'Cases loaded',
    FAILED: 'Cases failed',
    STARTED: 'Started',
    UPDATED: 'Last updated',
    COMPLETED: 'Completed',
    FAILURE_HEADING: 'This batch has failed',
    CASES_HEADING: 'Cases',
    NO_CASES: 'No cases have been recorded for this batch yet.',
    REFRESH: 'Refresh',
    HEADERS: {
      LEGACY_CASE_ID: 'Legacy case ID',
      DESNZ_REF: 'DESNZ reference',
      APPLICATION_ID: 'Application ID',
      VALIDATION: 'Checks',
      APPLICANT_LOAD: 'Applicant load',
      SALESFORCE: 'Salesforce',
      DOCUMENTS: 'Documents',
      FAILURE: 'Failure reason',
    },
  },
  FIND: {
    HEADING: 'Find a migrated application',
    LABEL: 'DESNZ reference or application ID',
    HINT: 'For example NWL-2025-000123, or the application ID from the batch details page',
    SUBMIT: 'Find application',
  },
  APPLICATION: {
    TITLE: 'Migrated application',
    MIGRATION_HEADING: 'Migration',
    BATCH_ID: 'Batch ID',
    LEGACY_CASE_ID: 'Legacy case ID',
    DESNZ_REF: 'DESNZ reference',
    APPLICATION_ID: 'Application ID',
    VALIDATION: 'Checks',
    APPLICANT_LOAD: 'Applicant load',
    SALESFORCE: 'Salesforce',
    DOCUMENTS_STATUS: 'Documents',
    FAILURE: 'Failure reason',
    DOCUMENTS_HEADING: 'Documents',
    NO_DOCUMENTS: 'No documents have been added to this application.',
    ADD_DOCUMENT: 'Add a document',
    MARK_COMPLETE: 'Mark documents as complete',
    MARKING_COMPLETE: 'Marking documents as complete',
    DOCUMENTS_COMPLETE_HINT: 'The documents for this application have been marked as complete.',
    UPLOADED_BY: 'Uploaded by',
    UPLOADED_AT: 'Uploaded',
    SCAN: 'Virus check',
    REMOVE: 'Remove',
    REMOVE_CONFIRM_TITLE: (fileName: string) => `Are you sure you want to remove ${fileName}?`,
    REMOVE_CONFIRM_BODY: 'The document will be removed from this application. This cannot be undone.',
    REMOVE_CONFIRM: 'Yes, remove document',
    REMOVE_CANCEL: 'Cancel',
    APPLICATION_DATA_HEADING: 'Application data',
    APPLICATION_DATA_HINT: 'This is the application data as it was migrated. It cannot be changed here.',
    NOT_FOUND_BODY: 'Check the DESNZ reference or application ID and try again.',
    FIND_ANOTHER: 'Find a different application',
  },
  ADD_DOCUMENT: {
    TITLE: 'Add a document',
    TYPE_LABEL: 'Document type',
    TYPE_HINT: 'The document will be shown under this type on the application.',
    TYPE_PLACEHOLDER: 'Select a document type',
    FILE_LABEL: 'Upload a file',
    SUBMIT: 'Upload document',
    UPLOADING: 'Uploading',
  },
  SUCCESS_TITLE: 'Success',
  SUCCESS: {
    DOCUMENT_ADDED: 'The document has been added and checked for viruses',
    DOCUMENT_REMOVED: 'The document has been removed',
    DOCUMENTS_COMPLETE: 'The documents have been marked as complete',
  },
  LOADING: 'Loading',
  NOT_PROVIDED: 'Not provided',
  NOT_AVAILABLE: 'Not available',
  SUB_TAB: {
    LABEL: 'Migration',
    HEADING: 'Migration',
    INTRO: 'Move legacy cases into the service and add their documents.',
    START: 'Start a migration batch',
    VIEW: 'View migration batches',
  },
} as const;

export type TagColour = 'grey' | 'green' | 'turquoise' | 'blue' | 'light-blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow';

export interface StatusDisplay {
  label: string;
  colour: TagColour;
}

export type StatusKind =
  | 'batch'
  | 'preflight'
  | 'validation'
  | 'awsLoad'
  | 'salesforceLoad'
  | 'reconciliation'
  | 'documentRecord'
  | 'scan';

/** Every status code is mapped to plain English. Unknown codes fall back to a readable form of the code. */
export const STATUS_DISPLAY: Record<StatusKind, Record<string, StatusDisplay>> = {
  batch: {
    ADMITTED: { label: 'Received', colour: 'grey' },
    VALIDATING: { label: 'Checking the cases', colour: 'blue' },
    READY_FOR_APPROVAL: { label: 'Waiting for approval', colour: 'yellow' },
    APPROVED_FOR_APPLICANT_LOAD: { label: 'Approved for loading', colour: 'turquoise' },
    LOADING_APPLICANT: { label: 'Loading applications', colour: 'blue' },
    PENDING_VERIFICATION: { label: 'Waiting for checks', colour: 'yellow' },
    APPROVED_FOR_SALESFORCE: { label: 'Approved for Salesforce', colour: 'turquoise' },
    LOADING_SALESFORCE: { label: 'Sending to Salesforce', colour: 'blue' },
    COMPLETED: { label: 'Completed', colour: 'green' },
    VALIDATION_FAILED: { label: 'Checks failed', colour: 'red' },
    APPLICANT_LOAD_FAILED: { label: 'Loading applications failed', colour: 'red' },
    SALESFORCE_LOAD_FAILED: { label: 'Sending to Salesforce failed', colour: 'red' },
  },
  preflight: {
    PREFLIGHT_IN_PROGRESS: { label: 'Checking the upload', colour: 'blue' },
    PREFLIGHT_VALIDATED: { label: 'Upload checked', colour: 'green' },
    PREFLIGHT_FAILED: { label: 'Upload checks failed', colour: 'red' },
    WF1_STARTED: { label: 'Migration started', colour: 'turquoise' },
  },
  validation: {
    PENDING: { label: 'Not checked yet', colour: 'grey' },
    VALID: { label: 'Passed', colour: 'green' },
    INVALID: { label: 'Failed', colour: 'red' },
  },
  awsLoad: {
    PENDING: { label: 'Not loaded yet', colour: 'grey' },
    LOADED: { label: 'Loaded', colour: 'green' },
    FAILED: { label: 'Failed', colour: 'red' },
    SKIPPED: { label: 'Skipped', colour: 'grey' },
  },
  salesforceLoad: {
    PENDING: { label: 'Not sent yet', colour: 'grey' },
    LOADED: { label: 'Sent', colour: 'green' },
    FAILED: { label: 'Failed', colour: 'red' },
    SKIPPED: { label: 'Skipped', colour: 'grey' },
  },
  reconciliation: {
    PENDING: { label: 'Not matched yet', colour: 'grey' },
    RECONCILED: { label: 'Matched', colour: 'green' },
    FAILED: { label: 'Failed', colour: 'red' },
  },
  documentRecord: {
    PENDING: { label: 'Documents to add', colour: 'yellow' },
    WRITTEN: { label: 'Complete', colour: 'green' },
    FAILED: { label: 'Failed', colour: 'red' },
  },
  scan: {
    PENDING: { label: 'Checking for viruses', colour: 'blue' },
    IN_PROGRESS: { label: 'Checking for viruses', colour: 'blue' },
    CLEAN: { label: 'No viruses found', colour: 'green' },
    INFECTED: { label: 'Virus found', colour: 'red' },
    FAILED: { label: 'Virus check failed', colour: 'red' },
    TIMED_OUT: { label: 'Virus check not finished', colour: 'yellow' },
  },
};

export const NO_STATUS_DISPLAY: StatusDisplay = { label: 'Not started', colour: 'grey' };
