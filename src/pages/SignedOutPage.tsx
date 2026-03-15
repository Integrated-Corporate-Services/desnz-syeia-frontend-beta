import React from 'react';

const SignedOutPage: React.FC = () => {
  const handleSignIn = () => {
    window.location.href = '/backend/auth/login';
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">You have been signed out</h1>
            
            <p className="govuk-body-l">
              For your security, we signed you out because you were inactive for a while.
            </p>
            
            <p className="govuk-body">
              Any information you entered that was not saved may have been lost.
            </p>
            
            <h2 className="govuk-heading-m">What happens next</h2>
            
            <p className="govuk-body">
              You can sign in again to continue with your application or consultation.
            </p>
            
            <p className="govuk-body">
              <button 
                onClick={handleSignIn}
                className="govuk-button"
                data-module="govuk-button"
                type="button"
              >
                Sign in again
              </button>
            </p>
            
            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Why were you signed out?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p>We signed you out automatically for your security because you were inactive for 30 minutes.</p>
                <p>This helps protect your personal information if you forget to sign out or leave your device unattended.</p>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignedOutPage;