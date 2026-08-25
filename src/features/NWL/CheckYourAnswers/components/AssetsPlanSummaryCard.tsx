import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean, escapeHtml } from '../utils';
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

    const documents = metadata.application_plan?.plan_documents || metadata.application_plan_documents || metadata.applicationDocuments || [];
    const documentNames = getDocumentNames(documents);
    const hasAssetsMatchPlanValue = typeof metadata.assets_match_application_plan === 'boolean';

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
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    if (documents.length > 0) {
        const docLinks = documents
            .filter((doc: any) => doc.filename || doc.title)
            .map((doc: any) => {
                const fileKey = doc.fileUrl || doc.s3_key || doc.file_id;
                const filename = doc.filename || doc.title;
                const downloadUrl = `/api/file/download?key=${encodeURIComponent(fileKey)}`;
                const safeFileKey = escapeHtml(fileKey || '');
                const safeFileId = escapeHtml(doc.file_id || '');
                const safeDocumentId = escapeHtml(doc.document_id || '');
                const safeFilename = escapeHtml(filename || '');
                return `<a href="${downloadUrl}" class="govuk-link" data-file-key="${safeFileKey}" data-file-id="${safeFileId}" data-document-id="${safeDocumentId}" data-filename="${safeFilename}">${safeFilename}</a>`;
            })
            .join('<br>');
        rows.push({
            key: { text: CONSTANTS.ASSET_FIELDS.APPLICATION_PLAN_DOCUMENTS },
            value: { text: '', html: docLinks || CONSTANTS.DEFAULTS.EMPTY },
        });
    } else {
        rows.push({
            key: { text: CONSTANTS.ASSET_FIELDS.APPLICATION_PLAN_DOCUMENTS },
            value: { text: CONSTANTS.DEFAULTS.EMPTY },
        });
    }

    rows.push(
        createSummaryRow(
            CONSTANTS.ASSET_FIELDS.ASSETS_MATCH_PLAN,
            hasAssetsMatchPlanValue
                ? formatBoolean(metadata.assets_match_application_plan)
                : CONSTANTS.DEFAULTS.EMPTY
        )
    );

    if (hasAssetsMatchPlanValue && metadata.assets_match_application_plan === false) {
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
