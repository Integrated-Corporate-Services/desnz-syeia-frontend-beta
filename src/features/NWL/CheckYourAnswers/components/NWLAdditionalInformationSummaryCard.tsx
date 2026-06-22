import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLAdditionalInformationSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.ADDITIONAL_INFORMATION}
                rows={[]}
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
    }

    const rows: SummaryRow[] = [];

    const getOtherDocumentNames = (): string => {
        let docs = [];
        if (Array.isArray(data.other_information_documents)) {
            docs = data.other_information_documents.filter(Boolean);
        } else if (typeof data.other_information_documents === 'string' && data.other_information_documents.trim()) {
            docs = [data.other_information_documents.trim()];
        }

        if (docs.length === 0) return '';

        const docLinks = docs
            .filter((doc: any) => {
                if (typeof doc === 'string') return true;
                return doc.filename || doc.title;
            })
            .map((doc: any) => {
                if (typeof doc === 'string') {
                    return `<span>${doc}</span>`;
                }
                const fileKey = doc.fileUrl || doc.s3_key || doc.file_id;
                const filename = doc.filename || doc.title;
                const downloadUrl = `/backend/api/file/download?key=${encodeURIComponent(fileKey)}`;
                return `<a href="${downloadUrl}" class="govuk-link" data-file-key="${fileKey}" data-filename="${filename}">${filename}</a>`;
            })
            .join('<br>');

        return docLinks;
    };

    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_APPLICATIONS, formatBoolean(data.has_related_applications)));

    if (data.has_related_applications) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.RELATED_DETAILS, data.related_applications_details || CONSTANTS.DEFAULTS.EMPTY));
    }

    rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_INFORMATION, formatBoolean(data.has_other_information)));

    if (data.has_other_information) {
        rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DETAILS, data.other_information_details || CONSTANTS.DEFAULTS.EMPTY));

        const otherDocHtml = getOtherDocumentNames();
        if (otherDocHtml) {
            rows.push({
                key: { text: CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS },
                value: { text: '', html: otherDocHtml },
            });
        }
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.ADDITIONAL_INFORMATION}
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