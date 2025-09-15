import { CONTENT } from '../../constants/content';
import React from 'react';
import { BASE_URL } from '../../constants/routes';
import { useLocation } from 'react-router-dom';

const ServiceNavigation = () => {
  const location = useLocation();

  // Handle all possible workbasket paths
  const workbasketPaths = [
    '/',
    '/workbasket',
    '/workbasket/'
  ];

  // Hide navigation on the sign-in (One Login) page
  const isOnSignIn = location.pathname === '/signin';
  const isOnWorkbasket = workbasketPaths.includes(location.pathname);

  if (isOnSignIn) return null;

  return (
    <section aria-label="Service information" className="govuk-service-navigation" data-module="govuk-service-navigation">
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
            <ul className="govuk-service-navigation__list" id="navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <li className="govuk-service-navigation__item">
                  {!isOnWorkbasket && (
                    <a className="govuk-service-navigation__link" 
                      href={`${BASE_URL}workbasket/`}>
                      {CONTENT.serviceNav[0].text}
                    </a>
                  )}
                </li>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <li className="govuk-service-navigation__item">
                  <button
                    className="govuk-service-navigation__link"
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                    onClick={() => window.location.href = 'http://localhost:3000/logout'}
                  >
                    Logout
                  </button>
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