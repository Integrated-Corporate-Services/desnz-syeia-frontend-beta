import React from 'react';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { WithdrawalRequest } from '../types';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewApplicationInfoCardProps {
    desnzRef: string | null;
    status: string | null;
    withdrawalRequest?: WithdrawalRequest | null;
}

const getWithdrawalStatusTagClass = (requestStatus: string): string => {
    if (requestStatus === 'Requested') return 'govuk-tag--orange';
    if (requestStatus === 'Approved') return 'govuk-tag--green';
    return 'govuk-tag--red';
};

const getStatusTagClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'govuk-tag--green';
    if (statusLower.includes('rejected')) return 'govuk-tag--red';
    if (statusLower.includes('withdrawn')) return 'govuk-tag--grey';
    if (statusLower.includes('pending')) return 'govuk-tag--yellow';
    return 'govuk-tag--blue';
};

const formatStatusLabel = (status: string | null): string => {
    if (!status) return L.DEFAULTS.NOT_AVAILABLE;
    const normalised = status.toUpperCase().replace(/\s+/g, '_');
    return CONSTANTS.STATUS_LABELS[normalised] || status;
};

export const ReviewApplicationInfoCard: React.FC<ReviewApplicationInfoCardProps> = ({
    desnzRef,
    status,
    withdrawalRequest,
}) => {
    const statusLabel = formatStatusLabel(status);
    const statusHtml = status
        ? `<strong class="govuk-tag ${getStatusTagClass(status)}">${statusLabel}</strong>`
        : L.DEFAULTS.NOT_AVAILABLE;

    const rows: SummaryRow[] = [
        {
            key: { text: L.SUMMARY_CARD.DESNZ_REF },
            value: { text: desnzRef || L.DEFAULTS.NOT_AVAILABLE },
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

    if (withdrawalRequest) {
        const withdrawalTagClass = getWithdrawalStatusTagClass(withdrawalRequest.request_status);
        rows.push({
            key: { text: L.SUMMARY_CARD.WITHDRAWAL_REQUEST_STATUS },
            value: {
                text: '',
                html: `<strong class="govuk-tag ${withdrawalTagClass}" style="font-size: 16px">${withdrawalRequest.request_status}</strong>`,
            },
        });
    }

    return <SummaryCard title={L.SUMMARY_CARD.TITLE} rows={rows} />;
};
