
import { useNavigate } from 'react-router-dom';

const Section37GuidancePage = () => {
  const navigate = useNavigate();
  return (
    <>
      <a 
        href="/landingPage" 
        className="govuk-back-link govuk-!-margin-bottom-6 govuk-!-margin-top-0"
        style={{ display: 'inline-block', marginBottom: '32px', marginTop: 0 }}
      >
        Submit your Energy Infrastructure Application
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">Overhead lines (Section 37) applications</h1>

          <h2 className="govuk-heading-m">Introduction</h2>
          <p className="govuk-body">
            Apply for consent under Section 37 of the Electricity Act 1989 to install or change overhead electric lines in England and Wales. This includes applications for new lines or alterations to existing ones.
          </p>
          <p className="govuk-body">
            Applications for consent must comply with:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li><a href="https://www.legislation.gov.uk/ukpga/1989/29/schedule/8" className="govuk-link" target="_blank" rel="noopener noreferrer">Schedule 8 to the Electricity Act 1989 (opens in a new tab)</a></li>
            <li><a href="https://www.legislation.gov.uk/uksi/1990/459/contents/made" className="govuk-link" target="_blank" rel="noopener noreferrer">The Electricity (Applications for Consent) Regulations 1990 (opens in a new tab)</a></li>
            <li><a href="https://www.legislation.gov.uk/uksi/2000/1927/contents/made" className="govuk-link" target="_blank" rel="noopener noreferrer">Electricity Works (Environmental Impact Assessment) (England and Wales) Regulations 2000 (opens in a new tab)</a></li>
          </ul>
          <p className="govuk-body">
            <a href="/landingPage" className="govuk-link">Learn about other application types</a>
          </p>

          <h2 className="govuk-heading-m">Before you start</h2>
          <p className="govuk-body">
            You will need to provide highly detailed information, documents and images to support your application.
          </p>
          <p className="govuk-body">
            Here is a summarised list of the sections you will need to complete:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>Applicant details
              <ul className="govuk-list govuk-list--bullet">
                <li>Applicant details</li>
                <li>Check applicant contact details</li>
              </ul>
            </li>
            <li>Application details
              <ul className="govuk-list govuk-list--bullet">
                <li>Application overview</li>
                <li>Asset information</li>
              </ul>
            </li>
            <li>Location
              <ul className="govuk-list govuk-list--bullet">
                <li>Route</li>
                <li>Works overview</li>
                <li>Sensitive area checks</li>
                <li>Parishes</li>
              </ul>
            </li>
            <li>Supporting information
              <ul className="govuk-list govuk-list--bullet">
                <li>Supporting questions</li>
                <li>EIA fees</li>
              </ul>
            </li>
            <li>Consultations
              <ul className="govuk-list govuk-list--bullet">
                <li>Consultations</li>
                <li>Post-consultation actions</li>
              </ul>
            </li>
            <li>Pay and submit application</li>
          </ul>

          <h2 className="govuk-heading-m">Sign in to submit your application</h2>
          <p className="govuk-body">
            You’ll need to sign in to use this service. If you do not already have sign in details, you’ll be able to create them.
          </p>
          <button
            className="govuk-button govuk-button--start"
            type="button"
            onClick={() => navigate('/workbasket')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Start now
            <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
            </svg>
          </button>
          <p className="govuk-body">
            <a className="govuk-link" href="#">View a printable version of the whole guide</a>
          </p>
        </div>
        <div className="govuk-grid-column-one-third">
          <aside className="app-related-items" role="complementary" style={{ marginTop: '150px' }}>
            <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '0 0 16px 0' }} />
            <h2 className="govuk-heading-s" id="related-content-title">Related content</h2>
            <nav role="navigation" aria-labelledby="related-content-title">
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <a href="https://www.gov.uk/guidance/statutory-consents-regime-for-overhead-power-lines-in-england-and-wales" className="govuk-link" target="_blank" rel="noopener noreferrer">
                    The statutory consents regime for overhead power lines in England and Wales: guidance note
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.uk/guidance/granting-a-necessary-compulsory-electricity-wayleave-guidance-for-applicants-and-landowner-and-or-occupiers" className="govuk-link" target="_blank" rel="noopener noreferrer">
                    Granting a necessary (compulsory) electricity wayleave: guidance for applicants and landowner and/or occupiers
                  </a>
                </li>
              </ul>
            </nav>
            <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '16px 0' }} />
            <div style={{ marginTop: '16px' }}>
              <span className="govuk-body govuk-!-font-weight-bold">Collection</span><br />
              <a href="https://www.gov.uk/guidance/applying-for-energy-infrastructure-consents" className="govuk-link" target="_blank" rel="noopener noreferrer">Applying for energy infrastructure consents</a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Section37GuidancePage;

