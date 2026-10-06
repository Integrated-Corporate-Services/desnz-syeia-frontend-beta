import React from 'react';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import { WithdrawalRequest } from '../types';
import { NWLApplicationSummaryContent } from '../../NWL/ApplicationSummary';
import { S37ApplicationSummaryContent } from './S37ApplicationSummaryContent';

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
            return (
                <S37ApplicationSummaryContent
                    data={data}
                    applicationId={applicationId}
                    withdrawalRequest={withdrawalRequest}
                />
            );
        default:
            return <div>Unsupported application type: {data.formType}</div>;
    }
};
