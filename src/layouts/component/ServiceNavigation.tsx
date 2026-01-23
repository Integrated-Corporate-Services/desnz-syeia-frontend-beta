import { CONTENT } from "../../constants/content";
import React from "react";
import { BASE_URL } from "../../constants/routes";
import { useLocation } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { ROLES } from "../../constants/roles";
import type { AuthUser } from "../../types/auth";
import { logout } from "../../services/authService";

const ServiceNavigation = () => {
  const location = useLocation();
  const { user } = useAuthUserContext();

  // Handle all possible workbasket paths
  const workbasketPaths = ["/", "/workbasket", "/workbasket/"];

  // Hide navigation on the sign-in, request-access, and sent-for-approval pages
  const hideNavPaths = [
    "/",
    "/request-access",
    "/sent-for-approval",
    "/landingPage",
    "/s37-guidance",
    "/nwl-guidance",
    "/tlp-guidance",
  ];

  // Check if user is in registration/access request flow
  const isInRegistrationFlow = location.pathname.startsWith("/request-access");

  // Check if on workbasket or any application-related page
  const isOnApplicationPages =
    workbasketPaths.includes(location.pathname) ||
    location.pathname.includes("/s-37/") ||
    location.pathname.includes("/nwl/") ||
    location.pathname.includes("/tlp/") ||
    location.pathname.includes("/task-list") ||
    location.pathname.includes("/delete");

  // Check if on organisation/admin pages
  const isOnOrganisationPages =
    location.pathname.includes("/admin/") ||
    location.pathname.includes("/user-management");

  if (hideNavPaths.includes(location.pathname)) return null;

  // Check if user has admin role (DTC or DESNZ Admin)
  const isAdmin =
    user &&
    ((user as AuthUser)?.role === ROLES.DESNZ_ADMIN ||
      (user as AuthUser)?.role === ROLES.DNO_TEAM_COORDINATOR);

  return (
    <div className="govuk-width-container">
      <section
        aria-label="Service information"
        className="govuk-service-navigation"
        style={{ minHeight: "48px" }}
      >
        <style>{`
          .govuk-service-navigation {
            border-bottom: none !important;
            background-color: #f3f2f1 !important;
          }
          .govuk-service-navigation__item {
            padding: 0 !important;
            margin: 0 !important;
            border-bottom: none !important;
          }
          .govuk-service-navigation__item--active {
            border-bottom: none !important;
            box-shadow: none !important;
          }
          .govuk-service-navigation__link {
            font-weight: 700 !important;
            color: #1d70b8 !important;
            padding: 8px 0 8px 0 !important;
            display: inline-block !important;
            text-decoration: underline !important;
            text-decoration-thickness: 1px !important;
            border-bottom: none !important;
          }
          .govuk-service-navigation__item--active .govuk-service-navigation__link {
            color: #0b0c0c !important;
            text-decoration: none !important;
            border: none !important;
            padding-bottom: 4px !important;
            box-shadow: inset 0 -4px 0 0 #1d70b8 !important;
            background: none !important;
          }
          .govuk-service-navigation__link:hover {
            color: #003078 !important;
          }
          .govuk-service-navigation__item--active .govuk-service-navigation__link:hover {
            color: #0b0c0c !important;
          }
          .govuk-service-navigation__item:not(:last-child)::after {
            content: "|";
            margin: 0 8px;
            color: #505a5f;
            font-weight: 400;
          }
          .govuk-service-navigation__list {
            display: flex !important;
            align-items: center !important;
            gap: 0 !important;
            margin: 0 !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        `}</style>
        <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0 0 0",
            }}
          >
            {/* User name on the left */}
            <span
              className="govuk-body"
              style={{
                margin: 0,
                fontWeight: 500,
                minWidth: "120px",
                alignSelf: "center",
                paddingLeft: "15px",
              }}
            >
              {user
                ? `${(user as any).first_name || ""} ${
                    (user as any).last_name || ""
                  }`.trim() || "\u00A0"
                : "\u00A0"}
            </span>

            {/* Navigation links on the right */}
            <ul
              className="govuk-service-navigation__list"
              id="navigation"
              style={{
                paddingRight: "15px",
                alignSelf: "flex-end",
              }}
            >
              {isAdmin && (
                <li
                  className={`govuk-service-navigation__item ${
                    isOnOrganisationPages
                      ? "govuk-service-navigation__item--active"
                      : ""
                  }`}
                >
                  <a
                    className="govuk-service-navigation__link"
                    href={`${BASE_URL}/admin/user-management`}
                    aria-current={isOnOrganisationPages ? "true" : undefined}
                  >
                    Organisation
                  </a>
                </li>
              )}
              <li
                className={`govuk-service-navigation__item ${
                  isOnApplicationPages
                    ? "govuk-service-navigation__item--active"
                    : ""
                }`}
              >
                <a
                  className="govuk-service-navigation__link"
                  href={`${BASE_URL}/workbasket`}
                  aria-current={isOnApplicationPages ? "true" : undefined}
                >
                  Applications
                </a>
              </li>
              <li className="govuk-service-navigation__item">
                <a
                  className="govuk-service-navigation__link"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Notifications <span className="moj-notification-badge"></span>
                </a>
              </li>
              <li className="govuk-service-navigation__item">
                <a
                  className="govuk-service-navigation__link"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Account
                </a>
              </li>
              <li className="govuk-service-navigation__item">
                <a
                  className="govuk-service-navigation__link"
                  href="#"
                  onClick={async (event) => {
                    event.preventDefault();
                    await logout();
                  }}
                >
                  Sign out
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </section>
    </div>
  );
};
export default ServiceNavigation;
