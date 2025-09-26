import { Link } from 'react-router-dom';
import { CONTENT } from '../constants/content';

// For Network Operator Details
export const NetworkOperatorBreadcrumbs = ({ applicationId }: { applicationId?: string }) => (
  <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
    <ol className="govuk-breadcrumbs__list">
      <li className="govuk-breadcrumbs__list-item" aria-current="false">
        <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${applicationId || ''}`}>
        {CONTENT.networkOperator.breadcrumb.taskList}
        </Link>
      </li>
      <li className="govuk-breadcrumbs__list-item" aria-current="true">{CONTENT.networkOperator.heading}</li>
    </ol>
  </nav>
);


// For Network Operator Contact Details
export const NetworkOperatorContactBreadcrumbs = ({ applicationId }: { applicationId?: string }) => (
  <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
    <ol className="govuk-breadcrumbs__list">
      <li className="govuk-breadcrumbs__list-item" aria-current="false">
        <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${applicationId || ''}`}>
          {CONTENT.networkOperatorContact.breadcrumb.taskList}
        </Link>
      </li>
      <li className="govuk-breadcrumbs__list-item" aria-current="true">
        {CONTENT.networkOperatorContact.breadcrumb.current}
      </li>
    </ol>
  </nav>
);
