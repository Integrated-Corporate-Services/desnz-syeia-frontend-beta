import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessConfirmationNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import type { UserDetails } from '../../../types/userDetails';
import { ACCESS_DENIED_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

const AccessDeniedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard, navigateToPendingRequests } = useAccessConfirmationNavigation();

  const state = location.state as Partial<UserDetails> | null;
  const userName = state?.userName || ACCESS_DENIED_CONSTANTS.DEFAULT_USER_NAME;
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
      {ADMIN_COMMON_CONSTANTS.BACK}
    </a>
  );

  return (
    <>
      <PageTitle title={ACCESS_DENIED_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
              {/* GREEN CONFIRMATION PANEL - Access Rejected */}
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">
            {ACCESS_DENIED_CONSTANTS.TITLE}
          </h1>
          <div className="govuk-panel__body">
            {ACCESS_DENIED_CONSTANTS.PANEL_BODY(userName)}<br/>
            <strong>{userEmail}</strong>
          </div>
        </div>

        {/* WHAT HAPPENS NEXT SECTION */}
        <h2 className="govuk-heading-m">{ACCESS_DENIED_CONSTANTS.WHAT_HAPPENS_NEXT}</h2>

        <p className="govuk-body">
          {ACCESS_DENIED_CONSTANTS.EMAIL_SENT}
          {rejectionReason ? ACCESS_DENIED_CONSTANTS.WITH_REASON_SUFFIX : ACCESS_DENIED_CONSTANTS.WITHOUT_REASON_SUFFIX}
        </p>

        {rejectionReason && (
          <p className="govuk-body" style={{ whiteSpace: 'pre-line' }}>{rejectionReason}</p>
        )}

        <p className="govuk-body">
          {ACCESS_DENIED_CONSTANTS.CONTACT_INFO}
        </p>

        {/* RETURN BUTTON */}
        <button
          type="button"
          className="govuk-button"
          onClick={handleReturnToDashboard}
          data-module="govuk-button"
        >
          {ADMIN_COMMON_CONSTANTS.RETURN_TO_DASHBOARD}
        </button>
          </div>
    </>
  );
};

export default AccessDeniedPage;