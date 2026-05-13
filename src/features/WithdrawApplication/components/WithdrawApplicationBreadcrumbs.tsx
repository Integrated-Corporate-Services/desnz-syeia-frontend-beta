import React from 'react';
import { Link } from 'react-router-dom';
import { WITHDRAWAL_CONSTANTS as CONSTANTS } from '../constants';

export interface WithdrawApplicationBreadcrumbsProps {
    applicationType: string;
    applicationId: string;
    currentPage: 'withdraw' | 'confirmation';
}

export const WithdrawApplicationBreadcrumbs: React.FC<WithdrawApplicationBreadcrumbsProps> = ({
    applicationType,
    applicationId,
    currentPage,
}) => {
    const summaryUrl = CONSTANTS.ROUTES.SUMMARY(applicationType, applicationId);

    return (
        <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={CONSTANTS.ROUTES.APPLICATIONS}>
                        {CONSTANTS.BREADCRUMBS.APPLICATIONS}
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={summaryUrl}>
                        {CONSTANTS.BREADCRUMBS.SUMMARY}
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">
                    {currentPage === 'withdraw'
                        ? CONSTANTS.BREADCRUMBS.WITHDRAW
                        : CONSTANTS.CONFIRMATION_PAGE.HEADING}
                </li>
            </ol>
        </nav>
    );
};
