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
  const isOnWorkbasket = workbasketPaths.includes(location.pathname);

  return (
    <section aria-label="Service information" className="govuk-service-navigation" data-module="govuk-service-navigation">
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
            <ul className="govuk-service-navigation__list" id="navigation">
                <li className="govuk-service-navigation__item">
                  {!isOnWorkbasket && (
                  <a className="govuk-service-navigation__link" 
                  href={`${BASE_URL}workbasket/`}>
                    {CONTENT.serviceNav[0].text}</a>
                    )}
                </li>
              {/*<li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${BASE_URL}notifications.html`}>
                  Notifications <span id="notifications" className="moj-notification-badge">2</span>
                </a>
              </li>*/}
              {/*<li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${BASE_URL}signin.html`}>Sign out</a>
              </li>*/}
            </ul>
          </nav>
        </div>
      </div>
    </section>
);
};
export default ServiceNavigation;