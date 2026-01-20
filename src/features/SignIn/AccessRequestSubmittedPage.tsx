import React from "react";
import { logout } from "../../services/authService";

const AccessRequestSubmittedPage: React.FC = () => {

  return (
    <div className="govuk-width-container">
    
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Your request has been submitted
              </h1>
            </div>

            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              A team coordinator needs to approve your account activation request
              before you can use this service.
            </p>

            <p className="govuk-body">
              We will email you when you request has been reviewed. This can take up to
              2 working days.
            </p>

            <h2 className="govuk-heading-m">If you need help</h2>

            <p className="govuk-body">
              If you have any questions about your request, contact the team
              coordinator of your organisation or the organisation you are submitting
              for.
            </p>

            <p className="govuk-body">
              For any other issues using this service, email{" "}
              <a href="mailto:support@desnz.gov.uk" className="govuk-link">
                support@desnz.gov.uk
              </a>.
            </p>

            <p className="govuk-body">
              <a
                className="govuk-link"
                href="#"
               onClick={async (event) => {
               event.preventDefault();
                await logout();
                }}
              >
                Log out
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessRequestSubmittedPage;
