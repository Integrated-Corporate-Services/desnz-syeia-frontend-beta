/**
 * Breadcrumb navigation for the NWL Application Summary page.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface ApplicationSummaryBreadcrumbsProps {
    applicationId: string;
}

export const ApplicationSummaryBreadcrumbs: React.FC<ApplicationSummaryBreadcrumbsProps> = ({ applicationId }) => {
    return (
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${applicationId}/task-list`}>
                        {CONSTANTS.BREADCRUMBS.TASK_LIST}
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">
                    {CONSTANTS.BREADCRUMBS.APPLICATION_SUMMARY}
                </li>
            </ol>
        </nav>
    );
};
