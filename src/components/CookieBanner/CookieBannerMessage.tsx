import React from 'react';
import { Link } from 'react-router-dom';
import { useCookiePreferencesStore } from '../../store/useCookiePreferencesStore';

interface CookieBannerMessageProps {
  onAccept: () => void;
  onReject: () => void;
}

const CookieBannerMessage: React.FC<CookieBannerMessageProps> = ({ 
  onAccept, 
  onReject 
}) => {
  const { acceptAllCookies, rejectNonEssentialCookies } = useCookiePreferencesStore();

  const handleAccept = () => {
    acceptAllCookies();
    onAccept();
  };

  const handleReject = () => {
    rejectNonEssentialCookies();
    onReject();
  };

  return (
    <div
      className="govuk-cookie-banner"
      data-nosnippet
      role="region"
      aria-label="Cookies on Submit your Energy Infrastructure Application"
    >
      <div className="govuk-cookie-banner__message govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-cookie-banner__heading govuk-heading-m">
              Cookies on Submit your Energy Infrastructure Application
            </h2>
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                We use some essential cookies to make this service work.
              </p>
              <p className="govuk-body">
                We'd also like to use analytics cookies so we can understand how you use the service and make improvements.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleAccept}
          >
            Accept analytics cookies
          </button>
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleReject}
          >
            Reject analytics cookies
          </button>
          <Link className="govuk-link" to="/cookies">
            View cookies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieBannerMessage;
