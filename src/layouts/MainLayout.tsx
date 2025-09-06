import React, { ReactNode } from 'react';

type MainLayoutProps = {
  children: ReactNode;
};


const MainLayout = ({ children }: MainLayoutProps) => (
  <>
    {/* Header */}
    <header className="govuk-header govuk-header--full-width-border" data-module="govuk-header" data-govuk-header-init="">
      <div className="govuk-header__container govuk-width-container">
        <div className="govuk-header__logo">
          <a href="/" className="govuk-header__link">
            <img src="/assets/images/DESNZ_logo.png" alt="Department for Energy Security and Net Zero" style={{ display: 'block', width: '160px' }} />
          </a>
        </div>
        <div className="govuk-header__content">
          <span className="govuk-header__service-name">UK Energy Portal</span>
          <div>
            <span className="govuk-header__service-name govuk-!-margin-right-3" style={{ fontWeight: 'unset' }}>
              Section 37 Consent
            </span>
          </div>
        </div>
      </div>
    </header>
    {/* Service Navigation (optional, can be made dynamic) */}
    <section aria-label="Service information" className="govuk-service-navigation" data-module="govuk-service-navigation">
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <nav aria-label="Menu" className="govuk-service-navigation__wrapper">
            <ul className="govuk-service-navigation__list" id="navigation">
              <li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${import.meta.env.BASE_URL}applications.html`}>Applications</a>
              </li>
              <li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${import.meta.env.BASE_URL}notifications.html`}>  Notifications 
                  <span id="notifications" className="moj-notification-badge">2</span></a>
              </li>
              <li className="govuk-service-navigation__item">
                <a className="govuk-service-navigation__link" href={`${import.meta.env.BASE_URL}signin.html`}>Sign out</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
    {/* Main Content */}
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        {children}
      </main>
    </div>
    {/* Footer */}
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <h2 className="govuk-visually-hidden">Support links</h2>
            <ul className="govuk-footer__inline-list">
              <li className="govuk-footer__inline-list-item">
                <a className="govuk-footer__link" href="/public/accessibility-statement">Accessibility statement</a>
              </li>
              <li className="govuk-footer__inline-list-item">
                <a className="govuk-footer__link" href="/public/contact-information">Contact</a>
              </li>
              <li className="govuk-footer__inline-list-item">
                <a className="govuk-footer__link" href="/feedback">Feedback</a>
              </li>
            </ul>
            <span className="govuk-footer__licence-description">
              All content is available under the
              <a className="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated
            </span>
          </div>
          <div className="govuk-footer__meta-item">
            <a className="govuk-footer__link govuk-footer__copyright-logo" href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">© Crown copyright</a>
          </div>
        </div>
      </div>
    </footer>
  </>
);

export default MainLayout;
