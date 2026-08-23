import React from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { formatDate } from '../../NWL/CheckYourAnswers/utils';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ReviewSummaryPayment } from '../types/reviewSummary';
import { useInvoiceStatus, buildInvoiceDownloadUrl } from '../../../hooks';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewPaymentDetailsCardProps {
    payment: ReviewSummaryPayment | null;
    applicationId?: string;
    applicationType?: 'NWL' | 'S37';
    desnzRef?: string | null;
    applicationStatus?: string | null;
}

const formatAmount = (payment: ReviewSummaryPayment): string => {
    if (payment.total_amount) return payment.total_amount;
    if (typeof payment.amount === 'number') return `£${(payment.amount / 100).toFixed(2)}`;
    return L.DEFAULTS.NOT_AVAILABLE;
};

const formatMethod = (kind: string | null | undefined): string => {
    if (!kind) return L.DEFAULTS.NOT_AVAILABLE;
    return L.PAYMENT.METHODS[kind] || kind;
};

export const ReviewPaymentDetailsCard: React.FC<ReviewPaymentDetailsCardProps> = ({
    payment,
    applicationId,
    applicationType,
    desnzRef,
    applicationStatus
}) => {
    const invoiceStatus = useInvoiceStatus(applicationId);

    if (!payment) {
        return null;
    }

    const isPaid = payment.is_successful || payment.status === 'success';
    const statusLabel = isPaid ? L.PAYMENT.STATUS_PAID : L.PAYMENT.STATUS_PENDING;

    const isProcessingPayment = applicationStatus?.toLowerCase().replace(/_/g, ' ').includes('processing payment') || false;

    const invoiceRow: SummaryRow | null =
        applicationId && invoiceStatus?.invoiceExists && invoiceStatus.invoiceNumber
            ? {
                key: { text: 'Invoice' },
                value: {
                    text: '',
                    html: `<a href="${buildInvoiceDownloadUrl(applicationId, invoiceStatus.invoiceNumber)}" class="govuk-link">${invoiceStatus.invoiceNumber}</a>`,
                },
            }
            : null;

    let rows: SummaryRow[] = [];

    if (applicationType === 'NWL') {
        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Transaction number' },
                value: { text: payment.transaction_number || L.DEFAULTS.NOT_AVAILABLE },
            });
        } else {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_REFERENCE },
                value: { text: applicationId || L.DEFAULTS.NOT_AVAILABLE },
            });
        }

        if (invoiceRow) {
            rows.push(invoiceRow);
        }

        rows.push({
            key: { text: 'Total amount' },
            value: { text: formatAmount(payment) },
        });
    } else {
        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Transaction number' },
                value: { text: payment.transaction_number || L.DEFAULTS.NOT_AVAILABLE },
            });
        } else {
            rows = [
                {
                    key: { text: L.PAYMENT.APPLICATION_FEE },
                    value: { text: formatAmount(payment) },
                },
            {
                key: { text: L.PAYMENT.PAYMENT_METHOD },
                value: { text: formatMethod(payment.kind) },
            },
            {
                key: { text: L.PAYMENT.PAYMENT_STATUS },
                value: { text: statusLabel },
            },
        ];

        if (payment.created_at) {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_DATE },
                value: { text: formatDate(payment.created_at) },
            });
        }

        if (payment.payment_id || payment.reference) {
            rows.push({
                key: { text: L.PAYMENT.PAYMENT_REFERENCE },
                value: { text: payment.payment_id || payment.reference || L.DEFAULTS.NOT_AVAILABLE },
            });
        }
    }

        if (invoiceRow) {
            rows.push(invoiceRow);
        }

        if (isProcessingPayment) {
            rows.push({
                key: { text: 'Total amount' },
                value: { text: formatAmount(payment) },
            });
        }
    }

    return <SummaryCard title={L.PAYMENT.HEADING} rows={rows} />;
};
