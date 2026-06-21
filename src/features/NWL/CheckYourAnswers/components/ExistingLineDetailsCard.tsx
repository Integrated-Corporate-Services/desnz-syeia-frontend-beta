import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate, formatBoolean, getApplicationOptionText, getWayleaveTypeText } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { createLogger } from '../../../../utils/logger';

const logger = createLogger('ExistingLineDetailsCard');

interface Props {
    data: any;
    noticeComplianceData?: any;
    applicationId: string;
    canEdit: boolean;
}

const ExistingLineDetailsCard: React.FC<Props> = ({ data, noticeComplianceData, applicationId, canEdit }) => {
    const typeOfLineRows: SummaryRow[] = [
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE,
            data.application_type || 'Existing line'
        ),
    ];

    const groundsRows: SummaryRow[] = [];

    const applicationOptionText = data.application_option || 
        (data.grounds_for_application ? getApplicationOptionText(data.grounds_for_application) : '');
    
    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.APPLICATION_OPTION,
            applicationOptionText
        )
    );

    if (data.wayleave_type) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.EXISTING_WAYLEAVE_TYPE,
                getWayleaveTypeText(data.wayleave_type)
            )
        );
    }

    if (data.wayleave_expiry_date) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_EXPIRY_DATE,
                formatDate(data.wayleave_expiry_date) || ''
            )
        );
    }

    if (data.wayleave_expiry_documents && data.wayleave_expiry_documents.length > 0) {
        const docs = data.wayleave_expiry_documents;
        const docLinks = docs.map((doc: any) => {
            const fileKey = doc.fileUrl || doc.file_id;
            return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`;
        }).join('<br>');
        groundsRows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_EXPIRY_DOCUMENTS },
            value: { text: '', html: docLinks },
        });
    }

    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.NOTICE_DATE,
            formatDate(data.notice_date) || ''
        )
    );

    if (data.notice_documents && data.notice_documents.length > 0) {
        const docLinks = data.notice_documents.map((doc: any) => {
            const fileKey = doc.fileUrl || doc.file_id;
            return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`;
        }).join('<br>');
        groundsRows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.NOTICE_DOCUMENTS },
            value: { text: '', html: docLinks },
        });
    }

    if (data.notice_to_terminate_date) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.NOTICE_TO_TERMINATE_DATE,
                formatDate(data.notice_to_terminate_date) || ''
            )
        );
    }

    if (data.notice_to_terminate_documents && data.notice_to_terminate_documents.length > 0) {
        const docLinks = data.notice_to_terminate_documents.map((doc: any) => {
            const fileKey = doc.fileUrl || doc.file_id;
            return `<a href="#" class="govuk-link" data-file-key="${fileKey}" data-filename="${doc.filename}">${doc.filename}</a>`;
        }).join('<br>');
        groundsRows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.NOTICE_TO_TERMINATE_DOCUMENTS },
            value: { text: '', html: docLinks },
        });
    }

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

    const complianceData = noticeComplianceData || data;

    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.NTR_CLEARLY_REFERS,
            formatBoolean(complianceData.notice_clearly_refers ?? complianceData.ntr_clearly_refers)
        )
    );

    const ntrClearlyRefers = complianceData.notice_clearly_refers ?? complianceData.ntr_clearly_refers;
    const unclearExplanation = complianceData.unclear_explanation ?? complianceData.ntr_unclear_explanation;
    if (ntrClearlyRefers === false && unclearExplanation) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.EXPLAIN_NTR_UNCLEAR,
                unclearExplanation
            )
        );
    }

    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.WITHIN_THREE_MONTHS,
            formatBoolean(complianceData.within_three_months)
        )
    );

    const lateReason = complianceData.late_reason ?? complianceData.late_submission_reason;
    if (complianceData.within_three_months === false && lateReason) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.LATE_SUBMISSION_REASON,
                lateReason
            )
        );
    }

    const differentTerm = complianceData.different_term ?? complianceData.different_term_requested;
    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.DIFFERENT_TERM_REQUESTED,
            formatBoolean(differentTerm)
        )
    );
    const termExplanation = complianceData.different_term_explanation ?? complianceData.term_length_explanation;
    if (differentTerm === true && termExplanation) {
        groundsRows.push(
            createSummaryRow(
                CONSTANTS.APPLICATION_FIELDS.TERM_LENGTH_EXPLANATION,
                termExplanation
            )
        );
    }

    return (
        <>
            <SummaryCard
                title="Type of line"
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
                title="Grounds for application"
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

export default ExistingLineDetailsCard;