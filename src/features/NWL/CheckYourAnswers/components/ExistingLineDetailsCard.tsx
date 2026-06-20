import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate, formatBoolean, getApplicationOptionText, getWayleaveTypeText } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

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
                CONSTANTS.APPLICATION_FIELDS.WAYLEAVE_TYPE,
                getWayleaveTypeText(data.wayleave_type)
            )
        );
    }

    groundsRows.push(
        createSummaryRow(
            CONSTANTS.APPLICATION_FIELDS.NOTICE_DATE,
            formatDate(data.notice_date) || ''
        )
    );

    if (data.notice_documents) {
        const docHtml = `<a href="${data.notice_documents_url || '#'}" class="govuk-link">${data.notice_documents}</a>`;
        groundsRows.push({
            key: { text: CONSTANTS.APPLICATION_FIELDS.RELATED_DOCUMENTS },
            value: { text: '', html: docHtml },
        });
    }

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