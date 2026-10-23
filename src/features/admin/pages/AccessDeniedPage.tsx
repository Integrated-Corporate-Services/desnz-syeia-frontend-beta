import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessConfirmationNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { useIsSuperUser } from '../../../hooks/useIsSuperUser';
import type { UserDetails } from '../../../types/userDetails';

const AccessDeniedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard, navigateToPendingRequests } = useAccessConfirmationNavigation();
  const isSuperUser = useIsSuperUser();

  const state = location.state as Partial<UserDetails> | null;
  const userName = state?.userName || 'the applicant';
  const userEmail = state?.userEmail || '';
  const rejectionReason = state?.rejectionReason || '';

  const handleReturnToDashboard = () => {
    navigateToDashboard();
  };

  useBreadcrumb(
    <a
      href="#"
      className="govuk-back-link"
      onClick={(e) => {
        e.preventDefault();
        navigateToPendingRequests();
      }}
    >
      Back
    </a>
  );

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

        {isSuperUser ? (
          <>
            <p className="govuk-body">
              We have sent an email to the user to let them know their access request has been rejected
              {rejectionReason ? ' for this reason:' : '.'}
            </p>

            {rejectionReason && (
              <p className="govuk-body" style={{ whiteSpace: 'pre-line' }}>{rejectionReason}</p>
            )}

            <p className="govuk-body">
              If they believe the decision is incorrect, they can contact you directly or submit a new request.
            </p>
          </>
        ) : (
          <>
            {rejectionReason && (
              <>
                <p className="govuk-body" style={{ whiteSpace: 'pre-line' }}>{rejectionReason}</p>
                <p className="govuk-body">
                  This reason has been included in the email sent to the applicant.
                </p>
              </>
            )}

            <p className="govuk-body">
              If {userName} believes the decision is incorrect, they can contact you directly or submit a new request.
            </p>
          </>
        )}

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