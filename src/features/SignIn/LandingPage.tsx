
import { buildBackendUrl } from '../../utils/apiConfig';

const LandingPage = () => {
  return (
    <>
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
                Use this service to apply for energy infrastructure consents under the Electricity Act 1989.
              </p>
              <p className="govuk-body">
                This service is for electricity distribution network operators (DNOs) and other energy infrastructure applicants.
              </p>
              <p className="govuk-body">
                These are the different application types, linked to specific guidance for each:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li><a className="govuk-link" href="/s37-guidance">Overhead lines (Section 37)</a></li>
                <li><a className="govuk-link" href="/nwl-guidance">Necessary wayleaves</a></li>
                <li><a className="govuk-link" href="#">Tree felling or lopping</a></li>
              </ul>
              <p className="govuk-body">
                Your application must meet the requirements of the <a className="govuk-link" href="https://www.legislation.gov.uk/ukpga/1989/29/contents" target="_blank" rel="noopener noreferrer">Electricity Act 1989<span className="govuk-visually-hidden"> (opens in new tab)</span></a> and include all required documents and the correct fee.
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
                <li><a className="govuk-link" href="https://www.gov.uk/guidance/overhead-lines-applying-for-consent" target="_blank" rel="noopener noreferrer">Overhead lines (Section 37)<span className="govuk-visually-hidden"> (opens in new tab)</span></a></li>
                <li><a className="govuk-link" href="https://www.gov.uk/guidance/necessary-wayleaves-and-tree-felling-or-lopping-applying-for-consent" target="_blank" rel="noopener noreferrer">Necessary wayleaves and tree felling or lopping<span className="govuk-visually-hidden"> (opens in new tab)</span></a></li>
              </ul>
            </section>

            <section id="signin" style={{ marginTop: '40px' }}>
              <h2 className="govuk-heading-m">Sign in to submit your application</h2>
              <p className="govuk-body">
                You will be redirected to GOV.UK One Login to sign into this service. If you don't have a GOV.UK One Login associated with your work email address, you will be able to create one.
              </p>
              <button
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                onClick={() => {
                  window.location.href = buildBackendUrl('/auth/login');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                aria-label="Sign in to submit your application"
              >
                Sign in
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true" focusable="false" style={{ marginLeft: '4px' }}>
                  <path d="M6 13l5-4.5L6 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
         
            </section>
          </div>
          <div className="govuk-grid-column-one-third">
            <aside className="app-related-items" role="complementary">
              <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '0 0 16px 0' }} />
              <h2 className="govuk-heading-s" id="related-content-title">Related content</h2>
              <nav role="navigation" aria-labelledby="related-content-title">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <a href="https://www.gov.uk/government/publications/the-statutory-consents-regime-for-overhead-power-lines-in-england-and-wales-guidance-note" target="_blank" rel="noopener noreferrer" className="govuk-link">
                      The statutory consents regime for overhead power lines in England and Wales: guidance note
                    </a>
                  </li>
                  <li>
                    <a href="https://www.gov.uk/government/publications/granting-a-necessary-compulsory-electricity-wayleave-guidance-for-applicants-and-landowner-and-or-occupiers" target="_blank" rel="noopener noreferrer" className="govuk-link">
                      Granting a necessary (compulsory) electricity wayleave: guidance for applicants and landowner and/or occupiers
                    </a>
                  </li>
                </ul>
              </nav>
              <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '16px 0' }} />
              <div style={{ marginTop: '16px' }}>
                <span className="govuk-body govuk-!-font-weight-bold">Collection</span><br />
                <a href="https://www.gov.uk/government/collections/applying-for-energy-infrastructure-consents" target="_blank" rel="noopener noreferrer" className="govuk-link">Applying for energy infrastructure consents</a>
              </div>
            </aside>
          </div>
        </div>
            </div>
    </>
  );
};

export default LandingPage;
