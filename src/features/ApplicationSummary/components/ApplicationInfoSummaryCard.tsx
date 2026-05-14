import React from 'react';
import { getStatusTagClass } from '../utils/statusUtils';

interface ApplicationInfo {
    desnzReference: string;
    caseType: string;
    applicationStatus: string;
}

interface ApplicationInfoSummaryCardProps {
    applicationInfo: ApplicationInfo;
}

export const ApplicationInfoSummaryCard: React.FC<ApplicationInfoSummaryCardProps> = ({
    applicationInfo,
}) => {
    const getStatusClass = getStatusTagClass;

    return (
        <div className="govuk-summary-card">
            <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">Summary</h2>
            </div>
            <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">DESNZ reference</dt>
                        <dd className="govuk-summary-list__value" data-testid="desnz-reference">
                            <strong>{applicationInfo.desnzReference}</strong>
                        </dd>
                    </div>
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Case type</dt>
                        <dd className="govuk-summary-list__value" data-testid="case-type">{applicationInfo.caseType}</dd>
                    </div>
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Application status</dt>
                        <dd className="govuk-summary-list__value" data-testid="application-status">
                            <strong className={`govuk-tag ${getStatusClass(applicationInfo.applicationStatus)}`}>
                                {applicationInfo.applicationStatus}
                            </strong>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};
