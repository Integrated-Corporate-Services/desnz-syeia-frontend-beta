import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookiePreferencesStore } from '../../store/useCookiePreferencesStore';

interface CookieBannerRejectedProps {
  onHide: () => void;
}

const CookieBannerRejected: React.FC<CookieBannerRejectedProps> = ({ onHide }) => {
  const { hideBanner } = useCookiePreferencesStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideBanner();
      onHide();
    }, 5000);

    return () => clearTimeout(timer);
  }, [hideBanner, onHide]);

  const handleHide = () => {
    hideBanner();
    onHide();
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
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You've rejected analytics cookies. You can{' '}
                <Link className="govuk-link" to="/cookies">
                  change your cookie settings
                </Link>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleHide}
          >
            Hide cookie message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBannerRejected;
