import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import requestAccessService from "../../services/accessRequestApplicationService";
import { createLogger } from "../../utils/logger";
import { ROLES } from "../../constants/roles";

const logger = createLogger('AccessRequestIntroPage');

// List of active roles that indicate user already has system access
const ACTIVE_ROLES = [
  ROLES.APPLICANT,
  ROLES.APPLICANT_AGENT,
  ROLES.APPLICANT_USER,
  ROLES.APPLICANT_TEAM_COORDINATOR,
  ROLES.NETWORK_OPERATOR,
  ROLES.DESNZ_ADMIN,
  ROLES.CONTACT,
];

const AccessRequestIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, authenticated } = useAuthUserContext();

  useEffect(() => {
    const checkAccessAndRequest = async () => {
      // If user is authenticated and has an ACTIVE role (not "pending"), redirect them
      if (authenticated && user?.role && ACTIVE_ROLES.includes(user.role)) {
        logger.info("User already has active access, redirecting to landingPage", { 
          userId: user.user_id, 
          role: user.role 
        });
        navigate("/landingPage", { replace: true });
        return;
      }

      // If no authenticated session but have an email, check for pending/submitted requests
      if (!user?.email) return;

      try {
        const result = await requestAccessService.checkExistingRequestByEmail(user.email);

        // If user has a submitted request, redirect to submitted page
        if (result.hasSubmittedRequest) {
          logger.info("User has pending access request, redirecting to submitted page", {
            email: user.email
          });
          navigate("/request-access/submitted", { replace: true });
        }
      } catch (error: unknown) {
        logger.error("Error checking existing request:", error);
      }
    };

    checkAccessAndRequest();
  }, [user?.email, user?.role, authenticated, navigate]);

  return (
    <>
            <div className="govuk-width-container">
        <Link to="/landingPage" className="govuk-back-link">
        Back
      </Link>

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
    </>
  );
};

export default AccessRequestIntroPage;
