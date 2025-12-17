import React from 'react';
import { useLocation } from 'react-router-dom';
import { useManageUsersNavigation } from '../../hooks';

const AccessRevokedPage: React.FC = () => {
  const location = useLocation();
  const { navigateToDashboard, navigateToAddUser } = useManageUsersNavigation();

  const state = location.state as { userName?: string; userEmail?: string } | null;
  const userName = state?.userName || 'the user';
  const userEmail = state?.userEmail || '';

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">

        {/* TRUE PAGE HEADING for accessibility */}
        <h1 className="govuk-visually-hidden">Access revoked successfully</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* CONFIRMATION PANEL - Red for revocation */}
            {/* TODO: Replace inline style with custom CSS class or GOV.UK modifier */}
        <div className="govuk-panel govuk-panel--confirmation" style={{ backgroundColor: '#d4351c' }}>
              <h2 className="govuk-panel__title">
                Access revoked
              </h2>
              <div className="govuk-panel__body">
                {userName}'s access has been revoked
                {userEmail && (
                  <>
                    <br />
                    <strong>{userEmail}</strong>
                  </>
                )}
              </div>
            </div>

            {/* WHAT HAPPENS NEXT */}
            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              {userName} will no longer be able to access the service. They will receive an email notification informing them that their access has been revoked.
            </p>

            <p className="govuk-body">
              The user will appear as inactive in your users list. If needed, you can reactivate their access later from the manage users page.
            </p>

            <div className="govuk-inset-text">
              <strong>Note:</strong> If this user needs access again in the future, they will need to submit a new access request or you can manually reactivate their account.
            </div>

            {/* ACTIONS */}
            <div className="govuk-button-group">
              <a
                className="govuk-link govuk-link--no-visited-state"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToDashboard();
                }}
              >
                Return to dashboard
              </a>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="govuk-grid-column-one-third">
            <aside className="app-related-items" role="complementary">
              <h2 className="govuk-heading-s" id="related-content-title">
                Related actions
              </h2>

              <nav role="navigation" aria-labelledby="related-content-title">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToDashboard();
                      }}
                    >
                      View dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToAddUser();
                      }}
                    >
                      Add a new user
                    </a>
                  </li>
                  <li><a href="#" className="govuk-link">User management policy</a></li>
                  <li><a href="#" className="govuk-link">Contact support</a></li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AccessRevokedPage;
