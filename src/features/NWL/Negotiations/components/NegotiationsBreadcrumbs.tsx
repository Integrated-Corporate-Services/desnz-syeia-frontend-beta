import React from 'react';
import { Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { BREADCRUMBS } from '../constants/negotiationsConstants';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';

interface NegotiationsBreadcrumbsProps {
  appId: string | undefined;
}

export const NegotiationsBreadcrumbs: React.FC<NegotiationsBreadcrumbsProps> = ({ appId }) => {
  useBreadcrumb(
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
          {BREADCRUMBS.NEGOTIATIONS}
        </li>
      </ol>
    </nav>
  );
  return null;
};
