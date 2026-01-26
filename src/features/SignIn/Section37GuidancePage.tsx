
const Section37GuidancePage = () => {

  return (
    <>
      <a
        href="/frontend/landingPage"
        className="govuk-back-link govuk-!-margin-bottom-6 govuk-!-margin-top-0"
        style={{ display: "inline-block", marginBottom: "32px", marginTop: 0 }}
      >
        Submit your Energy Infrastructure Application
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Apply for consent to install or change overhead lines (Section 37)
          </h1>

          <h2 className="govuk-heading-m">Introduction</h2>
          <p className="govuk-body">
            Apply for consent under{" "}
            <a
              href="https://www.legislation.gov.uk/ukpga/1989/29/section/37"
              className="govuk-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Section 37 of the Electricity Act 1989 (opens in a new tab)
            </a>{" "}
            to install or change overhead electric lines in England and Wales. This
            includes applications for new lines or alterations to existing ones.
          </p>
          <p className="govuk-body">
            Applications for consent must comply with:
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <a
                href="https://www.legislation.gov.uk/ukpga/1989/29/schedule/8"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule 8 to the Electricity Act 1989 (opens in a new tab)
              </a>
            </li>
            <li>
              <a
                href="https://www.legislation.gov.uk/uksi/1990/459/contents/made"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Electricity (Applications for Consent) Regulations 1990
                (opens in a new tab)
              </a>
            </li>
            <li>
              <a
                href="https://www.legislation.gov.uk/uksi/2000/1927/contents/made"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Electricity Works (Environmental Impact Assessment) (England and
                Wales) Regulations 2000 (opens in a new tab)
              </a>
            </li>
          </ul>
          <h2 className="govuk-heading-m">Before you start</h2>
          <p className="govuk-body">
                You will need to provide highly detailed information, documents and images to support your application.
              </p>
              <p className="govuk-body">
                These are the key legal requirements:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>a map of the overhead line's route</li>
                <li>the length of the line and its nominal voltage</li>
                <li>the status of wayleave agreements for the affected land</li>
              </ul>
              <p className="govuk-body">
                Here is a summarised list of the information you will be asked to provide:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>your contact details</li>
                <li>a summary of the proposed works</li>
                <li>coordinates of the route</li>
                <li>evidence of consultations with statutory and non-statutory bodies</li>
                <li>proportionate ecological assessment of the work site</li>
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
            type="button"
            onClick={() => (window.location.href = '/backend/auth/login')}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            Sign in
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
          <aside
            className="app-related-items"
            role="complementary"
            style={{ marginTop: "150px" }}
          >
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #b1b4b6",
                margin: "0 0 16px 0",
              }}
            />
            <h2 className="govuk-heading-s" id="related-content-title">
              Related content
            </h2>
            <nav role="navigation" aria-labelledby="related-content-title">
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <a
                    href="https://www.gov.uk/guidance/statutory-consents-regime-for-overhead-power-lines-in-england-and-wales"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    The statutory consents regime for overhead power lines in
                    England and Wales: guidance note
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.legislation.gov.uk/uksi/2009/640/contents/made"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    The Overhead Lines (Exemption)(England and Wales) Regulations 2009
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.gov.uk/guidance/granting-a-necessary-compulsory-electricity-wayleave-guidance-for-applicants-and-landowner-and-or-occupiers"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Granting a necessary (compulsory) electricity wayleave:
                    guidance for applicants and landowner and/or occupiers
                  </a>
                </li>
              </ul>
            </nav>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #b1b4b6",
                margin: "16px 0",
              }}
            />
            <div style={{ marginTop: "16px" }}>
              <span className="govuk-body govuk-!-font-weight-bold">
                Collection
              </span>
              <br />
              <a
                href="https://www.gov.uk/guidance/applying-for-energy-infrastructure-consents"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Applying for energy infrastructure consents
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Section37GuidancePage;
