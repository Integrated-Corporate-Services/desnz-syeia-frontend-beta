import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookiePreferencesStore } from '../store/useCookiePreferencesStore';
import { COOKIE_LIST, COOKIE_DESCRIPTIONS } from '../constants/cookieConstants';

const CookiesPage: React.FC = () => {
  const { 
    preferences, 
    updatePreferences 
  } = useCookiePreferencesStore();

  const [analyticsChoice, setAnalyticsChoice] = useState<'yes' | 'no'>('no');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setAnalyticsChoice(preferences.analytics ? 'yes' : 'no');
  }, [preferences.analytics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updatePreferences({
      analytics: analyticsChoice === 'yes'
    });

    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowSuccess(false), 10000);
  };

  const essentialCookies = COOKIE_LIST.filter(c => c.category === 'essential');
  const analyticsCookies = COOKIE_LIST.filter(c => c.category === 'analytics');

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs govuk-!-margin-top-4" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" to="/">
              Home
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Cookies
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {showSuccess && (
              <div
                className="govuk-notification-banner govuk-notification-banner--success"
                role="alert"
                aria-labelledby="govuk-notification-banner-title"
                data-module="govuk-notification-banner"
              >
                <div className="govuk-notification-banner__header">
                  <h2
                    className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title"
                  >
                    Success
                  </h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">
                    You've set your cookie preferences.{' '}
                    <Link className="govuk-notification-banner__link" to="/">
                      Go to homepage
                    </Link>
                  </p>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-l">Cookies</h1>

            <p className="govuk-body">
              Cookies are small files saved on your phone, tablet or computer when you visit a website.
            </p>

            <p className="govuk-body">
              We use cookies to make this site work and collect information about how you use our service.
            </p>

            <h2 className="govuk-heading-m">Essential cookies</h2>
            
            <p className="govuk-body">
              {COOKIE_DESCRIPTIONS.essential}
            </p>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Purpose</th>
                  <th scope="col" className="govuk-table__header">Expires</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {essentialCookies.map((cookie) => (
                  <tr key={cookie.name} className="govuk-table__row">
                    <td className="govuk-table__cell">{cookie.name}</td>
                    <td className="govuk-table__cell">{cookie.purpose}</td>
                    <td className="govuk-table__cell">{cookie.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {analyticsCookies.length > 0 && (
              <>
                <h2 className="govuk-heading-m">Analytics cookies (optional)</h2>
                
                <p className="govuk-body">
                  {COOKIE_DESCRIPTIONS.analytics}
                </p>

                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Name</th>
                      <th scope="col" className="govuk-table__header">Purpose</th>
                      <th scope="col" className="govuk-table__header">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {analyticsCookies.map((cookie) => (
                      <tr key={cookie.name} className="govuk-table__row">
                        <td className="govuk-table__cell">{cookie.name}</td>
                        <td className="govuk-table__cell">{cookie.purpose}</td>
                        <td className="govuk-table__cell">{cookie.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <form onSubmit={handleSubmit}>
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                        Do you want to accept analytics cookies?
                      </legend>
                      <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="analytics-yes"
                            name="analytics"
                            type="radio"
                            value="yes"
                            checked={analyticsChoice === 'yes'}
                            onChange={() => setAnalyticsChoice('yes')}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor="analytics-yes"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="analytics-no"
                            name="analytics"
                            type="radio"
                            value="no"
                            checked={analyticsChoice === 'no'}
                            onChange={() => setAnalyticsChoice('no')}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor="analytics-no"
                          >
                            No
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  <button
                    type="submit"
                    className="govuk-button"
                    data-module="govuk-button"
                  >
                    Save cookie settings
                  </button>
                </form>
              </>
            )}

            <noscript>
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  JavaScript is not enabled in your browser. You'll need to enable JavaScript to change your cookie settings.
                </strong>
              </div>
            </noscript>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiesPage;
