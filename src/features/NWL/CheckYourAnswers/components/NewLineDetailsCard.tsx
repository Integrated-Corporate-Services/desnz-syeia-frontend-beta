import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface Props {
    data: any;
    noticeComplianceData?: any;
    applicationId: string;
    canEdit: boolean;
}

const NewLineDetailsCard: React.FC<Props> = ({ data, noticeComplianceData, applicationId, canEdit }) => {

    const typeOfLineRows: SummaryRow[] = [];
    typeOfLineRows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.EMPTY));

    const groundsRows: SummaryRow[] = [];
    groundsRows.push(createSummaryRow(CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_NOTICE_DATE, formatDate(data.wayleave_offer_date)));
    
    if (data.wayleave_offer_documents && data.wayleave_offer_documents.length > 0) {
        const docLinks = data.wayleave_offer_documents.map((doc: any) => {
            const fileKey = doc.fileUrl || doc.file_id;
            const downloadUrl = `/api/file/download?key=${encodeURIComponent(fileKey)}`;
            return `<a href="${downloadUrl}" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`;
        }).join('<br>');
        groundsRows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_NOTICE_DOCUMENTS },
            value: { text: '', html: docLinks },
        });
    }

    if (noticeComplianceData) {
        if (noticeComplianceData.different_term_requested !== null && noticeComplianceData.different_term_requested !== undefined) {
            groundsRows.push(createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.DIFFERENT_TERM_REQUESTED, 
                noticeComplianceData.different_term_requested ? 'Yes' : 'No'
            ));
        }

        if (noticeComplianceData.different_term_length_and_explanation) {
            groundsRows.push(createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.TERM_LENGTH_EXPLANATION,
                noticeComplianceData.different_term_length_and_explanation
            ));
        }
    }

    return (
        <>
            <SummaryCard
                title={CONSTANTS.APPLICATION_FIELDS.TYPE_OF_LINE}
                rows={typeOfLineRows}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.APPLICATION_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
            <SummaryCard
                title={CONSTANTS.APPLICATION_FIELDS.GROUNDS_HEADING}
                rows={groundsRows}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.GROUNDS_FOR_APPLICATION(applicationId),
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        </>
    );
};

export default NewLineDetailsCard;