/**
 * Application Info Card
 * Top summary card showing DESNZ reference, case type and application status.
 */

import React from 'react';
import { SummaryCard } from '../../CheckYourAnswers/components';
import { SummaryRow } from '../../CheckYourAnswers/types';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface ApplicationInfoCardProps {
    desnzRef: string | null;
    status: string | null;
}

const getStatusTagClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved')) return 'govuk-tag--green';
    if (statusLower.includes('rejected')) return 'govuk-tag--red';
    if (statusLower.includes('withdrawn')) return 'govuk-tag--grey';
    if (statusLower.includes('pending')) return 'govuk-tag--yellow';
    return 'govuk-tag--blue';
};

const formatStatusLabel = (status: string | null): string => {
    if (!status) return CONSTANTS.DEFAULTS.NOT_AVAILABLE;
    const normalised = status.toUpperCase().replace(/\s+/g, '_');
    return CONSTANTS.STATUS_LABELS[normalised] || status;
};

export const ApplicationInfoCard: React.FC<ApplicationInfoCardProps> = ({ desnzRef, status }) => {
    const statusLabel = formatStatusLabel(status);
    const statusHtml = status
        ? `<strong class="govuk-tag ${getStatusTagClass(status)}">${statusLabel}</strong>`
        : CONSTANTS.DEFAULTS.NOT_AVAILABLE;

    const rows: SummaryRow[] = [
        {
            key: { text: CONSTANTS.SUMMARY_CARD.DESNZ_REF },
            value: { text: desnzRef || CONSTANTS.DEFAULTS.NOT_AVAILABLE },
        },
        {
            key: { text: CONSTANTS.SUMMARY_CARD.CASE_TYPE },
            value: { text: CONSTANTS.CASE_TYPE_LABEL },
        },
        {
            key: { text: CONSTANTS.SUMMARY_CARD.STATUS },
            value: { text: '', html: statusHtml },
        },
    ];

    return <SummaryCard title={CONSTANTS.SUMMARY_CARD.TITLE} rows={rows} />;
};
