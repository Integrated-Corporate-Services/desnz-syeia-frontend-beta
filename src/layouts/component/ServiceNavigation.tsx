import React from "react";
import { BASE_URL } from "../../constants/routes";
import { useLocation } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { ROLES } from "../../constants/roles";
import type { AuthUser } from "../../types/auth";
import { logout } from "../../services/authService";
import "../../styles/ServiceNavigation.css";

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
    "/access-revoked",
    "/signed-out",
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
      (user as AuthUser)?.role === ROLES.APPLICANT_TEAM_COORDINATOR);

  return (
    <div className="govuk-width-container">
      <section
        aria-label="Service information"
        className="govuk-service-navigation"
        data-module="govuk-service-navigation"
      >
        <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
          <div className="govuk-service-navigation__wrapper-container">
            {/* User name on the left */}
            <span className="govuk-body govuk-service-navigation__user-name">
              {user
                ? `${(user as any).first_name || ""} ${
                    (user as any).last_name || ""
                  }`.trim() || "\u00A0"
                : "\u00A0"}
            </span>

            {/* Navigation links on the right */}
            <ul
              className="govuk-service-navigation__list govuk-service-navigation__list--right"
              id="navigation"
            >
              {!isInRegistrationFlow && (
                <>
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
                        aria-current={
                          isOnOrganisationPages ? "true" : undefined
                        }
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
                      Notifications{" "}
                      <span className="moj-notification-badge"></span>
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
                </>
              )}
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
