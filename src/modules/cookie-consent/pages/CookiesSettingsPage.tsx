import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../components';
import { consentApi, ApiError } from '../services/consent-api';
import type { CatalogEntry } from '../types';
import {
  PAGE_HEADINGS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  CONTENT,
  FORM_LABELS,
  BUTTON_TEXT,
  TABLE_HEADERS,
  CONFIRMATION_MESSAGES,
} from '../constants';
import PageTitle from '../../../components/PageTitle';

export function CookiesSettingsPage() {
  const { analytics, monitoring, updatePreferences, withdraw } = useCookieConsent();
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [analyticsChoice, setAnalyticsChoice] = useState<'accepted' | 'rejected'>(analytics ?? 'rejected');
  const [monitoringChoice, setMonitoringChoice] = useState<'accepted' | 'rejected'>(monitoring ?? 'rejected');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  useEffect(() => {
    consentApi.getCatalog()
      .then((data) => setCatalog(data.cookies))
      .catch(() => {
        // Fallback handles errors gracefully, no user-facing error needed
        setCatalog([]);
      })
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
    setShowWithdrawConfirm(false);

    try {
      await updatePreferences({ analytics: analyticsChoice, monitoring: monitoringChoice });
      setSaved(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (submitting) return;
    
    // First click: Show confirmation UI
    if (!showWithdrawConfirm) {
      setShowWithdrawConfirm(true);
      setSaved(false);
      setError(null);
      window.scrollTo(0, 0);
      return;
    }

    // Second click: Actually withdraw
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      await withdraw();
      setSaved(true);
      setShowWithdrawConfirm(false);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : ERROR_MESSAGES.SAVE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithdraw = () => {
    setShowWithdrawConfirm(false);
    setError(null);
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
      <PageTitle title="Cookie settings" />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{PAGE_HEADINGS.SETTINGS}</h1>

            {saved && (
              <div className="govuk-notification-banner govuk-notification-banner--success" role="alert">
                <div className="govuk-notification-banner__header">
                  <h2 className="govuk-notification-banner__title">{SUCCESS_MESSAGES.SUCCESS_TITLE}</h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">{SUCCESS_MESSAGES.PREFERENCES_SAVED}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{ERROR_MESSAGES.PROBLEM_TITLE}</h2>
                <div className="govuk-error-summary__body">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <p className="govuk-body">
              {CONTENT.INTRO_DESCRIPTION}
            </p>
            <p className="govuk-body">
              {CONTENT.USAGE_DESCRIPTION}
              Read our <Link to="/privacy" className="govuk-link">privacy notice</Link> to find out more about
              how we collect, use and store your personal information.
            </p>

            <h2 className="govuk-heading-m">{PAGE_HEADINGS.ESSENTIAL}</h2>
            <p className="govuk-body">
              {CONTENT.ESSENTIAL_DESCRIPTION}
            </p>

            <h2 className="govuk-heading-m">{PAGE_HEADINGS.ANALYTICS}</h2>
            <p className="govuk-body">
              {CONTENT.ANALYTICS_DESCRIPTION}
            </p>
            <p className="govuk-body">
              {CONTENT.ANALYTICS_INFO_HEADING}
            </p>
            <ul className="govuk-list govuk-list--bullet">
              {CONTENT.ANALYTICS_INFO_POINTS.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <h2 className="govuk-heading-m">{PAGE_HEADINGS.MONITORING}</h2>
            <p className="govuk-body">
              {CONTENT.MONITORING_DESCRIPTION}
            </p>

            <form onSubmit={handleSave}>
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-fieldset__heading">{FORM_LABELS.ANALYTICS_QUESTION}</h3>
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
                        {FORM_LABELS.YES}
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
                        {FORM_LABELS.NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-fieldset__heading">{FORM_LABELS.MONITORING_QUESTION}</h3>
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
                        {FORM_LABELS.YES}
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
                        {FORM_LABELS.NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              {showWithdrawConfirm && (
                <div className="govuk-warning-text govuk-!-margin-top-6">
                  <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    {CONFIRMATION_MESSAGES.WITHDRAW_CONFIRM}
                  </strong>
                </div>
              )}

              <div className="govuk-button-group">
                {!showWithdrawConfirm ? (
                  <>
                    <button type="submit" className="govuk-button" disabled={submitting}>
                      {submitting ? BUTTON_TEXT.SAVING : BUTTON_TEXT.SAVE}
                    </button>
                    <button type="button" className="govuk-button govuk-button--warning" disabled={submitting} onClick={handleWithdraw}>
                      {BUTTON_TEXT.WITHDRAW}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="govuk-button govuk-button--warning" 
                      disabled={submitting}
                      onClick={handleWithdraw}
                    >
                      {submitting ? 'Withdrawing…' : 'Confirm withdrawal'}
                    </button>
                    <button 
                      type="button" 
                      className="govuk-button govuk-button--secondary" 
                      disabled={submitting}
                      onClick={handleCancelWithdraw}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>

            {!loadingCatalog && catalog.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-8">{PAGE_HEADINGS.COOKIE_DETAILS}</h2>
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <h3 className="govuk-heading-s govuk-!-margin-top-6">
                      {category.charAt(0).toUpperCase() + category.slice(1)} cookies
                    </h3>
                    <table className="govuk-table">
                      <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                          <th scope="col" className="govuk-table__header">{TABLE_HEADERS.COOKIE_NAME}</th>
                          <th scope="col" className="govuk-table__header">{TABLE_HEADERS.PURPOSE}</th>
                          <th scope="col" className="govuk-table__header">{TABLE_HEADERS.EXPIRES}</th>
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
