import { CONTENT } from '../../constants/content';
import React from 'react';
import { BASE_URL } from '../../constants/routes';

const Header = () => (
  <header className="govuk-header govuk-header--full-width-border" data-module="govuk-header" data-govuk-header-init="">
    <div className="govuk-header__container govuk-width-container">
      <div className="govuk-header__logo">
      <a href="/" className="govuk-header__link">
        <img src="/assets/images/DESNZ_logo.png" alt="Department for Energy Security and Net Zero" style={{ display: 'block', width: '160px' }} />
      </a>
    </div>
      <div className="govuk-header__content">
        <span className="govuk-header__service-name">{CONTENT.header.serviceName}</span>
        <div>
          <span className="govuk-header__service-name govuk-!-margin-right-3" style={{ fontWeight: 'unset' }}>
            {CONTENT.header.section}
          </span>
        </div>
      </div>
    </div>
  </header>
);
export default Header;