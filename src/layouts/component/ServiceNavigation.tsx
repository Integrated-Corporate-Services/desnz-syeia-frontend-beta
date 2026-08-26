import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { ROLES } from "../../constants/roles";
import type { AuthUser } from "../../types/auth";
import { isYourDetailsFeatureDisabled } from "../../utils/disabledFormTypes";
import "../../styles/ServiceNavigation.css";

const ServiceNavigation = () => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const location = useLocation();
    const { user } = useAuthUserContext();
    const yourDetailsFeatureDisabled = isYourDetailsFeatureDisabled();

    // Handle all possible application dashboard paths
    const applicationDashboardPaths = ["/", "/application-dashboard"];

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

    if (hideNavPaths.includes(location.pathname)) return null;

    if (location.pathname === "/feedback" && (!user || (user as AuthUser)?.role === "pending")) return null;

    // Check if user has admin role (DTC, Tech Admin, or DESNZ Admin)
    const isAdmin =
        user &&
        ((user as AuthUser)?.role === ROLES.DESNZ_ADMIN ||
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
                                        isOnOrganisationPages ? " rcc-service-nav__item--active" : ""
                                    }`}
                                >
                                    <Link
                                        className="rcc-service-nav__link"
                                        to="/admin/user-management"
                                        aria-current={isOnOrganisationPages ? "page" : undefined}
                                    >
                                        Organisation
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
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default ServiceNavigation;
