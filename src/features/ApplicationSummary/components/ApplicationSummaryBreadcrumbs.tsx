import React from 'react';
import { Link } from 'react-router-dom';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';

export interface ApplicationSummaryBreadcrumbsProps {
    applicationType: string;
    applicationId: string;
}

export const ApplicationSummaryBreadcrumbs: React.FC<ApplicationSummaryBreadcrumbsProps> = ({
    applicationType,
    applicationId,
}) => {
    useBreadcrumb(
        <Link to="/application-dashboard" className="govuk-back-link">
            Back
        </Link>
    );
    return null;
};
