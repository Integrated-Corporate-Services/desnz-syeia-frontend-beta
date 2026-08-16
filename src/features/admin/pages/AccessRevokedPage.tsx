import React from 'react';
import { useLocation } from 'react-router-dom';
import { useManageUsersNavigation } from '../../../hooks';
import PageTitle from '../../../components/PageTitle';

const AccessRevokedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard } = useManageUsersNavigation();

  const state = location.state as { userName?: string; userEmail?: string } | null;
  const userName = state?.userName || 'the user';
  const userEmail = state?.userEmail || '';

  return (
    <>
      <PageTitle title="Access revoked" />
            <div className="govuk-width-container">
              <a
          href="#"
          className="govuk-back-link"
          onClick={(e) => {
            e.preventDefault();
            navigateToDashboard();
          }}
        >
          Back
        </a>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel" style={{ backgroundColor: '#00703c', color: '#ffffff' }}>
              <h1 className="govuk-panel__title" style={{ color: '#ffffff' }}>
                Access revoked
              </h1>
              <div className="govuk-panel__body" style={{ color: '#ffffff' }}>
                {userName} can no longer sign in and use the service
                {userEmail && (
                  <>
                    <br />
                    <strong style={{ color: '#ffffff' }}>{userEmail}</strong>
                  </>
                )}
              </div>
            </div>

            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              The user has been notified by email that their access has been revoked. They will no longer be able to sign in to the service.
            </p>

            <p className="govuk-body">
              If their access needs to be restored in the future, you or another can reinstate their account from the Manage users section.
            </p>

            <button
              type="button"
              className="govuk-button"
              onClick={(e) => {
                e.preventDefault();
                navigateToDashboard();
              }}
              style={{ backgroundColor: '#00703c', boxShadow: '0 2px 0 #002d18' }}
            >
              Return to dashboard
            </button>
          </div>
        </div>
          </div>
    </>
  );
};

export default AccessRevokedPage;
