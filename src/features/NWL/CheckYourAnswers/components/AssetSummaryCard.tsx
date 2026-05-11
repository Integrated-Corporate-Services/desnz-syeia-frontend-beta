/**
 * Single Asset Summary Card
 * Displays one asset's details
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    index: number;
    applicationId: string;
    canEdit?: boolean;
}

export const AssetSummaryCard: React.FC<Props> = ({ data, index, applicationId, canEdit = true }) => {
    if (!data) {
        return null;
    }

    const rows: SummaryRow[] = [];

    // Line voltage
    rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_VOLTAGE, data.line_voltage || CONSTANTS.DEFAULTS.NOT_PROVIDED));

    // Line types
    if (data.line_types && data.line_types.length > 0) {
        const lineTypesText = data.line_types.map((lt: any) => lt.type).join(', ');
        rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_TYPES, lineTypesText));

        // Comments for each line type
        const commentsHtml = data.line_types.map((lt: any) => `<strong>${lt.type}:</strong> ${lt.comment || 'No comment'}`).join('<br>');
        rows.push({
            key: { text: CONSTANTS.ASSET_FIELDS.COMMENTS },
            value: { text: '', html: commentsHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_TYPES, CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    return (
        <SummaryCard
            title={`${CONSTANTS.CARD_TITLES.ASSET} ${index + 1}`}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.ASSET(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
