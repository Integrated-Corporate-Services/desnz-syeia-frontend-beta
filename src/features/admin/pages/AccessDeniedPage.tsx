import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessConfirmationNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';

const AccessDeniedPage: React.FC = () => {
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
      <PageTitle title="Access rejected" />
            <div className="govuk-width-container">
              {/* GREEN CONFIRMATION PANEL - Access Rejected */}
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">
            Access rejected
          </h1>
          <div className="govuk-panel__body">
            {userName} has been notified<br/>
            <strong>{userEmail}</strong>
          </div>
        </div>

        {/* WHAT HAPPENS NEXT SECTION */}
        <h2 className="govuk-heading-m">What happens next</h2>

        <p className="govuk-body">
          We have sent an email to {userName} to let them know their access request has been denied.
        </p>

        <p className="govuk-body">
          They can contact you directly or submit a new request if they believe this decision was made in error.
        </p>

        {/* WHAT HAPPENS NEXT SECTION */}
        <h2 className="govuk-heading-m">What happens next</h2>

        {/* REJECTION REASON SECTION */}
        <div className="govuk-inset-text">
          <p className="govuk-body">
            Rejected
          </p>
        </div>
        <p className="govuk-body">
            This reason has been included in the email sent to the applicant.
        </p>
        <p className="govuk-body">
          If {userName} believes the decision is incorrect, they can contact you directly or submit a new request.
        </p>
        {/* RETURN BUTTON */}
        <button
          type="button"
          className="govuk-button"
          onClick={handleReturnToDashboard}
          data-module="govuk-button"
        >
          Return to dashboard
        </button>
          </div>
    </>
  );
};

export default AccessDeniedPage;