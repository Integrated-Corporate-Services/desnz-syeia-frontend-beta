/**
 * Notice and Compliance Summary Card
 * Displays notice compliance checks with conditional fields
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

export const NoticeComplianceSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.NOTICE_COMPLIANCE}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.NOTICE_COMPLIANCE(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    const rows: SummaryRow[] = [];

    // Notice clearly refers
    rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.CLEARLY_REFERS, formatBoolean(data.notice_clearly_refers)));

    // If NO - show explanation
    if (data.notice_clearly_refers === false) {
        rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.UNCLEAR_EXPLANATION, data.unclear_explanation || CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    // Within three months
    rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.WITHIN_THREE_MONTHS, formatBoolean(data.within_three_months)));

    // If NO - show reason
    if (data.within_three_months === false) {
        rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.LATE_REASON, data.late_reason || CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    // Different term
    rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.DIFFERENT_TERM, formatBoolean(data.different_term)));

    // If YES - show explanation
    if (data.different_term === true) {
        rows.push(createSummaryRow(CONSTANTS.NOTICE_FIELDS.DIFFERENT_TERM_EXPLANATION, data.different_term_explanation || CONSTANTS.DEFAULTS.NOT_PROVIDED));
    }

    return (
        <SummaryCard
            title={CONSTANTS.CARD_TITLES.NOTICE_COMPLIANCE}
            rows={rows}
            actions={
                canEdit
                    ? [
                          {
                              href: CONSTANTS.ROUTES.NOTICE_COMPLIANCE(applicationId),
                              text: CONSTANTS.ACTIONS.CHANGE,
                          },
                      ]
                    : undefined
            }
        />
    );
};
