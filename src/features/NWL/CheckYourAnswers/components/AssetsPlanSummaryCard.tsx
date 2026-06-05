/**
 * Asset plan and verification summary card
 * Displays uploaded application plan files and plan verification answer
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface AssetPlanDocument {
    filename?: string;
    title?: string;
}

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets?: any[];
    applicationId: string;
    canEdit?: boolean;
}

const LINE_TYPE_LABELS: Record<string, string> = {
    overhead_line: 'Overhead line',
    overhead_line_wooden_pole: 'Overhead line (wooden pole)',
    underground_cable: 'Underground cable',
    stay: 'Stay',
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
        .join(', ');
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

const getDocumentNames = (documents: AssetPlanDocument[] = []): string[] => {
    return documents
        .map((doc) => doc.filename || doc.title || '')
        .filter((name) => Boolean(name));
};

export const AssetsPlanSummaryCard: React.FC<Props> = ({ data, assets = [], applicationId, canEdit = true }) => {
    const metadata = data || {};

    const documents = metadata.application_plan_documents || metadata.applicationDocuments || [];
    const documentNames = getDocumentNames(documents);
    const hasAssetsMatchPlanValue = typeof metadata.assets_match_plan === 'boolean';

    const hasContent =
        documentNames.length > 0 ||
        hasAssetsMatchPlanValue ||
        Boolean(metadata.assets_match_plan_explanation) ||
        Boolean(metadata.metadata_id || metadata.assets_metadata_id) ||
        assets.length > 0;

    if (!hasContent) {
        return null;
    }

    const rows: SummaryRow[] = [];

    assets.forEach((asset, index) => {
        const assetLabel = `Asset ${index + 1}`;
        const lineTypes = Array.isArray(asset.line_types) ? asset.line_types : [];

        rows.push(
            createSummaryRow(
                `${assetLabel} - ${CONSTANTS.ASSET_FIELDS.LINE_VOLTAGE}`,
                asset.line_voltage || CONSTANTS.DEFAULTS.EMPTY
            )
        );

        rows.push(
            createSummaryRow(
                `${assetLabel} - ${CONSTANTS.ASSET_FIELDS.LINE_TYPES}`,
                lineTypes.length > 0 ? getLineTypesText(lineTypes) : CONSTANTS.DEFAULTS.EMPTY
            )
        );

        rows.push(
            createSummaryRow(
                `${assetLabel} - ${CONSTANTS.ASSET_FIELDS.COMMENTS}`,
                getCommentsHtml(lineTypes, asset.component_descriptions || {}) || CONSTANTS.DEFAULTS.EMPTY
            )
        );
    });

    rows.push(
        createSummaryRow(
            CONSTANTS.ASSET_FIELDS.APPLICATION_PLAN_DOCUMENTS,
            documentNames.length > 0 ? documentNames.join('<br>') : CONSTANTS.DEFAULTS.EMPTY
        )
    );

    rows.push(
        createSummaryRow(
            CONSTANTS.ASSET_FIELDS.ASSETS_MATCH_PLAN,
            hasAssetsMatchPlanValue
                ? formatBoolean(metadata.assets_match_plan)
                : CONSTANTS.DEFAULTS.EMPTY
        )
    );

    if (hasAssetsMatchPlanValue && metadata.assets_match_plan === false) {
        rows.push(
            createSummaryRow(
                CONSTANTS.ASSET_FIELDS.ASSETS_MATCH_PLAN_EXPLANATION,
                metadata.assets_match_plan_explanation || CONSTANTS.DEFAULTS.EMPTY
            )
        );
    }

    return (
        <SummaryCard
            title={CONSTANTS.SECTION_HEADINGS.ASSETS}
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
