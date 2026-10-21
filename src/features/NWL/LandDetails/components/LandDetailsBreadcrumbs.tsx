import React from 'react';
import { Link } from 'react-router-dom';
import { buildLandDetailsRoute, LAND_DETAILS_ROUTES } from '../constants';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';

type LandDetailsBreadcrumbsProps = {
  applicationId: string;
  currentPage: string;
};

const LandDetailsBreadcrumbs: React.FC<LandDetailsBreadcrumbsProps> = ({ applicationId, currentPage }) => {
  useBreadcrumb(
    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item">
          <Link
            className="govuk-breadcrumbs__link"
            to={buildLandDetailsRoute(LAND_DETAILS_ROUTES.TASK_LIST, applicationId)}
          >
            Task list
          </Link>
        </li>
        <li className="govuk-breadcrumbs__list-item">
          <span className="govuk-breadcrumbs__link">Land details</span>
        </li>

      </ol>
    </nav>
  );
  return null;
};

export default LandDetailsBreadcrumbs;
