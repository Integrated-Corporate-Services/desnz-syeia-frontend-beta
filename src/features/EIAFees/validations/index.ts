/**
 * EIA Fees Validation - Barrel Export
 * Centralized validation exports for easy importing
 */

export {
    validateEiaFeesForm,
    validateEiaDevelopment,
    validateScreeningOnly,
    hasFieldError,
    getFieldErrorMessage,
    clearValidationErrors,
    type EiaFeesFormData,
} from './eiaFeesValidation';

export {
    EIAFeesErrorField,
    EIA_FEES_ERROR_MESSAGES,
    getErrorMessage,
    type ValidationError,
} from './eiaFeesErrors';
