/**
 * Asset Information Form - Validation Helpers
 */

export const clearValidationErrors = (): Record<string, never> => ({});

export const clearFieldError = <T extends Record<string, string | undefined>>(
    prev: T,
    field: keyof T
): T => {
    if (!prev[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
};
