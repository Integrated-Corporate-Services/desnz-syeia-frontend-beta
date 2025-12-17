import React from 'react';
import { useAccessConfirmationNavigation } from '../../hooks';

const AccessDeniedPage: React.FC = () => {
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
        {/* TODO: Replace inline style with custom CSS class or GOV.UK modifier */}
        <div className="govuk-panel govuk-panel--confirmation" style={{ backgroundColor: '#d4351c' }}>
          <h1 className="govuk-panel__title">
            Access request rejected
          </h1>
          <div className="govuk-panel__body">
            The applicant will receive an email notification
          </div>
        </div>

        <h2 className="govuk-heading-m">What happens next</h2>

        <p className="govuk-body">
          The applicant will receive an email explaining why their request was rejected, including the reason you provided.
        </p>

        <p className="govuk-body">
          If they believe this decision was made in error, they can submit a new request or contact the support team.
        </p>

        <h3 className="govuk-heading-s">What we've done</h3>

        <ul className="govuk-list govuk-list--bullet">
          <li>The applicant has been notified by email</li>
          <li>The rejection reason has been recorded</li>
          <li>This action has been logged in the audit trail</li>
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

export default AccessDeniedPage;
