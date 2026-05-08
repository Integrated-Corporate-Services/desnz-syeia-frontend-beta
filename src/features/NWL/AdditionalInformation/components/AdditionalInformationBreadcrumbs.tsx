import React from 'react';
import { Link } from 'react-router-dom';
import { CONTENT } from '../constants';
import { NWL_BASE_URL } from '../../../../constants/nwl';

interface AdditionalInformationBreadcrumbsProps {
  appId: string | undefined;
  currentPage?: string;
}

/**
 * Breadcrumbs component for Additional Information section
 */
export const AdditionalInformationBreadcrumbs: React.FC<
  AdditionalInformationBreadcrumbsProps
> = ({ appId, currentPage }) => {
  return (
    <div className="govuk-breadcrumbs">
      <ol className="govuk-breadcrumbs__list">
        {appId && (
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {CONTENT.BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
        )}
        {currentPage && (
          <li className="govuk-breadcrumbs__list-item">
            <span className="govuk-breadcrumbs__link">{currentPage}</span>
          </li>
        )}
      </ol>
    </div>
  );
};
