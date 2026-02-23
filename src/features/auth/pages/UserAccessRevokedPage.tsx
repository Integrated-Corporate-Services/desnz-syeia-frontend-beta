import React from 'react';

/**
 * Page shown to users whose access has been revoked (status = INACTIVE)
 * This is different from AccessRevokedPage which is shown to admins after they revoke someone's access
 */
const UserAccessRevokedPage: React.FC = () => {
  const handleSignOut = () => {
    window.location.href = '/backend/auth/logout';
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {/* Red warning panel */}
            <div 
              className="govuk-panel" 
              style={{ 
                backgroundColor: '#d4351c', 
                color: '#ffffff',
                border: '2px solid #d4351c'
              }}
            >
              <h1 className="govuk-panel__title" style={{ color: '#ffffff' }}>
                Access revoked
              </h1>
              <div className="govuk-panel__body" style={{ color: '#ffffff' }}>
                Your access to this service has been revoked
              </div>
            </div>

            <h2 className="govuk-heading-m">What this means</h2>

            <p className="govuk-body">
              Your access to the Submit your Energy Infrastructure Application service has been revoked by a team member.
            </p>

            <p className="govuk-body">
              You can no longer sign in or use the service until your access is reinstated.
            </p>

            <h2 className="govuk-heading-m">What you need to do</h2>

            <p className="govuk-body">
              If you believe this is a mistake or you need to reinstate your access, please contact your team coordinator or the person who manages access for your organisation.
            </p>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">Warning</span>
                You have been automatically signed out for security purposes.
              </strong>
            </div>

            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={handleSignOut}
              data-module="govuk-button"
            >
              Return to sign in page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAccessRevokedPage;
