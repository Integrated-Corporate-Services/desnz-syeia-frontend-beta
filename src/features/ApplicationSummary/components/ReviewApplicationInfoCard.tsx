import React from 'react';
import type { WithdrawalRequest } from '../types';
import { SummaryCard } from '../../NWL/CheckYourAnswers/components';
import { SummaryRow } from '../../NWL/CheckYourAnswers/types';
import { getApplicationStatusLabel, getApplicationStatusTagClass } from '../../../constants/status';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

const L = CONSTANTS.REVIEW_LAYOUT;

interface ReviewApplicationInfoCardProps {
    desnzRef: string | null;
    status: string | null;
    assigneeName?: string | null;
    withdrawalRequest?: WithdrawalRequest | null;
}

export const ReviewApplicationInfoCard: React.FC<ReviewApplicationInfoCardProps> = ({
    desnzRef,
    status,
    assigneeName,
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

    return <SummaryCard title={L.SUMMARY_CARD.TITLE} rows={rows} />;
};
