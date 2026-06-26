import React from 'react';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from '../types';
import { createSummaryRow, formatDate } from '../utils';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';


import NewLineDetailsCard from './NewLineDetailsCard';
import ExistingLineDetailsCard from './ExistingLineDetailsCard';

interface Props {
    data: any;
    noticeComplianceData?: any;
    applicationId: string;
    canEdit?: boolean;
}

export const NWLApplicationDetailsSummaryCard: React.FC<Props> = ({ data, noticeComplianceData, applicationId, canEdit = true }) => {
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
                                  text: CONSTANTS.ACTIONS.CHANGE,
                              },
                          ]
                        : undefined
                }
            />
        );
    }

    if (data.application_type === 'New line') {
        return <NewLineDetailsCard data={data} noticeComplianceData={noticeComplianceData} applicationId={applicationId} canEdit={canEdit} />;
    } else if (
        data.application_type === 'Existing line' ||
        data.application_type === 'Existing lines' ||
        data.application_type === 'existing_lines'
    ) {
        return <ExistingLineDetailsCard data={data} noticeComplianceData={noticeComplianceData} applicationId={applicationId} canEdit={canEdit} />;
    } else {
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