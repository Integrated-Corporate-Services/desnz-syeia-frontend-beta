import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not provided';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const getCaseTypeLabel = (applicationType: 'NWL' | 'S37' | 'TLP'): string => {
    return CONSTANTS.CASE_TYPES[applicationType] || applicationType;
};

export const getReasonLabel = (applicationType: 'NWL' | 'S37' | 'TLP', reasonValue: string): string => {
    const reasons = CONSTANTS.REASONS[applicationType] || CONSTANTS.REASONS.NWL;
    const reason = reasons.find((r) => r.value === reasonValue);
    return reason?.label || reasonValue;
};

export const validateWithdrawalForm = (
    reason: string | null,
    confirmed: boolean,
    additionalComments?: string
): { reason?: string; confirmation?: string; comments?: string } => {
    const errors: { reason?: string; confirmation?: string; comments?: string } = {};

    if (!reason) {
        errors.reason = CONSTANTS.WITHDRAW_PAGE.REASON_ERROR;
    }

    if (!confirmed) {
        errors.confirmation = CONSTANTS.WITHDRAW_PAGE.CONFIRMATION_ERROR;
    }

    if (additionalComments && additionalComments.length > CONSTANTS.WITHDRAW_PAGE.COMMENTS_MAXLENGTH) {
        errors.comments = `Comments must be ${CONSTANTS.WITHDRAW_PAGE.COMMENTS_MAXLENGTH} characters or less`;
    }

    return errors;
};

export const getRemainingCharacters = (text: string, maxLength: number): number => {
    return maxLength - (text?.length || 0);
};