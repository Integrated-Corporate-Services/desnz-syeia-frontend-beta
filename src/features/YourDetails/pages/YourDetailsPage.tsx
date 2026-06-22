import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUCCESS_BANNER_KEY } from '../constants/yourDetails';
import { getCurrentUserDetails, UserDetailsResponse } from '../services/yourDetailsService';

const YourDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [details, setDetails] = useState<UserDetailsResponse | null>(null);
  const [successFieldName, setSuccessFieldName] = useState<string>('');

  useEffect(() => {
    const storedBanner = sessionStorage.getItem(SUCCESS_BANNER_KEY);
    if (storedBanner) {
      setSuccessFieldName(storedBanner);
      sessionStorage.removeItem(SUCCESS_BANNER_KEY);
    }
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const result = await getCurrentUserDetails();
        setDetails(result);
      } catch {
        setError('Unable to load your details right now.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, []);

  const fullName = useMemo(() => {
    if (!details) {
      return '';
    }

    const computed = `${details.title ? `${details.title} ` : ''}${details.firstName} ${details.lastName}`.trim();
    return computed || details.fullName;
  }, [details]);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/application-dashboard');
  };

  return (
    <div className="govuk-width-container">
      <a href="#" className="govuk-back-link" onClick={handleBack}>
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content">
        {successFieldName && (
          <div className="govuk-notification-banner govuk-notification-banner--success govuk-!-margin-bottom-6" role="alert">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title">Success</h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                You have successfully updated your {successFieldName}.
              </p>
            </div>
          </div>
        )}

        <h1 className="govuk-heading-l govuk-!-margin-bottom-6">Your details</h1>

        {loading && <p className="govuk-body">Loading...</p>}

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && details && (
          <>
            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Full name</dt>
                <dd className="govuk-summary-list__value">{fullName}</dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to="/your-details/change-full-name">
                    Change
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Work address</dt>
                <dd className="govuk-summary-list__value">
                  {details.workAddress.line1 && <div>{details.workAddress.line1}</div>}
                  {details.workAddress.line2 && <div>{details.workAddress.line2}</div>}
                  {details.workAddress.townCity && <div>{details.workAddress.townCity}</div>}
                  {details.workAddress.county && <div>{details.workAddress.county}</div>}
                  {details.workAddress.postcode && <div>{details.workAddress.postcode}</div>}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to="/your-details/change-work-address">
                    Change
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Agency name</dt>
                <dd className="govuk-summary-list__value">{details.agencyName || '-'}</dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to="/your-details/change-agency-name">
                    Change
                  </Link>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Organisation(s)</dt>
                <dd className="govuk-summary-list__value">
                  {details.organisations?.approved?.length ? (
                    details.organisations.approved.map((org) => (
                      <div key={org.organisationId}>{org.organisationName}</div>
                    ))
                  ) : details.organisationName ? (
                    <div>{details.organisationName}</div>
                  ) : (
                    '-'
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to="/your-details/change-organisations">
                    Change
                  </Link>
                </dd>
              </div>
            </dl>

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-4">Your OneLogin details</h2>
            <p className="govuk-body govuk-!-margin-bottom-6">
              These are your OneLogin details which can only be changed in your OneLogin account.
            </p>

            <dl className="govuk-summary-list govuk-!-margin-bottom-8">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Email</dt>
                <dd className="govuk-summary-list__value">{details.oneLogin.email || '-'}</dd>
                <dd className="govuk-summary-list__actions" />
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Telephone</dt>
                <dd className="govuk-summary-list__value">{details.oneLogin.phone || '-'}</dd>
                <dd className="govuk-summary-list__actions" />
              </div>
            </dl>

            <p className="govuk-body">
              <Link className="govuk-link" to="/application-dashboard">
                Return to dashboard
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default YourDetailsPage;
