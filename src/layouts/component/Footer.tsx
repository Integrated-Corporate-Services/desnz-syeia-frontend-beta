import { CONTENT } from '../../constants/content';
import React from 'react';
const Footer = () => (
  <footer className="govuk-footer" role="contentinfo">
    <div className="govuk-width-container">
      <div className="govuk-footer__meta">
        <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
          <h2 className="govuk-visually-hidden">Support links</h2>
          <ul className="govuk-footer__inline-list">
            <li className="govuk-footer__inline-list-item">
              <a className="govuk-footer__link" href={CONTENT.footer.links[0].href}>{CONTENT.footer.links[0].text}</a>
            </li>
            <li className="govuk-footer__inline-list-item">
              <a className="govuk-footer__link" href={CONTENT.footer.links[1].href}>{CONTENT.footer.links[1].text}</a>
            </li>
            <li className="govuk-footer__inline-list-item">
              <a className="govuk-footer__link" href={CONTENT.footer.links[2].href}>{CONTENT.footer.links[2].text}</a>
            </li>
          </ul>
          <span className="govuk-footer__licence-description">
            {CONTENT.footer.licenceDescription}
            <a className="govuk-footer__link" href={CONTENT.footer.licence.href} rel="license">{CONTENT.footer.licence.text}</a>, {CONTENT.footer.exceptWhereOtherwiseStated}
          </span>
        </div>
        <div className="govuk-footer__meta-item">
          <a className="govuk-footer__link govuk-footer__copyright-logo" href={CONTENT.footer.copyright.href}>{CONTENT.footer.copyright.text}</a>
        </div>
      </div>
    </div>
  </footer>
);
export default Footer;