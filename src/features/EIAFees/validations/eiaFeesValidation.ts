/**
 * EIA Fees Form - Validation Logic
 * Contains all validation rules and functions for EIA Fees form
 */

import { ValidationError, EIA_FEES_ERROR_MESSAGES } from './eiaFeesErrors';

export interface EiaFeesFormData {
    isEiaDevelopment: string;
    screeningOnly: string;
    eiaFeeId?: string;
    applicationId?: string;
}

/**
 * Validation Rules Configuration
 * Define all validation rules in one place for easy maintenance
 */
export const EIA_FEES_VALIDATION_RULES = {
    isEiaDevelopment: {
        required: true,
        message: EIA_FEES_ERROR_MESSAGES.IS_EIA_DEVELOPMENT.REQUIRED,
    },
    screeningOnly: {
        required: false, // Conditionally required
        message: EIA_FEES_ERROR_MESSAGES.SCREENING_ONLY.REQUIRED,
    },
};

/**
 * Validates if EIA Development selection is made
 * @param isEiaDevelopment - User's selection (true/false as string)
 * @returns null if valid, ValidationError if invalid
 */
export const validateEiaDevelopment = (isEiaDevelopment: string): ValidationError | null => {
    if (!isEiaDevelopment) {
        return {
            field: 'isEiaDevelopment',
            message: EIA_FEES_ERROR_MESSAGES.IS_EIA_DEVELOPMENT.REQUIRED,
        };
    }
    return null;
};

/**
 * Validates screening only based on EIA development selection
 * @param isEiaDevelopment - User's EIA development selection
 * @param screeningOnly - User's screening only selection
 * @returns null if valid, ValidationError if invalid
 */
export const validateScreeningOnly = (
    isEiaDevelopment: string,
    screeningOnly: string
): ValidationError | null => {
    // Only validate if isEiaDevelopment is 'true'
    if (isEiaDevelopment === 'true') {
        if (!screeningOnly) {
            return {
                field: 'screeningOnly',
                message: EIA_FEES_ERROR_MESSAGES.SCREENING_ONLY.REQUIRED_WHEN_EIA_TRUE,
            };
        }

        // If screeningOnly is 'false', it's invalid state
        if (screeningOnly === 'false') {
            return {
                field: 'isEiaDevelopment',
                message: EIA_FEES_ERROR_MESSAGES.IS_EIA_DEVELOPMENT.INVALID_WHEN_SCREENING_NO,
            };
        }
    }
    return null;
};

/**
 * Main form validation function
 * Validates all fields and returns array of errors
 * @param formData - Form data to validate
 * @returns Array of validation errors (empty if valid)
 */
export const validateEiaFeesForm = (formData: EiaFeesFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate isEiaDevelopment field
    const eiaDevelopmentError = validateEiaDevelopment(formData.isEiaDevelopment);
    if (eiaDevelopmentError) {
        errors.push(eiaDevelopmentError);
    } else {
        // Only validate screeningOnly if isEiaDevelopment is valid and 'true'
        const screeningOnlyError = validateScreeningOnly(
            formData.isEiaDevelopment,
            formData.screeningOnly
        );
        if (screeningOnlyError) {
            errors.push(screeningOnlyError);
        }
    }

    return errors;
};

/**
 * Checks if a specific field has an error
 * @param field - Field name to check
 * @param errors - Array of errors
 * @returns true if field has error
 */
export const hasFieldError = (field: string, errors: ValidationError[]): boolean => {
    return errors.some((err) => err.field === field);
};

/**
 * Gets error message for a specific field
 * @param field - Field name
 * @param errors - Array of errors
 * @returns Error message or empty string if no error
 */
export const getFieldErrorMessage = (field: string, errors: ValidationError[]): string => {
    const error = errors.find((e) => e.field === field);
    return error ? error.message : '';
};

/**
 * Clears validation errors when form state changes
 * Useful for UX - errors disappear as user corrects them
 * @returns Cleared errors array
 */
export const clearValidationErrors = (): ValidationError[] => {
    return [];
};
