/**
 * Payment Details Card
 * Renders the payment information for a submitted application.
 * Rendered only when a payment record is present.
 */

import React from 'react';
import { SummaryCard } from '../../CheckYourAnswers/components';
import { SummaryRow } from '../../CheckYourAnswers/types';
import { formatDate } from '../../CheckYourAnswers/utils';
import { NWLSummaryPayment } from '../types';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface PaymentDetailsCardProps {
    payment: NWLSummaryPayment | null;
}

const formatAmount = (payment: NWLSummaryPayment): string => {
    if (payment.total_amount) return payment.total_amount;
    if (typeof payment.amount === 'number') return `£${(payment.amount / 100).toFixed(2)}`;
    return CONSTANTS.DEFAULTS.NOT_AVAILABLE;
};

const formatMethod = (kind: string | null | undefined): string => {
    if (!kind) return CONSTANTS.DEFAULTS.NOT_AVAILABLE;
    return CONSTANTS.PAYMENT.METHODS[kind] || kind;
};

export const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({ payment }) => {
    if (!payment) {
        return null;
    }

    const isPaid = payment.is_successful || payment.status === 'success';
    const statusLabel = isPaid ? CONSTANTS.PAYMENT.STATUS_PAID : CONSTANTS.PAYMENT.STATUS_PENDING;

    const rows: SummaryRow[] = [
        {
            key: { text: CONSTANTS.PAYMENT.APPLICATION_FEE },
            value: { text: formatAmount(payment) },
        },
        {
            key: { text: CONSTANTS.PAYMENT.PAYMENT_METHOD },
            value: { text: formatMethod(payment.kind) },
        },
        {
            key: { text: CONSTANTS.PAYMENT.PAYMENT_STATUS },
            value: { text: statusLabel },
        },
    ];

    if (payment.created_at) {
        rows.push({
            key: { text: CONSTANTS.PAYMENT.PAYMENT_DATE },
            value: { text: formatDate(payment.created_at) },
        });
    }

    if (payment.payment_id || payment.reference) {
        rows.push({
            key: { text: CONSTANTS.PAYMENT.PAYMENT_REFERENCE },
            value: { text: payment.payment_id || payment.reference || CONSTANTS.DEFAULTS.NOT_AVAILABLE },
        });
    }

    return <SummaryCard title={CONSTANTS.PAYMENT.HEADING} rows={rows} />;
};
