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
              <h1 className="govuk-heading-l">Sign in to submit your energy infrastructure application</h1>
              <p className="govuk-body">
                Use your GOV.UK One Login associated with your work email address to access this service. You can create one if you do not have one.
              </p>
              <a
                href={buildBackendUrl('/auth/login')}
                role="button"
                draggable={false}
                className="govuk-button"
                data-module="govuk-button"
              >
                Sign in with GOV.UK One Login
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
