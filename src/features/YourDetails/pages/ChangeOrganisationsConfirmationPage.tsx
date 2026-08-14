import React from 'react';
import { Link } from 'react-router-dom';

const ChangeOrganisationsConfirmationPage: React.FC = () => {
  return (
    <>
            <div className="govuk-width-container">
              <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-8">
          <h1 className="govuk-panel__title">Your changes have been saved</h1>
        </div>

        <h2 className="govuk-heading-m">What happens next</h2>
        <p className="govuk-body">
          The team coordinators of newly selected organisations must approve your access request
          before you can view and submit applications for them. We will email you when your request
          has been reviewed.
        </p>

        <h2 className="govuk-heading-m">If you need help</h2>
        <p className="govuk-body">
          If you have any questions about your request, contact the team coordinator of either your
          organisation or the organisation you have requested access to.
        </p>

        <p className="govuk-body">
          <Link className="govuk-link" to="/application-dashboard">
            Return to dashboard
          </Link>
        </p>
          </div>
    </>
  );
};

export default ChangeOrganisationsConfirmationPage;
