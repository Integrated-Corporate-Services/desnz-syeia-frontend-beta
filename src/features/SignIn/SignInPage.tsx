import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const handleSignIn = () => {
    // const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL || 'https://eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com/backend/auth/login';
    // window.location.href = loginUrl;
    navigate('/workbasket');
  };
  const handleNWLSignIn = () => {
  // const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL_NWL || 'https://eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com/backend/auth/login-nwl';
  // window.location.href = loginUrl;
  navigate('/nwl/who-is-applying');
  }
  const handleTLPSignIn = () => {
    // const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL_TLP || 'https://eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com/backend/auth/login-tlp';
    // window.location.href = loginUrl;
    navigate('/tlp/who-is-applying');
  };

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Submit your Energy Infrastructure Application
          </h1>
        </div>
      </div>

            <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <hr style={{ margin: '2rem 0' }} />
          <h2 className="govuk-heading-l">Tree Lopping and Felling</h2>
          <button
            onClick={handleTLPSignIn}
            className="govuk-button govuk-button--start"
            data-module="govuk-button"
            data-govuk-button-init=""
            style={{ marginTop: '2rem' }}
          >
            Start now
            <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <hr style={{ margin: '2rem 0' }} />
          <h2 className="govuk-heading-l">Apply for a Necessary Wayleave</h2>
          <button
            onClick={handleNWLSignIn}
            className="govuk-button govuk-button--start"
            data-module="govuk-button"
            data-govuk-button-init=""
            style={{ marginTop: '2rem' }}
          >
            Start now
            <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <hr style={{ margin: '2rem 0' }} />
          <h2 className="govuk-heading-l">Section 37 applications</h2>
          <label className="govuk-label">
            Apply for consent under Section 37 of the Electricity Act 1989 to install or change overhead electric lines. This includes applications for new lines or alterations to existing lines.
          </label>
          <button
            onClick={handleSignIn}
            className="govuk-button govuk-button--start"
            data-module="govuk-button"
            data-govuk-button-init=""
            style={{ marginTop: '2rem' }}
          >
            Start now
            <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
