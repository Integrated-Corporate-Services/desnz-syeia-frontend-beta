import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useAccessRequestContext } from "../../context/AccessRequestContext";
import { logout } from "../../services/authService";
import { createLogger } from "../../utils/logger";
import { ROLES } from "../../constants/roles";

const logger = createLogger('AccessRequestSubmittedPage');

// List of active roles that indicate user already has system access
const ACTIVE_ROLES = [
  ROLES.APPLICANT,
  ROLES.APPLICANT_AGENT,
  ROLES.APPLICANT_USER,
  ROLES.APPLICANT_TEAM_COORDINATOR,
  ROLES.TECH_ADMIN,
  ROLES.NETWORK_OPERATOR,
  ROLES.DESNZ_ADMIN,
  ROLES.CONTACT,
];

const AccessRequestSubmittedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, authenticated } = useAuthUserContext();
  const { clearFormData } = useAccessRequestContext();

  useEffect(() => {
    // If user is authenticated and has an ACTIVE role (not "pending"), redirect them
    if (authenticated && user?.role && ACTIVE_ROLES.includes(user.role)) {
      logger.info("User already has active access, redirecting to landingPage", { 
        userId: user.user_id, 
        role: user.role 
      });
      navigate("/landingPage", { replace: true });
      return;
    }

    // Clear form data when user reaches this page (request submitted successfully)
    clearFormData();
  }, [authenticated, user?.role, navigate, clearFormData]);

  return (
    <>
            <div className="govuk-width-container">
      
                <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">
                Your request has been submitted
              </h1>
            </div>

            <h2 className="govuk-heading-m">What happens next</h2>

            <p className="govuk-body">
              A team coordinator needs to approve your account activation request before you can use this service.
            </p>

            <p className="govuk-body">
              We will email you when you request has been reviewed.
            </p>

            <h2 className="govuk-heading-m">If you need help</h2>

            <p className="govuk-body">
              If you have any questions about your request, contact the team coordinator of your organisation or the organisation youâ€™ll be submitting applications for.
            </p>

            <p className="govuk-body">
              For technical issues using this service, email{" "}
              <a href="mailto:xxx@desnz.com" className="govuk-link">
                xxx@desnz.com
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
            </div>
    </>
  );
};

export default AccessRequestSubmittedPage;
