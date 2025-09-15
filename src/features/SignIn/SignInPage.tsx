import React from 'react';

const SignInPage: React.FC = () => {
  const handleSignIn = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Submit your Energy Infrastructure Application
          </h1>
          <aside role="complementary">
            <nav aria-label="Pages in this guide" role="navigation">
              <h2>Contents</h2>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li style={{ marginBottom: '0.5em' }}>
                  <span style={{ marginRight: 8 }}>—</span>
                  <a href="overview.html" style={{ textDecoration: 'underline', color: '#1d70b8' }}>Overview</a>
                </li>
                <li style={{ marginBottom: '0.5em' }}>
                  <span style={{ marginRight: 8 }}>—</span>
                  Section 37 applications
                </li>
                <li style={{ marginBottom: '0.5em' }}>
                  <span style={{ marginRight: 8 }}>—</span>
                  <a href="necessary-wayleave-applications.html" style={{ textDecoration: 'underline', color: '#4c2c92' }}>Necessary Wayleave applications</a>
                </li>
                <li style={{ marginBottom: '0.5em' }}>
                  <span style={{ marginRight: 8 }}>—</span>
                  <a href="treelopping-applications.html" style={{ textDecoration: 'underline', color: '#1d70b8' }}>Treelopping applications</a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <hr style={{ margin: '2rem 0' }} />
          <h2 className="govuk-heading-l">Section 37 applications</h2>
          <p>
            Apply for consent under Section 37 of the Electricity Act 1989 to install or change overhead electric lines. This includes applications for new lines or alterations to existing lines.
          </p>
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
