import React from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { formatDate } from '../../NWL/CheckYourAnswers/utils';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ReviewSummaryPayment } from '../types/reviewSummary';
import { buildBackendUrl } from '../../../utils/apiConfig';

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

// Invoice is generated synchronously earlier in the payment flow (see
// InvoiceGenerationPage.tsx), so by the time this link is rendered the file
// already exists - this hits the download endpoint directly, no generate
// fallback needed.
const buildInvoiceDownloadUrl = (applicationId: string, invoiceNumber: string): string =>
    buildBackendUrl(`/api/invoice/${applicationId}/download?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);

export const ReviewPaymentDetailsCard: React.FC<ReviewPaymentDetailsCardProps> = ({
    payment,
    applicationId,
    applicationType,
    desnzRef,
    applicationStatus
}) => {
    if (!payment) {
        return null;
    }

    const isPaid = payment.is_successful || payment.status === 'success';
    const statusLabel = isPaid ? L.PAYMENT.STATUS_PAID : L.PAYMENT.STATUS_PENDING;

    const isProcessingPayment = applicationStatus?.toLowerCase().replace(/_/g, ' ').includes('processing payment') || false;

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

        if (applicationId && (payment.invoice_number || desnzRef)) {
            const invoiceNumber = payment.invoice_number || `INV01/${desnzRef}.pdf`;

            rows.push({
                key: { text: 'Invoice' },
                value: {
                    text: '',
                    html: `<a href="${buildInvoiceDownloadUrl(applicationId, invoiceNumber)}" class="govuk-link">${invoiceNumber}</a>`,
                },
            });
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

        if (applicationId && applicationType && (payment.invoice_number || desnzRef)) {
            const invoiceNumber = payment.invoice_number || `INV01/${desnzRef}.pdf`;

            rows.push({
                key: { text: 'Invoice' },
                value: {
                    text: '',
                    html: `<a href="${buildInvoiceDownloadUrl(applicationId, invoiceNumber)}" class="govuk-link">${invoiceNumber}</a>`,
                },
            });
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
