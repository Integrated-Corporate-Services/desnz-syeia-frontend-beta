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
              For your security, we signed you out because you were inactive for 30 minutes.
            </p>
            
            <p className="govuk-body">
              Any information you entered that was not saved may be lost.
            </p>
            
            <h2 className="govuk-heading-m">What happens next</h2>
            
            <p className="govuk-body">
              You can sign in again to continue your application.
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
            
           
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignedOutPage;