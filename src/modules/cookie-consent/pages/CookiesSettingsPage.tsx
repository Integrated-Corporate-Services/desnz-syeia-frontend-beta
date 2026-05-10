import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../components';
import { consentApi, ApiError } from '../services/consent-api';
import type { CatalogEntry } from '../types';

export function CookiesSettingsPage() {
  const { analytics, monitoring, updatePreferences, withdraw } = useCookieConsent();
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [analyticsChoice, setAnalyticsChoice] = useState<'accepted' | 'rejected'>(analytics ?? 'rejected');
  const [monitoringChoice, setMonitoringChoice] = useState<'accepted' | 'rejected'>(monitoring ?? 'rejected');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    consentApi.getCatalog()
      .then((data) => setCatalog(data.cookies))
      .catch((err) => console.error('Failed to load cookie catalog:', err))
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (analytics) setAnalyticsChoice(analytics);
    if (monitoring) setMonitoringChoice(monitoring);
  }, [analytics, monitoring]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      await updatePreferences({ analytics: analyticsChoice, monitoring: monitoringChoice });
      setSaved(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (submitting) return;
    if (!window.confirm('This will reject all non-essential cookies. Continue?')) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      await withdraw();
      setSaved(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to withdraw consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const byCategoryOrdered = (cat: string) => {
    const order: Record<string, number> = { essential: 0, preference: 1, analytics: 2, monitoring: 3 };
    return order[cat] ?? 99;
  };

  const groups = catalog.reduce<Record<string, CatalogEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groups).sort((a, b) => byCategoryOrdered(a) - byCategoryOrdered(b));

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Cookies on this service</h1>

            {saved && (
              <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
                <div className="govuk-notification-banner__header">
                  <h2 className="govuk-notification-banner__title">Success</h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">Your cookie preferences have been saved.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <p className="govuk-body">
              Cookies are small files saved on your phone, tablet or computer when you visit a website.
            </p>
            <p className="govuk-body">
              We use cookies to make this service work and collect information about how you use our service.
              Read our <Link to="/privacy" className="govuk-link">privacy notice</Link> to find out more about
              how we collect, use and store your personal information.
            </p>

            <h2 className="govuk-heading-m">Essential cookies</h2>
            <p className="govuk-body">
              Essential cookies keep your information secure while you use this service. We do not need to ask
              permission to use them.
            </p>

            <h2 className="govuk-heading-m">Analytics cookies (optional)</h2>
            <p className="govuk-body">
              With your permission, we use Google Analytics to collect data about how you use this service.
              This information helps us to improve our service.
            </p>
            <p className="govuk-body">
              Google Analytics stores anonymised information about:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>how you got to this service</li>
              <li>the pages you visit and how long you spend on them</li>
              <li>what you click on while you're visiting the service</li>
            </ul>

            <h2 className="govuk-heading-m">Monitoring cookies (optional)</h2>
            <p className="govuk-body">
              With your permission, we use AWS CloudWatch RUM to monitor the performance and reliability of this service.
              This helps us identify and fix technical issues.
            </p>

            <form onSubmit={handleSave}>
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-fieldset__heading">Do you want to accept analytics cookies?</h3>
                  </legend>
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="analytics-yes"
                        name="analytics"
                        type="radio"
                        value="accepted"
                        checked={analyticsChoice === 'accepted'}
                        onChange={() => setAnalyticsChoice('accepted')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="analytics-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="analytics-no"
                        name="analytics"
                        type="radio"
                        value="rejected"
                        checked={analyticsChoice === 'rejected'}
                        onChange={() => setAnalyticsChoice('rejected')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="analytics-no">
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-fieldset__heading">Do you want to accept monitoring cookies?</h3>
                  </legend>
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="monitoring-yes"
                        name="monitoring"
                        type="radio"
                        value="accepted"
                        checked={monitoringChoice === 'accepted'}
                        onChange={() => setMonitoringChoice('accepted')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="monitoring-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="monitoring-no"
                        name="monitoring"
                        type="radio"
                        value="rejected"
                        checked={monitoringChoice === 'rejected'}
                        onChange={() => setMonitoringChoice('rejected')}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="monitoring-no">
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-button-group">
                <button type="submit" className="govuk-button" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save cookie settings'}
                </button>
                <button type="button" className="govuk-button govuk-button--warning" disabled={submitting} onClick={handleWithdraw}>
                  Withdraw all consent
                </button>
              </div>
            </form>

            {!loadingCatalog && catalog.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-8">Cookie details</h2>
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <h3 className="govuk-heading-s govuk-!-margin-top-6">
                      {category.charAt(0).toUpperCase() + category.slice(1)} cookies
                    </h3>
                    <table className="govuk-table">
                      <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                          <th scope="col" className="govuk-table__header">Cookie name</th>
                          <th scope="col" className="govuk-table__header">Purpose</th>
                          <th scope="col" className="govuk-table__header">Expires</th>
                        </tr>
                      </thead>
                      <tbody className="govuk-table__body">
                        {groups[category].map((cookie) => (
                          <tr key={cookie.name} className="govuk-table__row">
                            <td className="govuk-table__cell">{cookie.name}</td>
                            <td className="govuk-table__cell">{cookie.purpose}</td>
                            <td className="govuk-table__cell">{cookie.maxAge}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
