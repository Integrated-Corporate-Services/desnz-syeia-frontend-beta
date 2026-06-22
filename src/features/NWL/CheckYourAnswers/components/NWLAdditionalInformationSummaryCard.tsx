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
                title="Related applications and other information"
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

    // Related applications
    rows.push(createSummaryRow('Related applications?', formatBoolean(data.has_related_applications)));

    if (data.has_related_applications) {
        rows.push(createSummaryRow('Related application details', data.related_applications_details || CONSTANTS.DEFAULTS.EMPTY));
    }

    // Other important information
    rows.push(createSummaryRow('Other important information?', formatBoolean(data.has_other_information)));

    if (data.has_other_information) {
        rows.push(createSummaryRow('Other information details', data.other_information_details || CONSTANTS.DEFAULTS.EMPTY));

        const otherDocHtml = getOtherDocumentNames();
        if (otherDocHtml) {
            rows.push({
                key: { text: 'Other information documents' },
                value: { text: '', html: otherDocHtml },
            });
        }
    }

    return (
        <SummaryCard
            title="Related applications and other information"
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