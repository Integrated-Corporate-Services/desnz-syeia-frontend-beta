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

    const getOtherDocumentNames = (): string[] => {
        if (Array.isArray(data.other_documents)) {
            return data.other_documents.filter(Boolean);
        }

        if (typeof data.other_documents === 'string' && data.other_documents.trim()) {
            return [data.other_documents.trim()];
        }

        return [];
    };

    // Related applications
    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_APPLICATIONS, formatBoolean(data.has_related)));

    if (data.has_related) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_DETAILS, data.related_details || CONSTANTS.DEFAULTS.EMPTY));
    }

    // Other important information
    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_INFORMATION, formatBoolean(data.has_other)));

    if (data.has_other) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DETAILS, data.other_details || CONSTANTS.DEFAULTS.EMPTY));

        // Other documents
        const otherDocumentNames = getOtherDocumentNames();
        if (otherDocumentNames.length > 0) {
            const docHtml = otherDocumentNames.join('<br>');
            rows.push({
                key: { text: CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS },
                value: { text: '', html: docHtml },
            });
        } else {
            rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS, CONSTANTS.DEFAULTS.EMPTY));
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