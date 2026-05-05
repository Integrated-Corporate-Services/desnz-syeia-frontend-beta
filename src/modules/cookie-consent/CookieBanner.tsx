import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from './CookieConsentProvider';

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
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="govuk-cookie-banner" data-nosnippet role="region" aria-label="Cookies on this service">
      {confirmed === null && (
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">Cookies on this service</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">We use some essential cookies to make this service work.</p>
                <p className="govuk-body">
                  We'd like to set additional cookies so we can remember your settings,
                  understand how you use the service and make improvements.
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
              {submitting ? 'Saving…' : 'Accept analytics cookies'}
            </button>
            <button type="button" className="govuk-button govuk-button--secondary" disabled={submitting}
              onClick={handle(rejectAll, 'rejected')}>
              {submitting ? 'Saving…' : 'Reject analytics cookies'}
            </button>
            <Link className="govuk-link" to="/cookies">View cookies</Link>
          </div>
        </div>
      )}
      {confirmed === 'accepted' && (
        <div className="govuk-cookie-banner__message govuk-width-container" role="alert">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">You've accepted analytics cookies</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">You can <Link className="govuk-link" to="/cookies">change your cookie settings</Link> at any time.</p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" onClick={() => setConfirmed(null)}>Hide cookie message</button>
          </div>
        </div>
      )}
      {confirmed === 'rejected' && (
        <div className="govuk-cookie-banner__message govuk-width-container" role="alert">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">You've rejected analytics cookies</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">You can <Link className="govuk-link" to="/cookies">change your cookie settings</Link> at any time.</p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" onClick={() => setConfirmed(null)}>Hide cookie message</button>
          </div>
        </div>
      )}
    </div>
  );
}
