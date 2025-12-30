import { CONTENT } from "../../constants/content";
import React from "react";
import { BASE_URL } from "../../constants/routes";
import { useLocation } from "react-router-dom";

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

  // Check if on workbasket or any application-related page
  const isOnApplicationPages =
    workbasketPaths.includes(location.pathname) ||
    location.pathname.includes("/s-37/") ||
    location.pathname.includes("/nwl/") ||
    location.pathname.includes("/tlp/") ||
    location.pathname.includes("/task-list") ||
    location.pathname.includes("/delete");

  // Use environment variable for logout URL
  const logoutUrl = import.meta.env.VITE_AUTH_LOGOUT_URL;

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
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
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
                    {isOnApplicationPages ? (
                      <strong className="govuk-service-navigation__active-fallback">
                        {CONTENT.serviceNav[0].text}
                      </strong>
                    ) : (
                      CONTENT.serviceNav[0].text
                    )}
                  </a>
                </li>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <li className="govuk-service-navigation__item">
                  <a
                    className="govuk-service-navigation__link"
                    href={logoutUrl || "/frontend"}
                  >
                    Sign out
                  </a>
                </li>
              </div>
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
