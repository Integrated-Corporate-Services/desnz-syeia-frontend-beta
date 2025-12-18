import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="govuk-width-container">
      <style>{`
        .govuk-link,
        .govuk-link:visited,
        .govuk-link:active,
        .govuk-link:hover,
        .govuk-link:focus {
          color: #1d70b8 !important;
          text-decoration: underline;
        }
      `}</style>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l" style={{ maxWidth: '520px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
              Submit your Energy Infrastructure Application
            </h1>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <section id="overview">
              <h2 className="govuk-heading-m">Overview</h2>
              <p className="govuk-body">
                Use the service to apply for energy infrastructure consents under the Electricity Act 1989.
              </p>
              <p className="govuk-body">
                This service is for electricity distribution network operators (DNOs) and other energy infrastructure applicants.
              </p>
              <p className="govuk-body">
                These are the different application types, linked to specific guidance for each:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><a className="govuk-link" href="/frontend/s37-guidance">Overhead lines (Section 37)</a></li>
                <li><a className="govuk-link" href="#">Necessary wayleaves</a></li>
                <li><a className="govuk-link" href="#">Tree felling or lopping</a></li>
              </ul>
              <p className="govuk-body">
                Your application must meet the requirements of the <a className="govuk-link" href="#">Electricity Act 1989 (opens in a new tab)</a> and include all required documents and the correct fee.
              </p>
            </section>

            <section id="fees" style={{ marginTop: '40px' }}>
              <h2 className="govuk-heading-m">Fees</h2>
              <p className="govuk-body">
                You will need to pay a fee to submit your application. We cannot start processing your application until payment is made.
              </p>
              <p className="govuk-body">
                Paying by card is the fastest way to pay and helps avoid delays. Paying by bank transfer is a much slower process as it takes more time to match your payment to your application.
              </p>
              <p className="govuk-body">
                There are two different fee structures:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><a className="govuk-link" href="#">Overhead lines (Section 37) (opens in a new tab)</a></li>
                <li><a className="govuk-link" href="#">Necessary wayleaves and tree felling or lopping (opens in a new tab)</a></li>
              </ul>
            </section>

            <section id="signin" style={{ marginTop: '40px' }}>
              <h2 className="govuk-heading-m">Sign in to submit your application</h2>
              <p className="govuk-body">
                You’ll need to sign in to use this service. If you do not already have sign in details, you’ll be able to create them.
              </p>
              <button
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                onClick={() => {
                  const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL || 'https://eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com/backend/auth/login';
                  window.location.href = loginUrl;
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Sign in
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true" focusable="false" style={{ marginLeft: '4px' }}>
                  <path d="M6 13l5-4.5L6 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <p className="govuk-body">
                <a className="govuk-link" href="#">View a printable version of the whole guide</a>
              </p>
            </section>
          </div>
          <div className="govuk-grid-column-one-third">
            <aside className="app-related-items" role="complementary">
              <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '0 0 16px 0' }} />
              <h2 className="govuk-heading-s" id="related-content-title">Related content</h2>
              <nav role="navigation" aria-labelledby="related-content-title">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <a href="#" className="govuk-link">
                      The statutory consents regime for overhead power lines in England and Wales: guidance note
                    </a>
                  </li>
                  <li>
                    <a href="#" className="govuk-link">
                      Granting a necessary (compulsory) electricity wayleave: guidance for applicants and landowner and/or occupiers
                    </a>
                  </li>
                </ul>
              </nav>
              <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '16px 0' }} />
              <div style={{ marginTop: '16px' }}>
                <span className="govuk-body govuk-!-font-weight-bold">Collection</span><br />
                <a href="#" className="govuk-link">Applying for energy infrastructure consents</a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
