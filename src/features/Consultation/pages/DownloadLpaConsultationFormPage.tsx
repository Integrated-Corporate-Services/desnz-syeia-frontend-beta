import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import { getConsultationPack } from '../../../services/consultationPackService';
import { getFormMetadata, downloadConsultationForm } from '../../../services/consultationFormMetadataService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import { createLogger } from '../../../utils/logger';

const log = createLogger('DownloadLpaConsultationFormPage');

/**
 * Format file size in bytes to human-readable format
 * Industry best practice: Show file size with appropriate unit (KB, MB)
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "83KB", "1.2MB")
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0KB';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

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
  const [documentMetadata, setDocumentMetadata] = useState<{
    fileSize: number;
    filename: string;
    exists: boolean;
  } | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

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

  // Fetch form metadata (now includes document metadata)
  // Only fetch when component is actually mounted and visible
  useEffect(() => {
    const fetchDocumentMetadata = async () => {
      try {
        if (!consultationId || !applicationId) {
          log.debug('Skipping metadata fetch: missing IDs');
          return;
        }
        
        // Additional check: only fetch if we're on the download-form page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/download-form')) {
          log.debug('Skipping metadata fetch: not on download-form page');
          return;
        }
        
        setLoadingMetadata(true);
        log.debug('Fetching form metadata (includes document metadata)...');
        
        // Use the merged form-metadata endpoint (includes document metadata)
        const formData = await getFormMetadata(applicationId, consultationId);

        if (formData?.document) {
          setDocumentMetadata({
            fileSize: formData.document.fileSize || 0,
            filename: formData.document.filename || 'LPA_Consultation_Form.docx',
            exists: formData.document.exists,
          });
          
          log.debug('Document metadata fetched from form-metadata:', formData.document);
        } else {
          log.warn('No document metadata in form-metadata response');
        }
      } catch (error) {
        log.error('Error fetching form metadata:', error);
      } finally {
        setLoadingMetadata(false);
      }
    };

    if (applicationId && consultationId) {
      fetchDocumentMetadata();
    }
  }, [applicationId, consultationId]);

  const handleDownloadForm = async () => {
    try {
      if (!applicationId || !consultationId) {
        log.error('Missing applicationId or consultationId');
        return;
      }

      log.debug('Downloading consultation form...');
      const blob = await downloadConsultationForm(applicationId, consultationId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LPA_Consultation_Form_${lpaName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      log.debug('Download completed successfully');
    } catch (error) {
      log.error('Error downloading form:', error);
      alert('Failed to download consultation form. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isDeclarationChecked) {
      newErrors.declaration = CONSULTATION_VALIDATION_MESSAGES.downloadLpaFormDeclaration.empty;
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
      // Navigate to consultation request page
      navigate(`${S37_BASE_URL}/${applicationId}/consultation/${consultationId}/consultation-request`);
    } catch (error) {
      log.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSaveForLater = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   try {
  //     navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
  //   } catch (error) {
  //     log.error('Error saving for later:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
            <div className="govuk-width-container">
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
        {submitted && Object.values(errors).some(Boolean) && (
          <div
            className="govuk-error-summary govuk-!-width-two-thirds"
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
            <h2 className="govuk-caption-xl govuk-!-margin-top-0">
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
                disabled={loadingMetadata}
              >
                {loadingMetadata
                  ? 'Loading document...'
                  : `Download LPA consultation form (Word, ${formatFileSize(documentMetadata?.fileSize || 0)})`}
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
                      Confirm download
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
                        Confirm you have downloaded the LPA consultation form.
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
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                  disabled={loading}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
          </div>
    </>
  );
};

export default DownloadLpaConsultationFormPage;
