/**
 * Withdraw Application Form - Validation Helpers
 */

export type WithdrawFormErrors = {
    reason?: string;
    confirmation?: string;
    comments?: string;
};

export const clearValidationErrors = (): WithdrawFormErrors => ({});

export const clearFieldError = (
    prev: WithdrawFormErrors,
    field: keyof WithdrawFormErrors
): WithdrawFormErrors => {
    if (!prev[field]) return prev;
    const next = { ...prev };
    delete next[field];
    return next;
};
