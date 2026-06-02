/**
 * EIA Fees Form - Error Types & Constants
 * Centralized error definitions for validation and API responses
 */

export enum EIAFeesErrorField {
    IS_EIA_DEVELOPMENT = 'isEiaDevelopment',
    SCREENING_ONLY = 'screeningOnly',
}

export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Error messages for form validation
 */
export const EIA_FEES_ERROR_MESSAGES = {
    IS_EIA_DEVELOPMENT: {
        REQUIRED: "Select 'Yes' or 'No'",
        INVALID_WHEN_SCREENING_NO: "Select 'Yes' or 'No'",
    },
    SCREENING_ONLY: {
        REQUIRED: "Select 'Yes' or 'No'",
        REQUIRED_WHEN_EIA_TRUE: "Select 'Yes' or 'No'",
    },
    API: {
        SUBMIT_FAILED: 'Failed to submit EIA Fees. Please try again.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    },
};

/**
 * Field-to-message mapper for easy access
 */
export const getErrorMessage = (field: string, errorType: string = 'REQUIRED'): string => {
    const fieldConfig = (EIA_FEES_ERROR_MESSAGES as Record<string, Record<string, string>>)[field];
    return fieldConfig ? fieldConfig[errorType] || 'Validation error' : 'Validation error';
};
