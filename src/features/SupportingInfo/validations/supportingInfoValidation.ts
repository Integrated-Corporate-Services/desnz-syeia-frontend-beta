/**
 * Supporting Information Form - Validation Helpers
 */

export interface ValidationError {
    key: string;
    message: string;
}

export const clearValidationErrors = (): ValidationError[] => [];
