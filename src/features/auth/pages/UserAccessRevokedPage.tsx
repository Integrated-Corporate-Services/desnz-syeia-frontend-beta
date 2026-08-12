import React, { useEffect } from 'react';
import { buildBackendUrl } from '../../../utils/apiConfig';
/**
 * Page shown to users whose access has been revoked (status = INACTIVE)
 * This is different from AccessRevokedPage which is shown to admins after they revoke someone's access
 * 
 * Design: Follows GDS standards with MainLayout (header, service navigation, beta banner, footer)
 */
const UserAccessRevokedPage: React.FC = () => {
    const handleSignOut = () => {
    window.location.href = buildBackendUrl('/auth/logout');
  };
  useEffect(() => {
    document.title = 'You do not have access to this service - GOV.UK';
  }, []);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">You do not have access to this service</h1>
        
        <p className="govuk-body">
          Your access to the SYEIA service has been revoked.
        </p>

        <p className="govuk-body">
          Please contact your organisation's team coordinator to reinstate your access.
        </p>

        <div className="govuk-inset-text">
          If you do not know who the team coordinator is then contact our service desk at{' '}
          <a href="mailto:SYEIA.enquiries@energysecurity.gov.uk" className="govuk-link">
            SYEIA.enquiries@energysecurity.gov.uk
          </a>.
        </div>
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

  );
};
export default UserAccessRevokedPage;

