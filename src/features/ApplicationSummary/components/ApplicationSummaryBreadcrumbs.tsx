import React from 'react';
import { Link } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

export interface ApplicationSummaryBreadcrumbsProps {
    applicationType: string;
    applicationId: string;
}

export const ApplicationSummaryBreadcrumbs: React.FC<ApplicationSummaryBreadcrumbsProps> = ({
    applicationType,
    applicationId,
}) => {
    return (
        <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={CONSTANTS.ROUTES.APPLICATIONS}>
                        {CONSTANTS.BREADCRUMBS.APPLICATIONS}
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">
                    {CONSTANTS.BREADCRUMBS.SUMMARY}
                </li>
            </ol>
        </nav>
    );
};
