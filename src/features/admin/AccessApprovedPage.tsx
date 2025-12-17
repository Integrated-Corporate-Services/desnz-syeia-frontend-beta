import React from 'react';
import { useAccessConfirmationNavigation } from '../../hooks';

const AccessApprovedPage: React.FC = () => {
  const { navigateToPendingRequests, navigateToDashboard } = useAccessConfirmationNavigation();

  const handleViewPendingRequests = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToPendingRequests();
  };

  const handleReturnToDashboard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToDashboard();
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">
            Access request approved
          </h1>
          <div className="govuk-panel__body">
            The applicant will receive an email confirmation
          </div>
        </div>

        <h2 className="govuk-heading-m">What happens next</h2>

        <p className="govuk-body">
          The applicant will receive an email with their login credentials and instructions to access the system.
        </p>

        <p className="govuk-body">
          You can track this approval in the system's audit log.
        </p>

        <h3 className="govuk-heading-s">Next steps</h3>

        <ul className="govuk-list govuk-list--bullet">
          <li>The applicant will be added to the system</li>
          <li>They will receive their access credentials by email</li>
          <li>Their account will be linked to their organisation</li>
        </ul>

        <p className="govuk-body govuk-!-margin-top-6">
          <a
            href="#"
            className="govuk-link govuk-link--no-visited-state"
            onClick={handleViewPendingRequests}
          >
            View pending requests
          </a>
        </p>

        <p className="govuk-body">
          <a
            href="#"
            className="govuk-link"
            onClick={handleReturnToDashboard}
          >
            Return to dashboard
          </a>
        </p>
      </main>
    </div>
  );
};

export default AccessApprovedPage;
