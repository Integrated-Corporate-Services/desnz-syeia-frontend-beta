import React from 'react';
import { Link } from 'react-router-dom';

export interface ApplicationSummaryBreadcrumbsProps {
    applicationType: string;
    applicationId: string;
}

export const ApplicationSummaryBreadcrumbs: React.FC<ApplicationSummaryBreadcrumbsProps> = () => {
    return (
        <Link to="/application-dashboard" className="govuk-back-link">
            Back
        </Link>
    );
};
