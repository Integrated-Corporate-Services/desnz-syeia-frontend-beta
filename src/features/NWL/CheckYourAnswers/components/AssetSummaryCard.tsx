/**
 * Single Asset Summary Card
 * Displays one asset's details
 */


import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

// Map backend line type keys to readable labels
const LINE_TYPE_LABELS: Record<string, string> = {
    overhead_line: 'Overhead line',
    overhead_line_wooden_pole: 'Overhead line (wooden pole)',
    underground_cable: 'Underground cable',
    stay: 'Stay',
    // Add more as needed
};

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
    rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_VOLTAGE, data.line_voltage || CONSTANTS.DEFAULTS.EMPTY));

    // Line types
    if (data.line_types && data.line_types.length > 0) {
        const lineTypesText = data.line_types
            .map((type: string) => LINE_TYPE_LABELS[type] || type)
            .join(', ');

        rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_TYPES, lineTypesText));

        const commentsHtml = data.line_types
            .map((type: string) =>
                `<strong>${LINE_TYPE_LABELS[type] || type}:</strong> ${data.component_descriptions?.[type] || 'No comment'}`
            )
            .join('<br>');

        rows.push({
            key: { text: CONSTANTS.ASSET_FIELDS.COMMENTS },
            value: { text: '', html: commentsHtml },
        });
    } else {
        rows.push(createSummaryRow(CONSTANTS.ASSET_FIELDS.LINE_TYPES, CONSTANTS.DEFAULTS.EMPTY));
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