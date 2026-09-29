import { buildBackendUrl } from '../../utils/apiConfig';
import PageTitle from '../../components/PageTitle';

const LandingPage = () => {
  return (
    <>
      {/* WCAG 2.4.2 Page Titled (Level A) - Issue #6 */}
      <PageTitle
        title="Submit your Energy Infrastructure Application"
        description="Apply for energy infrastructure consents under the Electricity Act 1989"
      />

      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <section id="signin">
              <h1 className="govuk-heading-l">Sign in to submit your application</h1>
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
        </div>
      </div>
    </>
  );
};

export default LandingPage;
