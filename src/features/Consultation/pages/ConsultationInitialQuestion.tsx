import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getConsultationDetailsById } from '../../../services/consultationService';
import { ConsultationType, isLpaJourney } from '../../../constants/consultationType';
import log from '../../../logger';

const ConsultationInitialQuestion: React.FC = () => {
  const { applicationId, consultationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const consultationName = searchParams.get('consultationName') || 'Consultee';

  const [alreadySent, setAlreadySent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch consultation details and redirect if not LPA
  useEffect(() => {
    const fetchConsultationDetails = async () => {
      if (!consultationId) {
        setIsLoading(false);
        return;
      }

      try {
        log.debug('[ConsultationInitialQuestion] Fetching consultation details', { consultationId });
        const consultationDetails = await getConsultationDetailsById(consultationId);
        
        // If consultation type is PUBLIC, redirect to PublicNoticesEvidence page
        if (consultationDetails?.consultationType === ConsultationType.PUBLIC) {
          log.info('[ConsultationInitialQuestion] Redirecting to public notices page for PUBLIC consultation');
          navigate(
            `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/public-notices`
          );
          return;
        }
        
        // If consultation type is not LPA or OTHER-LPA (does not follow LPA journey), redirect to ConsultationRequestPage
        if (!isLpaJourney(consultationDetails?.consultationType || '')) {
          log.info('[ConsultationInitialQuestion] Redirecting to consultation request page for non-LPA consultation');
          navigate(
            `${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request?consultationName=${encodeURIComponent(consultationName)}`
          );
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        log.error('[ConsultationInitialQuestion] Error fetching consultation details:', error);
        setIsLoading(false);
      }
    };

    fetchConsultationDetails();
  }, [consultationId, applicationId, consultationName, navigate]);

  const handleSaveAndContinue = () => {
    if (!alreadySent) {
      setError('Select yes if you have already sent a consultation request to this organisation');
      return;
    }

    if (alreadySent === 'yes') {
      // Navigate to provide evidence page (existing ConsultationRequestPage)
      navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request?consultationName=${encodeURIComponent(consultationName)}`);
    } else {
      // Navigate to ConsultationRequestNotSent page when "No" is selected
      navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/initial-consultation-question?consultationName=${encodeURIComponent(consultationName)}`);
    }
  };

  // const handleSaveForLater = () => {
  //   navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
  // };

  return (
    <div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-6">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
              <li className="govuk-breadcrumbs__list-item">
                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                  Task list
                </Link>
              </li>
              <li className="govuk-breadcrumbs__list-item">
                <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>
                  Manage consultation
                </Link>
              </li>
              <li className="govuk-breadcrumbs__list-item" aria-current="page">
                Consultation request
              </li>
            </ol>
          </nav>

          <main id="main-content">
            {isLoading ? (
              <div className="govuk-body">Loading...</div>
            ) : (
              <>
                {error && (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#already-sent">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <span className="govuk-caption-xl">{consultationName}</span>
            <h1 className="govuk-heading-xl">Consultation request</h1>

            <form noValidate>
              <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h3 className="govuk-fieldset__heading">
                      Have you already sent a consultation request to this organisation?
                    </h3>
                  </legend>
                  {error && (
                    <p id="already-sent-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="already-sent-yes"
                        name="already-sent"
                        type="radio"
                        value="yes"
                        checked={alreadySent === 'yes'}
                        onChange={(e) => {
                          setAlreadySent(e.target.value);
                          setError('');
                        }}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="already-sent-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="already-sent-no"
                        name="already-sent"
                        type="radio"
                        value="no"
                        checked={alreadySent === 'no'}
                        onChange={(e) => {
                          setAlreadySent(e.target.value);
                          setError('');
                        }}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="already-sent-no">
                        No
                      </label>
                      <div className="govuk-hint govuk-radios__hint">
                        We will help you create the consultation request.
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-button-group">
                <button
                  type="button"
                  className="govuk-button"
                  data-module="govuk-button"
                  onClick={handleSaveAndContinue}
                >
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
            </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ConsultationInitialQuestion;