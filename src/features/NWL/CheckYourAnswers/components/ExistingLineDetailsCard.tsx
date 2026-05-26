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

const ExistingLineDetailsCard: React.FC<Props> = ({ data, applicationId, canEdit }) => {
    const rows: SummaryRow[] = [];
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.EMPTY));
    // Paragraph
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.PARAGRAPH, data.paragraph || CONSTANTS.DEFAULTS.EMPTY));

    // Offer date
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DATE, formatDate(data.offer_date)));

    // Offer document
    if (data.offer_document) {
        const docHtml = `<a href="#" class="govuk-link">${data.offer_document}</a>`;
        rows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.OFFER_DOCUMENT },
            value: { text: '', html: docHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DOCUMENT, CONSTANTS.DEFAULTS.EMPTY));
    }
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.NOTICE_DATE, formatDate(data.notice_date)));
    if (data.notice_documents) {
        const docHtml = `<a href="#" class="govuk-link">${data.notice_documents}</a>`;
        rows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.NOTICE_DOCUMENTS },
            value: { text: '', html: docHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.NOTICE_DOCUMENTS, CONSTANTS.DEFAULTS.EMPTY));
    }
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

export default ExistingLineDetailsCard;