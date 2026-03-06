import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getConsultationPack } from '../../../services/consultationPackService';
import { createLogger } from '../../../utils/logger';

const log = createLogger('DownloadLpaConsultationFormPage');

const DownloadLpaConsultationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();
  const { consultationId } = useParams();
  const [searchParams] = useSearchParams();
  const consultationName = searchParams.get('consultationName') || '';

  const [lpaName, setLpaName] = useState('');
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        if (!consultationId || !applicationId) return;
        
        const data = await getConsultationPack(consultationId, applicationId);
        const name = data?.consultation?.org_name || consultationName || '';
        setLpaName(name);
        
        log.debug('=== DOWNLOAD LPA CONSULTATION FORM PAGE ===');
        log.debug('LPA Name:', name);
        log.debug('==========================================');
      } catch (error) {
        log.error('Error fetching consultation details:', error);
      }
    };

    if (applicationId && consultationId) {
      fetchConsultationDetails();
    }
  }, [applicationId, consultationId, consultationName]);

  const handleDownloadForm = async () => {
    try {
      // TODO: Implement actual document download
      const response = await fetch(
        `/backend/api/applications/${applicationId}/consultations/${consultationId}/download-form`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LPA_Consultation_Form_${lpaName.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        log.error('Failed to download form');
        // For now, show alert - in production, use proper error handling
        alert('Download functionality will be implemented in the next phase.');
      }
    } catch (error) {
      log.error('Error downloading form:', error);
      alert('Download functionality will be implemented in the next phase.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isDeclarationChecked) {
      newErrors.declaration = 'You must confirm you have sent this consultation request';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Navigate to consultation details page
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForLater = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (error) {
      log.error('Error saving for later:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Breadcrumbs */}
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/task-list`}
              >
                Task list
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item">
              <Link 
                className="govuk-breadcrumbs__link" 
                to={`${S37_BASE_URL}/${applicationId}/consultation-details`}
              >
                Manage consultation
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="page">
              Download and send the LPA consultation form
            </li>
          </ol>
        </nav>

        {/* Error Summary */}
        {submitted && Object.keys(errors).length > 0 && (
          <div
            className="govuk-error-summary"
            role="alert"
            aria-labelledby="error-summary-title"
            tabIndex={-1}
          >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-caption-xl">
              <strong>{lpaName}</strong>
            </h2>

            <h1 className="govuk-heading-l">
              Download and send the LPA consultation form
            </h1>

            <h2 className="govuk-heading-m">
              Download the LPA consultation form
            </h2>

            <p className="govuk-body">
              This document includes:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>Part 1 with the answers you provided</li>
              <li>Parts 2 and 3 for the LPA to complete</li>
              <li>LPA's view on EIA screening section</li>
            </ul>

            <p className="govuk-body govuk-!-margin-bottom-6">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleDownloadForm}
              >
                Download LPA consultation form (Word, 83KB)
              </button>
            </p>

            <h2 className="govuk-heading-m">
              Next steps
            </h2>

            <p className="govuk-body">
              You must send the downloaded LPA consultation form to the consultee as part of your consultation request.
            </p>

            <p className="govuk-body">
              You will only be able to submit your application after you have uploaded all consultation responses.
            </p>

            <p className="govuk-body">
              If the consultee has not responded within 2 months after you sent the request, you may be able to complete your application without uploading their response.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-6">
              If you have any questions, you can contact{' '}
              <a 
                href="mailto:S37Consents@energysecurity.gov.uk" 
                className="govuk-link"
              >
                S37Consents@energysecurity.gov.uk
              </a>
              .
            </p>

            <form onSubmit={handleSaveAndContinue}>
              <div className={`govuk-form-group ${errors.declaration ? 'govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      Declaration
                    </h2>
                  </legend>
                  {errors.declaration && (
                    <p id="declaration-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.declaration}
                    </p>
                  )}
                  <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                    <div className="govuk-checkboxes__item">
                      <input
                        className={`govuk-checkboxes__input ${errors.declaration ? 'govuk-input--error' : ''}`}
                        id="declaration"
                        name="declaration"
                        type="checkbox"
                        checked={isDeclarationChecked}
                        onChange={(e) => {
                          setIsDeclarationChecked(e.target.checked);
                          if (errors.declaration) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.declaration;
                              return newErrors;
                            });
                          }
                          setSubmitted(false);
                        }}
                        aria-describedby={errors.declaration ? 'declaration-error' : undefined}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor="declaration">
                        Confirm you have sent this consultation request.
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save and continue'}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                  disabled={loading}
                >
                  Save for later
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DownloadLpaConsultationFormPage;
