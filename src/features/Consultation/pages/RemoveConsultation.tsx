import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { getConsultationDetailsById, removeConsultation } from '../../../services/consultationService';
import { ConsultationDetails } from '../../../types/ConsultationDetails';
import { createLogger } from '../../../utils/logger';
import PageTitle from '../../../components/PageTitle';

const logger = createLogger('RemoveConsultation');

const RemoveConsultation: React.FC = () => {
  const { applicationId, consultationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const consultationName = searchParams.get('consultationName') || 'Consultee';

  const [confirmRemove, setConfirmRemove] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch consultation details on mount
  useEffect(() => {
    const fetchConsultationDetails = async () => {
      if (!consultationId) {
        setIsLoading(false);
        return;
      }

      try {
        const details = await getConsultationDetailsById(consultationId);
        setConsultationDetails(details);
        setIsLoading(false);
      } catch (error) {
        logger.error('Error fetching consultation details:', error);
        setIsLoading(false);
      }
    };

    fetchConsultationDetails();
  }, [consultationId]);

  const handleSaveAndContinue = async () => {
    if (!confirmRemove) {
      setError('Select yes if you want to remove this consultation');
      return;
    }

    if (confirmRemove === 'yes') {
      try {
        // Call backend to update status to INACTIVE
        await removeConsultation(consultationId!);
        // Navigate back to manage consultation page
        navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
      } catch (error) {
        logger.error('Error removing consultation:', error);
        setError('Failed to remove consultation. Please try again.');
      }
    } else {
      // User selected 'No', just redirect back to manage consultation
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    }
  };

  return (
    <>
      <PageTitle title="Remove consultation" />
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
                Remove consultation
              </li>
            </ol>
          </nav>

                      {isLoading ? (
              <div className="govuk-body">Loading...</div>
            ) : (
              <>
                {error && (
                  <div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
                    <h2 className="govuk-error-summary__title" id="error-summary-title">
                      There is a problem
                    </h2>
                    <div className="govuk-error-summary__body">
                      <ul className="govuk-list govuk-error-summary__list">
                        <li>
                          <a href="#confirm-remove">{error}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <h1 className="govuk-heading-xl">Remove consultation</h1>

                <p className="govuk-body">
                  This will delete any information or documents you have added to this consultation.
                </p>

                {consultationDetails && (
                  <div className="govuk-summary-card govuk-!-margin-bottom-6">
                    <div className="govuk-summary-card__content">
                      <dl className="govuk-summary-list">
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key govuk-!-font-weight-bold">
                            {consultationDetails.otherConsultee || consultationDetails.consulteeOrganisationName || consultationName}
                          </dt>
                        </div>
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Status</dt>
                          <dd className="govuk-summary-list__value">
                            <strong className="govuk-tag govuk-tag--blue">
                              {consultationDetails.status || 'Not Started Yet'}
                            </strong>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                <form noValidate>
                  <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                        <h2 className="govuk-fieldset__heading">
                          Are you sure you want to remove this consultation?
                        </h2>
                      </legend>
                      {error && (
                        <p id="confirm-remove-error" className="govuk-error-message">
                          <span className="govuk-visually-hidden">Error:</span> {error}
                        </p>
                      )}
                      <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="confirm-remove-yes"
                            name="confirm-remove"
                            type="radio"
                            value="yes"
                            checked={confirmRemove === 'yes'}
                            onChange={(e) => {
                              setConfirmRemove(e.target.value);
                              setError('');
                            }}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="confirm-remove-yes">
                            Yes
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="confirm-remove-no"
                            name="confirm-remove"
                            type="radio"
                            value="no"
                            checked={confirmRemove === 'no'}
                            onChange={(e) => {
                              setConfirmRemove(e.target.value);
                              setError('');
                            }}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="confirm-remove-no">
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
              </>
            )}
                  </div>
      </div>
    </div>
    </>
  );
};

export default RemoveConsultation;
