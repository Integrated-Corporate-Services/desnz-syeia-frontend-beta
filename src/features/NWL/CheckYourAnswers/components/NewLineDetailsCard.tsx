import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    data: any;
    applicationId: string;
    canEdit: boolean;
}

const NewLineDetailsCard: React.FC<Props> = ({ data, applicationId, canEdit }) => {
    const rows: SummaryRow[] = [];
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.EMPTY));
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DATE, formatDate(data.offer_date)));
    if (data.offer_document) {
        const docHtml = `<a href="#" class="govuk-link">${data.offer_document}</a>`;
        rows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.OFFER_DOCUMENT },
            value: { text: '', html: docHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DOCUMENT, CONSTANTS.DEFAULTS.EMPTY));
    }
    // ...add any new line specific fields here
    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.APPLICATION_DETAILS}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.APPLICATION_DETAILS(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};

export default NewLineDetailsCard;