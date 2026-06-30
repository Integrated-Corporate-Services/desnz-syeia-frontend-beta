/**
 * Supporting Information Form - Validation Helpers
 */

export interface ValidationError {
    key: string;
    message: string;
}

export const clearValidationErrors = (): ValidationError[] => [];

export const clearKeyedErrors = (errors: ValidationError[], keys: string[]): ValidationError[] => {
    const keySet = new Set(keys);
    if (!errors.some((error) => keySet.has(error.key))) {
        return errors;
    }
    return errors.filter((error) => !keySet.has(error.key));
};
