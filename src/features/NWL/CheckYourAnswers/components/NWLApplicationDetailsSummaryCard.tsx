/**
 * NWL Application Details Summary Card
 * Displays application type, paragraph, dates, and documents
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLApplicationDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.APPLICATION_DETAILS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.APPLICATION_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Application type
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.NOT_PROVIDED));

    // Paragraph
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.PARAGRAPH, data.paragraph || CONSTANTS.DEFAULTS.NOT_PROVIDED));

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
        rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.OFFER_DOCUMENT, CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    // Notice date
    rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.NOTICE_DATE, formatDate(data.notice_date)));

    // Notice documents
    if (data.notice_documents) {
        const docHtml = `<a href="#" class="govuk-link">${data.notice_documents}</a>`;
        rows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.NOTICE_DOCUMENTS },
            value: { text: '', html: docHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.NOTICE_DOCUMENTS, CONSTANTS.DEFAULTS.NOT_PROVIDED));
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
