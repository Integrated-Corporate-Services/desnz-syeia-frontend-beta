import React from 'react';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface TaskListSummaryBreadcrumbsProps {
    applicationId: string;
}

export const TaskListSummaryBreadcrumbs: React.FC<TaskListSummaryBreadcrumbsProps> = ({ applicationId }) => {
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
