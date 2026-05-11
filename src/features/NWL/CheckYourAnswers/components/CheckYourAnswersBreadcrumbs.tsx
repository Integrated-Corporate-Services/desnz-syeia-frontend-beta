import React from 'react';
import { BREADCRUMBS } from '../constants/checkYourAnswersConstants';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';

interface CheckYourAnswersBreadcrumbsProps {
  appId: string;
}

/**
 * Breadcrumbs component for Check Your Answers page
 */
export const CheckYourAnswersBreadcrumbs: React.FC<CheckYourAnswersBreadcrumbsProps> = ({
  appId,
}) => {
  return (
    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item" aria-current="false">
          <Link
            className="govuk-breadcrumbs__link"
            to={`${NWL_BASE_URL}/${appId}/task-list`}
          >
            {BREADCRUMBS.TASK_LIST}
          </Link>
        </li>
        <li className="govuk-breadcrumbs__list-item" aria-current="true">
          {BREADCRUMBS.CHECK_YOUR_ANSWERS}
        </li>
      </ol>
    </nav>
  );
};
