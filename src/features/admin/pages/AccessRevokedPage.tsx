import React from 'react';
import { useLocation } from 'react-router-dom';
import { useManageUsersNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { ACCESS_REVOKED_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

const AccessRevokedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard } = useManageUsersNavigation();

  useBreadcrumb(
    <a
      href="#"
      className="govuk-back-link"
      onClick={(e) => {
        e.preventDefault();
        navigateToDashboard();
      }}
    >
      {ADMIN_COMMON_CONSTANTS.BACK}
    </a>
  );

  const state = location.state as { userName?: string; userEmail?: string } | null;
  const userName = state?.userName || ACCESS_REVOKED_CONSTANTS.DEFAULT_USER_NAME;
  const userEmail = state?.userEmail || '';

  return (
    <>
      <PageTitle title={ACCESS_REVOKED_CONSTANTS.TITLE} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">{ACCESS_REVOKED_CONSTANTS.TITLE}</h1>
              <div className="govuk-panel__body">
                {ACCESS_REVOKED_CONSTANTS.PANEL_BODY(userName)}
                {userEmail && (
                  <>
                    <br />
                    <strong className="govuk-!-text-break-word">{userEmail}</strong>
                  </>
                )}
              </div>
            </div>

            <h2 className="govuk-heading-m">{ACCESS_REVOKED_CONSTANTS.WHAT_HAPPENS_NEXT}</h2>
            <p className="govuk-body">{ACCESS_REVOKED_CONSTANTS.NOTIFIED}</p>
            <p className="govuk-body">{ACCESS_REVOKED_CONSTANTS.REINSTATE}</p>

            <button
              type="button"
              className="govuk-button"
              onClick={(e) => {
                e.preventDefault();
                navigateToDashboard();
              }}
            >
              {ADMIN_COMMON_CONSTANTS.RETURN_TO_DASHBOARD}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessRevokedPage;
