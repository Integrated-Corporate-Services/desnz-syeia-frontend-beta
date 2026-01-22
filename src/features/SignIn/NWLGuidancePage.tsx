
const NWLGuidancePage = () => {

  return (
    
    <div className="govuk-width-container">
        <a
          href="/frontend/landingPage"
          className="govuk-back-link"
        >
          Submit your Energy Infrastructure Application
        </a>
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
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-l">
            Apply for a necessary wayleave
          </h1>
          <h2 className="govuk-heading-m">Introduction</h2>
</div>

        <div className="govuk-grid-column-two-thirds">
          
          <p className="govuk-body">
            Apply for a necessary wayleave under{" "}
            <a
              href="https://www.legislation.gov.uk/ukpga/1989/29/schedule/4"
              className="govuk-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schedule 4 to the Electricity Act 1989<span className="govuk-visually-hidden"> (opens in new tab)</span>
            </a>{" "}
            to install and retain an electric line on, under or over private land.
          </p>

          <h2 className="govuk-heading-m">Before you start</h2>
          <p className="govuk-body">
            We recommend that you study the guidance{" "}
            <a
              href="https://www.gov.uk/guidance/necessary-wayleaves-and-tree-felling-or-lopping-applying-for-consent"
              className="govuk-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Necessary wayleaves and tree felling or lopping: applying for consent<span className="govuk-visually-hidden"> (opens in new tab)</span>
            </a>{" "}
            as you will need to provide detailed information and documents as part of your application.
          </p>
          <p className="govuk-body">
            Here is a summarised list of the details and supporting documents you will need to provide:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>your contact details</li>
            <li>landowner and occupant contact details</li>
            <li>details about the land, such as address and Land Registry Title</li>
            <li>a list of assets and an application plan</li>
            <li>any relevant notices and wayleave agreements</li>
            <li>payment when you submit</li>
          </ul>

          <h2 className="govuk-heading-m">
            Sign in to submit your application
          </h2>
          <p className="govuk-body">
            You will be redirected to GOV.UK One Login to sign into this service. If you don't have a GOV.UK One Login associated with your work email address, you will be able to create one.
          </p>
          <button
            className="govuk-button govuk-button--start"
            data-module="govuk-button"
            type="button"
            onClick={() => (window.location.href = '/backend/auth/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            aria-label="Sign in to submit your application"
          >
            Start now
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
            </svg>
          </button>
        </div>
        <div className="govuk-grid-column-one-third">
          <aside className="app-related-items" role="complementary">
            <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '0 0 16px 0' }} />
            <h2 className="govuk-heading-s" id="related-content-title">
              Related content
            </h2>
            <nav role="navigation" aria-labelledby="related-content-title">
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <a
                    href="https://www.gov.uk/government/publications/the-statutory-consents-regime-for-overhead-power-lines-in-england-and-wales-guidance-note"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    The statutory consents regime for overhead power lines in England and Wales: guidance note<span className="govuk-visually-hidden"> (opens in new tab)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.gov.uk/government/publications/granting-a-necessary-compulsory-electricity-wayleave-guidance-for-applicants-and-landowner-and-or-occupiers"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Granting a necessary (compulsory) electricity wayleave: guidance for applicants and landowner and/or occupiers<span className="govuk-visually-hidden"> (opens in new tab)</span>
                  </a>
                </li>
              </ul>
            </nav>
            <hr style={{ border: 'none', borderTop: '1px solid #b1b4b6', margin: '16px 0' }} />
            <div style={{ marginTop: '16px' }}>
              <span className="govuk-body govuk-!-font-weight-bold">
                Collection
              </span>
              <br />
              <a
                href="https://www.gov.uk/government/collections/applying-for-energy-infrastructure-consents"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Applying for energy infrastructure consents<span className="govuk-visually-hidden"> (opens in new tab)</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
      </main>
    </div>
  );
};

export default NWLGuidancePage;
