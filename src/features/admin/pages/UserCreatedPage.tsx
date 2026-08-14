import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAddUserNavigation } from '../../../hooks';

const UserCreatedPage: React.FC = () => {
  const location = useLocation();
  const {
    navigateToDashboard,
    navigateToManageUsers,
    navigateToAddUser
  } = useAddUserNavigation();

  const state = location.state as { userName?: string; userEmail?: string; organisation?: string; welcomeEmailSent?: boolean } | null;
  const userName = state?.userName || 'the user';
  const userEmail = state?.userEmail || '';
  const organisation = state?.organisation || '';
  const welcomeEmailSent = state?.welcomeEmailSent;

  return (
    <>
            <div className="govuk-width-container">
      
        {/* TRUE PAGE HEADING for accessibility */}
        <h1 className="govuk-visually-hidden">User created successfully</h1>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* CONFIRMATION PANEL */}
            <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6">
              <h2 className="govuk-panel__title">
                User created successfully
              </h2>
              <div className="govuk-panel__body">
                {userName} has been added and can now access the service
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

            {welcomeEmailSent ? (
              <p className="govuk-body">
                We have sent an email to {userName} with sign-in instructions for the service.
              </p>
            ) : (
              <p className="govuk-body">
                {userName} has been created but no welcome email was sent. You will need to provide them with sign-in instructions manually.
              </p>
            )}

            <p className="govuk-body">
              They can now sign in using their GOV.UK One Login account and will have immediate access to the service.
            </p>

            <div className="govuk-inset-text">
              The user will appear in your active users list for {organisation} and can start using the service immediately.
              {!welcomeEmailSent && (
                <>
                  <br /><br />
                  <strong>Note:</strong> Remember to provide sign-in instructions to {userName} as no welcome email was sent.
                </>
              )}
            </div>

            {/* ACTIONS */}
            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button"
                onClick={navigateToManageUsers}
              >
                View all users
              </button>

              <a
                className="govuk-link"
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
                What you can do next
              </h2>

              <nav role="navigation" aria-labelledby="related-content-title">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <a
                      href="#"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToManageUsers();
                      }}
                    >
                      Manage all users
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
                      Add another user
                    </a>
                  </li>
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
                  <li><a href="#" className="govuk-link">User management guide</a></li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>

          </div>
    </>
  );
};

export default UserCreatedPage;
