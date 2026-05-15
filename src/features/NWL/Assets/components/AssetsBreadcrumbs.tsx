import React from 'react';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { BREADCRUMBS } from '../constants';

interface AssetsBreadcrumbsProps {
  applicationId: string;
  currentPage?: 'add' | 'review';
}

export const AssetsBreadcrumbs: React.FC<AssetsBreadcrumbsProps> = ({
  applicationId,
  currentPage = 'add',
}) => {
  return (
    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item">
          <Link
            className="govuk-breadcrumbs__link"
            to={`${NWL_BASE_URL}/${applicationId}/task-list`}
          >
            {BREADCRUMBS.TASK_LIST}
          </Link>
        </li>
        {currentPage === 'review' && (
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${applicationId}/information-about-lines`}
            >
              {BREADCRUMBS.INFORMATION_ABOUT_LINES}
            </Link>
          </li>
        )}
        <li className="govuk-breadcrumbs__list-item" aria-current="page">
          {currentPage === 'review' 
            ? BREADCRUMBS.REVIEW_ASSETS 
            : BREADCRUMBS.INFORMATION_ABOUT_LINES}
        </li>
      </ol>
    </nav>
  );
};
