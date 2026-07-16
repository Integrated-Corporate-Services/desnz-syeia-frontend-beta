import React from 'react';
import { buildBackendUrl } from '../utils/apiConfig';

const SignedOutPage: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const reason = searchParams.get('reason');

  const reasonMessageMap: Record<string, string> = {
    SESSION_TIMEOUT: 'For your security, we signed you out because you were inactive for 30 minutes.',
    SESSION_ABSOLUTE_TIMEOUT: 'For your security, we signed you out because your session reached the maximum duration.',
    SESSION_EVICTED: 'You were signed out because you signed in on another device.',
    SESSION_GLOBAL_LOGOUT: 'You have been signed out from all devices.',
    SESSION_BACKCHANNEL_LOGOUT: 'Your GOV.UK One Login session ended, so you have been signed out.',
  };

  const reasonMessage = reason ? reasonMessageMap[reason] : undefined;

  const handleSignIn = () => {
    window.location.href = buildBackendUrl('/auth/login');
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">You have been signed out</h1>
            
            <p className="govuk-body-l">
              {reasonMessage || 'For your security, we signed you out because you were inactive for 30 minutes.'}
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