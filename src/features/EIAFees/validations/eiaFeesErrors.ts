/**
 * EIA Fees - Error Types & Constants (SYEIA-1485)
 */

export enum EIAFeesErrorField {
    ASSESSMENT = 'assessment',
    EIA_REPORT = 'eiaReport',
}

export interface ValidationError {
    field: string;
    message: string;
}

export const EIA_FEES_ERROR_MESSAGES = {
    ASSESSMENT: {
        REQUIRED: 'Select an assessment option',
    },
    EIA_REPORT: {
        REQUIRED: 'Select a file to upload',
    },
    API: {
        SUBMIT_FAILED: 'Failed to submit EIA Fees. Please try again.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    },
};
