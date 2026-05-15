/**
 * Check Your Answers Breadcrumbs Component
 * Displays breadcrumb navigation for Check Your Answers page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CONSTANTS } from '../constants';

interface CheckYourAnswersBreadcrumbsProps {
    applicationId: string;
}

export const CheckYourAnswersBreadcrumbs: React.FC<CheckYourAnswersBreadcrumbsProps> = ({ applicationId }) => {
    return (
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${applicationId}/task-list`}>
                        {CONSTANTS.BREADCRUMBS.TASK_LIST}
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">
                    {CONSTANTS.BREADCRUMBS.CHECK_YOUR_ANSWERS}
                </li>
            </ol>
        </nav>
    );
};
