import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ApplicationStatus, PaymentStatus } from '../types';

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not provided';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '£0.00';
    return `£${amount.toFixed(2)}`;
};

export const getCaseTypeLabel = (applicationType: 'NWL' | 'S37' | 'TLP'): string => {
    return CONSTANTS.CASE_TYPES[applicationType] || applicationType;
};

export const getPaymentMethodLabel = (method: 'CARD' | 'BANK_TRANSFER' | undefined): string => {
    if (!method) return 'Not specified';
    return CONSTANTS.PAYMENT_METHODS[method] || method;
};

export const getStatusLabel = (status: ApplicationStatus): string => {
    return CONSTANTS.STATUS_LABELS[status] || status;
};

export const getPaymentStatusClass = (status: PaymentStatus): string => {
    switch (status) {
        case PaymentStatus.PAID:
            return 'govuk-tag--green';
        case PaymentStatus.PENDING:
            return 'govuk-tag--yellow';
        case PaymentStatus.FAILED:
            return 'govuk-tag--red';
        case PaymentStatus.NOT_REQUIRED:
            return 'govuk-tag--grey';
        default:
            return '';
    }
};

export const getApplicationStatusClass = (status: ApplicationStatus): string => {
    switch (status) {
        case ApplicationStatus.SUBMITTED:
            return 'govuk-tag--blue';
        case ApplicationStatus.UNDER_REVIEW:
            return 'govuk-tag--purple';
        case ApplicationStatus.PENDING_INFORMATION:
            return 'govuk-tag--yellow';
        case ApplicationStatus.APPROVED:
            return 'govuk-tag--green';
        case ApplicationStatus.REJECTED:
            return 'govuk-tag--red';
        case ApplicationStatus.WITHDRAWN:
            return 'govuk-tag--grey';
        default:
            return '';
    }
};

export const canWithdrawApplication = (status: ApplicationStatus): boolean => {
    return [
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.PENDING_INFORMATION,
    ].includes(status);
};
