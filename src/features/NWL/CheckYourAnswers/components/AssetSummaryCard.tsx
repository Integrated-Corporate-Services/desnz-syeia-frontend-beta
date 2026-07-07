import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    asset: any;
    assetNumber: number;
    applicationId: string;
    canEdit?: boolean;
}

const LINE_TYPE_LABELS: Record<string, string> = {
    overhead_line: 'Overhead line',
    overhead_line_wooden_pole_stay: 'Overhead line (wooden pole stay)',
    overhead_line_steel_tower: 'Overhead line (steel tower)',
    overhead_line_wooden_pole: 'Overhead line (wooden pole)',
    underground_cable: 'Underground cable',
    wooden_pole: 'Wooden pole',
    stay: 'Stay',
    earth_wire_apparatus: 'Earth wire apparatus',
    other: 'Other',
};

const toSentenceCase = (value: string): string => {
    return value
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (c) => c.toUpperCase());
};

const getLineTypesText = (lineTypes: string[] = []): string => {
    return lineTypes
        .map((lineType) => LINE_TYPE_LABELS[lineType] || toSentenceCase(lineType))
        .join('<br>');
};

const getCommentsHtml = (lineTypes: string[] = [], componentDescriptions: Record<string, string> = {}): string => {
    const comments = lineTypes
        .map((lineType) => {
            const label = LINE_TYPE_LABELS[lineType] || toSentenceCase(lineType);
            const description = componentDescriptions[lineType];
            return description ? `<strong>${label}:</strong> ${description}` : '';
        })
        .filter(Boolean);

    return comments.join('<br>');
};

export const AssetSummaryCard: React.FC<Props> = ({ asset, assetNumber, applicationId, canEdit = true }) => {
    const rows: SummaryRow[] = [];

    const lineTypes = Array.isArray(asset.line_types) ? asset.line_types : [];

    rows.push(
        createSummaryRow(
            CONSTANTS.ASSET_FIELDS.LINE_VOLTAGE,
            asset.line_voltage || CONSTANTS.DEFAULTS.EMPTY
        )
    );

    rows.push({
        key: { text: CONSTANTS.ASSET_FIELDS.LINE_TYPES },
        value: { 
            text: '', 
            html: lineTypes.length > 0 ? getLineTypesText(lineTypes) : CONSTANTS.DEFAULTS.EMPTY 
        },
    });

    const commentsHtml = getCommentsHtml(lineTypes, asset.component_descriptions || {});
    rows.push({
        key: { text: CONSTANTS.ASSET_FIELDS.COMMENTS },
        value: { 
            text: '', 
            html: commentsHtml || CONSTANTS.DEFAULTS.EMPTY 
        },
    });

    return (
        <SummaryCard
            title={`${CONSTANTS.CARD_TITLES.ASSET} ${assetNumber}`}
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
