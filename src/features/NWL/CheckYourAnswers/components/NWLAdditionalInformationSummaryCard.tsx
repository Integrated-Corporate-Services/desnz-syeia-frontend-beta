/**
 * Additional Information Summary Card for NWL
 * Displays related applications and other important information
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatBoolean } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('NWLAdditionalInformationSummaryCard');

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLAdditionalInformationSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    React.useEffect(() => {
        const handleDocClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.hasAttribute('data-file-key')) {
                e.preventDefault();
                const fileKey = target.getAttribute('data-file-key');
                if (fileKey) {
                    try {
                        await downloadS3FileOnSameTab(fileKey);
                    } catch (error) {
                        logger.error('Failed to download document', { error, fileKey });
                    }
                }
            }
        };

        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

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
        if (Array.isArray(data.other_documents)) {
            docs = data.other_documents.filter(Boolean);
        } else if (typeof data.other_documents === 'string' && data.other_documents.trim()) {
            docs = [data.other_documents.trim()];
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
                return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${filename}">${filename}</a>`;
            })
            .join('<br>');

        return docLinks;
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

        const otherDocHtml = getOtherDocumentNames();
        if (otherDocHtml) {
            rows.push({
                key: { text: CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS },
                value: { text: '', html: otherDocHtml },
            });
        } else {
            rows.push(createSummaryRow(CONSTANTS.ADDITIONAL_INFO_FIELDS.OTHER_DOCUMENTS, CONSTANTS.DEFAULTS.EMPTY));
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