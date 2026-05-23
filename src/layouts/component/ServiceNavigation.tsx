import React, { useState } from "react";
import { BASE_URL } from "../../constants/routes";
import { useLocation } from "react-router-dom";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { ROLES } from "../../constants/roles";
import type { AuthUser } from "../../types/auth";
import { logout } from "../../services/authService";
import "../../styles/ServiceNavigation.css";

const ServiceNavigation = () => {
    const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className="rcc-service-nav" aria-label="Service navigation">
            <div className="rcc-service-nav__container">
                {/* User name on the left */}
                {user && (
                    <div className="rcc-service-nav__user-name">
                        {`${(user as AuthUser).first_name || ""} ${
                            (user as AuthUser).last_name || ""
                        }`.trim() || "\u00A0"}
                    </div>
                )}

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
                                    <a
                                        className="rcc-service-nav__link"
                                        href={`${BASE_URL}/admin/user-management`}
                                        aria-current={isOnOrganisationPages ? "page" : undefined}
                                    >
                                        Organisation
                                    </a>
                                </li>
                            )}
                            <li
                                className={`rcc-service-nav__item${
                                    isOnApplicationPages ? " rcc-service-nav__item--active" : ""
                                }`}
                            >
                                <a
                                    className="rcc-service-nav__link"
                                    href={`${BASE_URL}/workbasket`}
                                    aria-current={isOnApplicationPages ? "page" : undefined}
                                >
                                    Applications
                                </a>
                            </li>
                            <li className="rcc-service-nav__item">
                                <a
                                    className="rcc-service-nav__link"
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Notifications <span className="moj-notification-badge"></span>
                                </a>
                            </li>
                            <li className="rcc-service-nav__item">
                                <a
                                    className="rcc-service-nav__link"
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Account
                                </a>
                            </li>
                        </>
                    )}
                    <li className="rcc-service-nav__item">
                        <a
                            className="rcc-service-nav__link"
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
    );
};

export default ServiceNavigation;
