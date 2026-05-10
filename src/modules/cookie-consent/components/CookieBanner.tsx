import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from './CookieConsentProvider';
import { BANNER, BUTTON_TEXT } from '../constants';

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent();
  const [confirmed, setConfirmed] = useState<'accepted' | 'rejected' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showBanner && confirmed === null) return null;

  const handle = (action: () => Promise<void>, result: 'accepted' | 'rejected') => async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await action();
      setConfirmed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : BANNER.ERROR_FALLBACK);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="govuk-cookie-banner" data-nosnippet role="region" aria-label={BANNER.ARIA_LABEL}>
      {confirmed === null && (
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">{BANNER.HEADING}</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">{BANNER.ESSENTIAL_MESSAGE}</p>
                <p className="govuk-body">
                  {BANNER.ADDITIONAL_MESSAGE}{' '}
                  <Link to="/privacy" className="govuk-link">{BANNER.PRIVACY_LINK_TEXT}</Link> {BANNER.PRIVACY_LINK_SUFFIX}
                </p>
              </div>
            </div>
          </div>
          {error && (
            <div className="govuk-error-summary" role="alert">
              <div className="govuk-error-summary__body">
                <p className="govuk-error-message">{error}</p>
              </div>
            </div>
          )}
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" disabled={submitting}
              onClick={handle(acceptAll, 'accepted')}>
              {submitting ? BUTTON_TEXT.SAVING : BANNER.ACCEPT_BUTTON}
            </button>
            <button type="button" className="govuk-button" disabled={submitting}
              onClick={handle(rejectAll, 'rejected')}>
              {submitting ? BUTTON_TEXT.SAVING : BANNER.REJECT_BUTTON}
            </button>
            <Link className="govuk-link" to="/cookies">{BANNER.VIEW_COOKIES_LINK}</Link>
          </div>
        </div>
      )}
      {confirmed === 'accepted' && (
        <div className="govuk-cookie-banner__message govuk-width-container" role="alert">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">{BANNER.ACCEPTED_HEADING}</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">{BANNER.CHANGE_SETTINGS_PREFIX} <Link className="govuk-link" to="/cookies">{BANNER.CHANGE_SETTINGS_LINK}</Link> {BANNER.CHANGE_SETTINGS_SUFFIX}</p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" onClick={() => setConfirmed(null)}>{BANNER.HIDE_BUTTON}</button>
          </div>
        </div>
      )}
      {confirmed === 'rejected' && (
        <div className="govuk-cookie-banner__message govuk-width-container" role="alert">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">{BANNER.REJECTED_HEADING}</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">{BANNER.CHANGE_SETTINGS_PREFIX} <Link className="govuk-link" to="/cookies">{BANNER.CHANGE_SETTINGS_LINK}</Link> {BANNER.CHANGE_SETTINGS_SUFFIX}</p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" onClick={() => setConfirmed(null)}>{BANNER.HIDE_BUTTON}</button>
          </div>
        </div>
      )}
    </div>
  );
}
