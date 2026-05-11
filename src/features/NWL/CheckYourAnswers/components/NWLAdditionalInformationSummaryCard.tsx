/**
 * Additional Information Summary Card for NWL
 * Displays related applications and other important information
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLAdditionalInformationSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.TREES_AND_VEGETATION}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.ADDITIONAL_INFO(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Related applications
    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_APPLICATIONS, formatBoolean(data.has_related)));

    if (data.has_related) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_DETAILS, data.related_details || CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    // Other important information
    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_INFORMATION, formatBoolean(data.has_other)));

    if (data.has_other) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DETAILS, data.other_details || CONSTANTS.DEFAULTS.NOT_PROVIDED));

        // Other documents
        if (data.other_documents) {
            const docHtml = `<a href="#" class="govuk-link">${data.other_documents}</a>`;
            rows.push({
                key: { text: CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS },
                value: { text: '', html: docHtml },
            });
        } else {
            rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS, CONSTANTS.DEFAULTS.NOT_PROVIDED));
        }
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.TREES_AND_VEGETATION}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.ADDITIONAL_INFO(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
