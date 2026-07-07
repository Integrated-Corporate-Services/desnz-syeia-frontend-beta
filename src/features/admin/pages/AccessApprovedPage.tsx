import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessConfirmationNavigation } from '../../../hooks';
import SkipLink from '../../../components/SkipLink';

const AccessApprovedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard } = useAccessConfirmationNavigation();

  const state = location.state as { userName?: string; userEmail?: string } | null;
  const userName = state?.userName || 'the applicant';
  const userEmail = state?.userEmail || '';

  const handleReturnToDashboard = () => {
    navigateToDashboard();
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">
            Access granted
          </h1>
          <div className="govuk-panel__body">
            {userName} can now sign in and use the service<br/>
            <strong>{userEmail}</strong>
          </div>
        </div>

        <h2 className="govuk-heading-m">What happens next</h2>

        <p className="govuk-body">
          We have sent an email to {userName} to let them know their access request has been approved.
        </p>

        <p className="govuk-body">
          They can now sign in to the service using their GOV.UK One Login account.
        </p>

        <div className="govuk-inset-text">
          <p className="govuk-body">
            The user will appear in your active users list and can start using the service immediately.
          </p>
        </div>

        <button
          type="button"
          className="govuk-button"
          onClick={handleReturnToDashboard}
          data-module="govuk-button"
        >
          Return to dashboard
        </button>
      </main>
    </div>
    </>
  );
};

export default AccessApprovedPage;