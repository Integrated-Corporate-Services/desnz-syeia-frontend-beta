import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { ROLES } from "../../constants/roles";
import type { AuthUser } from "../../types/auth";
import { NOTIFICATIONS_PATH } from "../../features/InAppNotifications/constants/inAppNotifications";
import { useUnreadNotificationCount } from "../../features/InAppNotifications/hooks/useInAppNotifications";
import "../../styles/ServiceNavigation.css";

const ServiceNavigation = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const location = useLocation();
    const { user } = useAuthUserContext();

    // Handle all possible application dashboard paths
    const applicationDashboardPaths = ["/", "/application-dashboard"];

    // Hide navigation on the sign-in, request-access, and sent-for-approval pages.
    // /cookies is deliberately NOT here - it's a normal footer-linked page reachable
    // both signed in and signed out, so nav visibility should follow the `!user`
    // check below like the other footer pages (/privacy, /terms, /contact, /accessibility).
    const hideNavPaths = [
        "/",
        "/request-access",
        "/sent-for-approval",
        "/landingPage",
        "/s37-guidance",
        "/nwl-guidance",
        "/access-revoked",
        "/signed-out",
        "/service-unavailable",
    ];

    // Check if user is in registration/access request flow
    const isInRegistrationFlow = location.pathname.startsWith("/request-access");

    // Task list pages should not highlight Applications as active.
    const isOnTaskListPage = location.pathname.includes("/task-list");

    // Applications tab should only be active on the "Your applications" dashboard.
    const isOnApplicationPages =
        (applicationDashboardPaths.includes(location.pathname) ||
            location.pathname.startsWith("/application-dashboard")) &&
        !isOnTaskListPage;

    const isOnYourDetailsPages = location.pathname.startsWith('/your-details');


    // Check if on organisation/admin pages
    const isOnOrganisationPages =
        location.pathname.includes("/admin/") ||
        location.pathname.includes("/user-management");
    const isOnReportingPage = location.pathname === "/admin/reporting";
    // "/notifications/" is the same page as "/notifications".
    const isOnNotificationsPage = location.pathname.replace(/\/+$/, "") === NOTIFICATIONS_PATH;

    // Pending users are still requesting access, so they have no notifications.
    const showNotifications =
        !!user &&
        (user as AuthUser)?.role !== "pending" &&
        !isInRegistrationFlow &&
        !hideNavPaths.includes(location.pathname);
    const unreadNotificationCount = useUnreadNotificationCount(showNotifications, (user as AuthUser | null)?.user_id);

    if (!user || hideNavPaths.includes(location.pathname)) return null;

    if (location.pathname === "/feedback" && (user as AuthUser)?.role === "pending") return null;

    // Check if user has admin role (DTC, Tech Admin, or Superuser)
    const isAdmin =
        user &&
        ((user as AuthUser)?.role === ROLES.SUPERUSER ||
            (user as AuthUser)?.role === ROLES.APPLICANT_TEAM_COORDINATOR ||
            (user as AuthUser)?.role === ROLES.TECH_ADMIN);

    return (
        <nav className="rcc-service-nav" aria-label="Service navigation">
            <div className="rcc-service-nav__container">
                <span className="rcc-service-nav__service-name">
                    Submit your Energy Infrastructure Application
                </span>

                {/* Mobile toggle */}
                <button
                    type="button"
                    className="rcc-service-nav__toggle"
                    id="rcc-service-nav-toggle"
                    aria-controls="rcc-service-nav-list"
                    aria-expanded={menuOpen}
                    aria-label="Show or hide navigation menu"
                    onClick={() => setMenuOpen((o) => !o)}
                >
                    Menu <span className="rcc-service-nav__toggle-arrow" aria-hidden="true" />
                </button>

                <ul
                    className={`rcc-service-nav__list${menuOpen ? " is-open" : ""}`}
                    id="rcc-service-nav-list"
                >
                    {!isInRegistrationFlow && (
                        <>
                            {isAdmin && (
                                <li
                                    className={`rcc-service-nav__item${
                                        isOnOrganisationPages && !isOnReportingPage ? " rcc-service-nav__item--active" : ""
                                    }`}
                                >
                                    <Link
                                        className="rcc-service-nav__link"
                                        to="/admin/user-management"
                                        aria-current={isOnOrganisationPages && !isOnReportingPage ? "page" : undefined}
                                    >
                                        Organisation
                                    </Link>
                                </li>
                            )}
                            {[ROLES.SUPERUSER, ROLES.TECH_ADMIN].includes((user as AuthUser)?.role as string) && (
                                <li className={`rcc-service-nav__item${isOnReportingPage ? " rcc-service-nav__item--active" : ""}`}>
                                    <Link
                                        className="rcc-service-nav__link"
                                        to="/admin/reporting"
                                        aria-current={isOnReportingPage ? "page" : undefined}
                                    >
                                        Reporting
                                    </Link>
                                </li>
                            )}
                            <li
                                className={`rcc-service-nav__item${
                                    isOnApplicationPages ? " rcc-service-nav__item--active" : ""
                                }`}
                            >
                                <Link
                                    className="rcc-service-nav__link"
                                    to="/application-dashboard"
                                    aria-current={isOnApplicationPages ? "page" : undefined}
                                >
                                    Applications
                                </Link>
                            </li>
                            {showNotifications && (
                                <li
                                    className={`rcc-service-nav__item${
                                        isOnNotificationsPage ? " rcc-service-nav__item--active" : ""
                                    }`}
                                >
                                    <Link
                                        className="rcc-service-nav__link"
                                        to={NOTIFICATIONS_PATH}
                                        aria-current={isOnNotificationsPage ? "page" : undefined}
                                    >
                                        Notifications
                                        {/* The count is part of the link's name, e.g. "Notifications (3) unread".
                                            It is not a live region: the navigation is drawn again on every page,
                                            so screen readers would announce the count after every page change. */}
                                        {unreadNotificationCount > 0 && (
                                            <>
                                                {" "}({unreadNotificationCount})
                                                <span className="govuk-visually-hidden"> unread</span>
                                            </>
                                        )}
                                    </Link>
                                </li>
                            )}
                            {/* Your details navigation is temporarily hidden from the UI.
                            {!yourDetailsFeatureDisabled && (
                                <li
                                    className={`rcc-service-nav__item${
                                        isOnYourDetailsPages ? ' rcc-service-nav__item--active' : ''
                                    }`}
                                >
                                    <Link
                                        className="rcc-service-nav__link"
                                        to="/your-details"
                                        aria-current={isOnYourDetailsPages ? 'page' : undefined}
                                    >
                                        Your details
                                    </Link>
                                </li>
                            )} */}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default ServiceNavigation;
