import React from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { formatDate } from '../../NWL/CheckYourAnswers/utils';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ReviewSummaryPayment } from '../types/reviewSummary';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewPaymentDetailsCardProps {
    payment: ReviewSummaryPayment | null;
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

export const ReviewPaymentDetailsCard: React.FC<ReviewPaymentDetailsCardProps> = ({ payment }) => {
    if (!payment) {
        return null;
    }

    const isPaid = payment.is_successful || payment.status === 'success';
    const statusLabel = isPaid ? L.PAYMENT.STATUS_PAID : L.PAYMENT.STATUS_PENDING;

    const rows: SummaryRow[] = [
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

    return <SummaryCard title={L.PAYMENT.HEADING} rows={rows} />;
};
