import { CONTENT } from "../../constants/content";
import React from "react";
import { BASE_URL } from "../../constants/routes";
import { useLocation } from "react-router-dom";
import { logout } from "../../services/authService";

const ServiceNavigation = () => {
  const location = useLocation();

  // Handle all possible workbasket paths
  const workbasketPaths = ["/", "/workbasket", "/workbasket/"];

  // Hide navigation on the sign-in, request-access, and sent-for-approval pages
  const hideNavPaths = [
    "/",
    "/request-access",
    "/sent-for-approval",
    "/landingPage",
    "/s37-guidance",
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

  if (hideNavPaths.includes(location.pathname)) return null;

  return (
    <section
      aria-label="Service information"
      className="govuk-service-navigation"
      data-module="govuk-service-navigation"
    >
      <style>{`
        .govuk-service-navigation__container {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
            <ul
              className="govuk-service-navigation__list"
              id="navigation"
              style={{
                display: "flex",
                justifyContent: isInRegistrationFlow ? "flex-end" : "space-between",
                alignItems: "center",
              }}
            >
              {!isInRegistrationFlow && (
                <li
                  className={`govuk-service-navigation__item ${
                    isOnApplicationPages
                      ? "govuk-service-navigation__item--active"
                      : ""
                  }`}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <a
                    className="govuk-service-navigation__link"
                    href={`${BASE_URL}/workbasket`}
                    aria-current={isOnApplicationPages ? "true" : undefined}
                  >
                    {isOnApplicationPages ? (
                      <strong className="govuk-service-navigation__active-fallback">
                        {CONTENT.serviceNav[0].text}
                      </strong>
                    ) : (
                      CONTENT.serviceNav[0].text
                    )}
                  </a>
                </li>
              )}
              <li
                className="govuk-service-navigation__item"
                style={{ display: "flex", alignItems: "center", marginLeft: isInRegistrationFlow ? "0" : "auto" }}
              >
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
              {/*<li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${BASE_URL}notifications.html`}>
                  Notifications <span id="notifications" className="moj-notification-badge">2</span>
                </a>
              </li>*/}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};
export default ServiceNavigation;
