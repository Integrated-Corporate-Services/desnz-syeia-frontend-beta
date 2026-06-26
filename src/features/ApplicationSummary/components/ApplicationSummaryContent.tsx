import React from 'react';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import { WithdrawalRequest } from '../types';
import { NWLApplicationSummaryContent } from '../../NWL/ApplicationSummary';

interface ApplicationSummaryContentProps {
    data: ApplicationReviewSummaryData;
    applicationId: string;
    withdrawalRequest: WithdrawalRequest | null;
}

export const ApplicationSummaryContent: React.FC<ApplicationSummaryContentProps> = ({
    data,
    applicationId,
    withdrawalRequest,
}) => {
    switch (data.formType) {
        case 'NWL':
            return (
                <NWLApplicationSummaryContent
                    data={data}
                    applicationId={applicationId}
                    withdrawalRequest={withdrawalRequest}
                />
            );
        case 'S37':
            return <div>S37 Application Summary - Coming Soon</div>;
        case 'TLP':
            return <div>TLP Application Summary - Coming Soon</div>;
        default:
            return <div>Unsupported application type: {data.formType}</div>;
    }
};
