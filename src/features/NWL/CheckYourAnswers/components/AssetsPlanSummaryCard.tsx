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
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

const getDocumentNames = (documents: AssetPlanDocument[] = []): string[] => {
    return documents
        .map((doc) => doc.filename || doc.title || '')
        .filter((name) => Boolean(name));
};

export const AssetsPlanSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    const metadata = data || {};

    const documents = metadata.application_plan_documents || metadata.applicationDocuments || [];
    const documentNames = getDocumentNames(documents);
    const hasAssetsMatchPlanValue = typeof metadata.assets_match_plan === 'boolean';

    const hasContent =
        documentNames.length > 0 ||
        hasAssetsMatchPlanValue ||
        Boolean(metadata.assets_match_plan_explanation);

    if (!hasContent) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.ASSET_PLAN}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.APPLICATION_PLAN(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    rows.push({
        key: { text: CONSTANTS.ASSET_FIELDS.APPLICATION_PLAN_DOCUMENTS },
        value: {
            text: '',
            html: documentNames.length > 0 ? documentNames.join('<br>') : CONSTANTS.DEFAULTS.EMPTY,
        },
    });

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
            title={CONSTANTS.CARD_TITLES.ASSET_PLAN}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.APPLICATION_PLAN(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
