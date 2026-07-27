import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import SkipLink from '../../../components/SkipLink';

const ConsultationResponseInitialQuestion: React.FC = () => {
  const { applicationId, consultationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [responseReceived, setResponseReceived] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSaveAndContinue = () => {
    if (!responseReceived) {
      setError('Select yes if you have received a response from the consultee');
      return;
    }
    if (responseReceived === 'yes') {
      navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/response`);
    } else {
      navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/evidence-response-not-received`);
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
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
                Consultation response
              </li>
            </ol>
          </nav>

          <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
            {error && (
              <div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#responseReceived">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <h1 className="govuk-heading-l">Have you received a response from the consultee?</h1>
            <form noValidate>
              <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" aria-describedby={error ? 'responseReceived-error' : undefined}>
                  
                  {error && (
                    <p id="responseReceived-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="responseReceived-yes"
                        name="responseReceived"
                        type="radio"
                        value="yes"
                        checked={responseReceived === 'yes'}
                        onChange={(e) => {
                          setResponseReceived(e.target.value);
                          setError('');
                        }}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="responseReceived-yes">
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="responseReceived-no"
                        name="responseReceived"
                        type="radio"
                        value="no"
                        checked={responseReceived === 'no'}
                        onChange={(e) => {
                          setResponseReceived(e.target.value);
                          setError('');
                        }}
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="responseReceived-no">
                        No
                      </label>
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
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
    </>
  );
};

export default ConsultationResponseInitialQuestion;