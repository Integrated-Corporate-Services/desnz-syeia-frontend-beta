import React from "react";
import { Link } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";

interface ApplicationDetailsBreadcrumbsProps {
  appId: string;
  taskListLabel?: string;
  currentPageLabel?: string;
}

/**
 * Reusable breadcrumbs component for Application Details pages
 */
const ApplicationDetailsBreadcrumbs: React.FC<ApplicationDetailsBreadcrumbsProps> = ({
  appId,
  taskListLabel = "Task list",
  currentPageLabel = "Application details",
}) => {
  return (
    <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
      <ol className="govuk-breadcrumbs__list">
        <li className="govuk-breadcrumbs__list-item" aria-current="false">
          <Link
            className="govuk-breadcrumbs__link"
            to={`${NWL_BASE_URL}/${appId}/task-list`}
          >
            {taskListLabel}
          </Link>
        </li>
        <li className="govuk-breadcrumbs__list-item" aria-current="true">
          {currentPageLabel}
        </li>
      </ol>
    </nav>
  );
};

export default ApplicationDetailsBreadcrumbs;
