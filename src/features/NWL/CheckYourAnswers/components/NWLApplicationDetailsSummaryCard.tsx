/**
 * NWL Application Details Summary Card
 * Displays application type, paragraph, dates, and documents
 */


import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';


import NewLineDetailsCard from './NewLineDetailsCard';
import ExistingLineDetailsCard from './ExistingLineDetailsCard';

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLApplicationDetailsSummaryCard: React.FC<Props> = ({ data, applicationId, canEdit = true }) => {
    if (!data) {
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.APPLICATION_DETAILS}
                rows={[]}
                actions={
                    canEdit
                        ? [
                              {
                                  href: CONSTANTS.ROUTES.APPLICATION_DETAILS(applicationId),
                                  text: CONSTANTS.ACTIONS.ADD,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    // Route to the correct details card based on application_type
    if (data.application_type === 'New line') {
        return <NewLineDetailsCard data={data} applicationId={applicationId} canEdit={canEdit} />;
    } else if (
        data.application_type === 'Existing line' ||
        data.application_type === 'Existing lines' ||
        data.application_type === 'existing_lines'
    ) {
        return <ExistingLineDetailsCard data={data} applicationId={applicationId} canEdit={canEdit} />;
    } else {
        // fallback: show just the type
        return (
            <SummaryCard
                title={CONSTANTS.CARD_TITLES.APPLICATION_DETAILS}
                rows={[createSummaryRow(CONSTANTS.APPLICATION_FIELDS.APPLICATION_TYPE, data.application_type || CONSTANTS.DEFAULTS.EMPTY)]}
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
        );
    }
};