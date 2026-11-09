import React from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { getApplicationStatusLabel, getApplicationStatusTagClass } from '../../../constants/status';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import type { WithdrawalRequest } from '../types';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewApplicationInfoCardProps {
    desnzRef: string | null;
    status: string | null;
    assigneeName?: string | null;
    dateWithdrawn?: string | null;
    withdrawalRequest?: WithdrawalRequest | null;
}

const getWithdrawalStatusTagClass = (requestStatus: string): string => {
    if (requestStatus === 'Requested') return 'govuk-tag--orange';
    if (requestStatus === 'Approved') return 'govuk-tag--green';
    return 'govuk-tag--red';
};

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const ReviewApplicationInfoCard: React.FC<ReviewApplicationInfoCardProps> = ({
    desnzRef,
    status,
    assigneeName,
    dateWithdrawn,
    withdrawalRequest,
}) => {
    const statusLabel = status ? getApplicationStatusLabel(status) : L.DEFAULTS.NOT_AVAILABLE;
    const statusHtml = status
        ? `<strong class="${getApplicationStatusTagClass(status)}">${statusLabel}</strong>`
        : L.DEFAULTS.NOT_AVAILABLE;

    const rows: SummaryRow[] = [
        {
            key: { text: L.SUMMARY_CARD.DESNZ_REF },
            value: { text: desnzRef || L.DEFAULTS.NOT_AVAILABLE },
        },
        {
            key: { text: 'Assigned to' },
            value: { text: assigneeName || 'Not assigned' },
        },
        {
            key: { text: L.SUMMARY_CARD.CASE_TYPE },
            value: { text: L.CASE_TYPE_LABEL },
        },
        {
            key: { text: L.SUMMARY_CARD.STATUS },
            value: { text: '', html: statusHtml },
        },
    ];

    if (withdrawalRequest?.request_status === 'Requested') {
        rows.push({
            key: { text: L.SUMMARY_CARD.WITHDRAWAL_REQUEST_STATUS },
            value: {
                text: '',
                html: `<strong class="govuk-tag ${getWithdrawalStatusTagClass(withdrawalRequest.request_status)}" style="font-size: 16px">${withdrawalRequest.request_status}</strong>`,
            },
        });
    }

    if (dateWithdrawn) {
        rows.push({
            key: { text: L.SUMMARY_CARD.DATE_WITHDRAWN },
            value: { text: formatDate(dateWithdrawn) },
        });
    }

    return <SummaryCard title={L.SUMMARY_CARD.TITLE} rows={rows} />;
};
