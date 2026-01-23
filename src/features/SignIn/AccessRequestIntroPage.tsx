import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import requestAccessService from "../../services/accessRequestApplicationService";

const AccessRequestIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user?.email) return;

      try {
        const result = await requestAccessService.checkExistingRequestByEmail(user.email);

        // If user has a submitted request, redirect to submitted page
        if (result.hasSubmittedRequest) {
          navigate("/request-access/submitted", { replace: true });
        }
      } catch (error: unknown) {
        console.error("Error checking existing request:", error);
      }
    };

    checkExistingRequest();
  }, [user?.email, navigate]);

  return (
    <div className="govuk-width-container">
      <a href="/frontend/landingPage" className="govuk-back-link">
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Submit a request to activate your SYEIA account
            </h1>

            <p className="govuk-body">
              You need to submit a request to activate your account for the
              Submit your energy infrastructure application (SYEIA) service.
            </p>

            <p className="govuk-body">We will ask you for:</p>

            <ul className="govuk-list govuk-list--bullet">
              <li>your contact details</li>
              <li>your employer's name and address</li>
              <li>
                whether you work for a network operator or an agency
              </li>
              <li>
                names of the organisations you will submit applications for
              </li>
            </ul>

            <p className="govuk-body">
              You will not be able to use this service until your request has
              been approved.
            </p>

            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={() => navigate("/request-access/contact-details")}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccessRequestIntroPage;
