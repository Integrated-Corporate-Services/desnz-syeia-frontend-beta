import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessConfirmationNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { ACCESS_APPROVED_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

const AccessApprovedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard, navigateToPendingRequests } = useAccessConfirmationNavigation();

  const state = location.state as { userName?: string; userEmail?: string } | null;
  const userName = state?.userName || ACCESS_APPROVED_CONSTANTS.DEFAULT_USER_NAME;
  const userEmail = state?.userEmail || '';

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

  const handleReturnToDashboard = () => {
    navigateToDashboard();
  };

  return (
    <>
      <PageTitle title={ACCESS_APPROVED_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
              <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title">
            {ACCESS_APPROVED_CONSTANTS.TITLE}
          </h1>
          <div className="govuk-panel__body">
            {ACCESS_APPROVED_CONSTANTS.PANEL_BODY(userName)}<br/>
            <strong>{userEmail}</strong>
          </div>
        </div>

        <h2 className="govuk-heading-m">{ACCESS_APPROVED_CONSTANTS.WHAT_HAPPENS_NEXT}</h2>

        <p className="govuk-body">
          {ACCESS_APPROVED_CONSTANTS.EMAIL_SENT(userName)}
        </p>

        <p className="govuk-body">
          {ACCESS_APPROVED_CONSTANTS.SIGN_IN_INFO}
        </p>

        <div className="govuk-inset-text">
          <p className="govuk-body">
            {ACCESS_APPROVED_CONSTANTS.ACTIVE_USERS_INFO}
          </p>
        </div>

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

export default AccessApprovedPage;