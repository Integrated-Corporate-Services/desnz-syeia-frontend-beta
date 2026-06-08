import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { useSensitiveAreaReview } from '../../../hooks/useSensitiveAreaReview';
import { SensitiveAreaReview } from '../../../types/sensitiveAreaReviewTypes';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { saveSensitiveReview } from '../../../services/sensitiveAreaService';
import { createLogger } from '../../../utils/logger';
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';

const logger = createLogger('ReviewDocumentsPage');

const ReviewDocumentsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Ref for file upload
  const fileUploadRef = useRef<FileUploadHandle>(null);

  // Use the store hook (consistent with SensitiveAreaReviewPage)
  const {
    review,
    loading,
    error: reviewError,
    fetchReview,
    saveReview
  } = useSensitiveAreaReview(applicationId || '');

  // Fetch existing review data on mount
  useEffect(() => {
    if (!applicationId) return;
    fetchReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // Bind review data to form if available (match SensitiveAreaReviewPage)
  useEffect(() => {
    if (review) {
      // Load previously uploaded files and documents if present
      if (Array.isArray(review.uploaded_files)) {
        setUploadedFiles(review.uploaded_files);
      }
      if (Array.isArray(review.application_documents)) {
        setApplicationDocuments(review.application_documents);
      }
    }
  }, [review]);

  // Validation function
  const validateForm = (newlyUploadedFiles: UploadedFile[] = []): string[] => {
    const errors: string[] = [];

    const totalFiles = (uploadedFiles?.length || 0) + newlyUploadedFiles.length + pendingFiles.length;
    if (totalFiles === 0) {
      errors.push('Upload at least one document');
    }

    return errors;
  };

  // Handle error click to focus file upload area
  const handleErrorClick = (errorType: string) => {
    if (errorType === 'fileUpload') {
      const fileUploadSection = document.querySelector('#file-upload-section');
      if (fileUploadSection) {
        // First scroll to the section smoothly
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to complete, then focus the upload container
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
            // Successfully focused file upload container
          } else {
            // Fallback: try to focus the file input directly
            const fileInput = fileUploadSection.querySelector('#file-upload-input');
            if (fileInput) {
              (fileInput as HTMLElement).focus();
              // Focused file input as fallback
            } else {
              // Could not find file upload elements to focus
            }
          }
        }, 300);
      } else {
        // Could not find file upload section
      }
    }
  };

  // Save handler
  const handleSaveReview = async (saveType: 'continue' | 'later' = 'continue') => {
    setFormErrors([]);
    setApiError(null);

    // Trigger file upload first if there are pending files (deferred upload pattern)
    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];
    
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
      } catch (err: any) {
        setApiError('Failed to upload files. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Validate only on 'continue'
    if (saveType === 'continue') {
      const errors = validateForm(newlyUploadedFiles);
      if (errors.length > 0 || fileValidationErrors.length > 0) {
        setFormErrors(errors);
        // Scroll to error summary
        document.getElementById('error-summary')?.focus();
        return;
      }
    }

    try {
      // Build payload - preserve all existing data
      const payload: SensitiveAreaReview = {
        id: review?.id || '',
        application_id: applicationId || '',
        route_id: review?.route_id || '',
        settings_id: review?.settings_id || '',
        asset_presence_option_id: review?.asset_presence_option_id,
        other_sensitive_areas_note: review?.other_sensitive_areas_note || '',
        add_other_areas_choice: review?.add_other_areas_choice || null,
        reviewed_by: review?.reviewed_by || '',
        reviewed_at: review?.reviewed_at || '',
        created_at: review?.created_at || '',
        updated_at: review?.updated_at || '',
        uploaded_files: [...uploadedFiles, ...newlyUploadedFiles],
        application_documents: [...applicationDocuments, ...newlyUploadedDocuments],
      };

      // Save the review
      await saveSensitiveReview(payload);

      // Navigate to next page
      const nextPageUrl = getNextPageUrl(TASK_NAMES.SENSITIVE_AREA_REVIEW, applicationId || '');
      navigate(nextPageUrl);
    } catch (err: unknown) {
      logger.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review';
      setApiError(errorMessage);
      setFormErrors(['There was a problem saving your data. Please try again.']);
    }
  };

  // Handle file deletion
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    setApplicationDocuments((prev) => prev.filter((doc) => doc.fileId !== fileId));
  };

  // Handle files uploaded from FileUpload component
  const handleFilesUploaded = (newFiles: UploadedFile[], newDocuments: ApplicationDocument[]) => {
    // Files uploaded successfully
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
    setFormErrors([]);
    setFileValidationErrors([]);
    setApiError(null);
  };

  // Handle file validation errors from FileUpload component
  const handleFileValidationErrors = (errors: string[]) => {
    // Handle validation errors
    setFileValidationErrors(errors);
    // Clear form-level errors when file validation errors are present
    if (errors.length === 0) {
      setFormErrors(prev => prev.filter(err => !err.includes('document')));
    }
  };

  if (loading && !review) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <main className="govuk-main-wrapper govuk-!-padding-top-2">
     {/* <div className="govuk-width-container"> */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="govuk-back-link"
      >
        Back
      </a>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds govuk-!-margin-top-4">
            {/* Error Summary */}
            {(formErrors.length > 0 || fileValidationErrors.length > 0) && (
              <div
                id="error-summary"
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
                data-module="govuk-error-summary"
                style={{ marginBottom: 32 }}
              >
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {fileValidationErrors.map((error, index) => (
                      <li key={`file-${index}`}>
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleErrorClick('fileUpload');
                        }}>
                          {error}
                        </a>
                      </li>
                    ))}
                    {formErrors.map((error, index) => (
                      <li key={`form-${index}`}>
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleErrorClick('fileUpload');
                        }}>
                          {error}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* API Error */}
            {(apiError || reviewError) && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">Error</h2>
                <div className="govuk-error-summary__body">
                  {apiError && <p className="govuk-body">{apiError}</p>}
                  {reviewError && <p className="govuk-body">{reviewError}</p>}
                </div>
              </div>
            )}

            {/* Page Heading */}
            <h2 className="govuk-heading-l">
              Upload environmental and archaeological documents
            </h2>

            {/* Instructions */}
            <p className="govuk-body">
              Upload documents that support your application, such as:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>ecological reports</li>
              <li>heritage reports</li>
              <li>consultations with Natural England or Natural Resources Wales</li>
              <li>evidence of other consultations with statutory bodies</li>
            </ul>

            {/* File Upload Section */}
            <div className="govuk-!-margin-top-6 govuk-!-margin-bottom-6">
              <div
                id="file-upload-section"
                className={`govuk-form-group${
                  (formErrors.some((err) => err.includes('document')) || fileValidationErrors.length > 0)
                    ? ' govuk-form-group--error'
                    : ''
                }`}
              >
                {/* Inline error messages */}
                {formErrors.some((err) => err.includes('document')) && (
                  <span id="file-upload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    Upload at least one document
                  </span>
                )}
                {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                ))}

                {/* Page-level heading shown when documents table is present (after upload) */}
                {applicationDocuments && applicationDocuments.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">Documents uploaded</h3>
                  </div>
                )}

                <FileUpload
                  ref={fileUploadRef}
                  title="Upload a file"
                  prefix={`${applicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  applicationId={applicationId || ''}
                  category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
                  addedBy={review?.reviewed_by || 'current-user'}
                  showDocumentsHeading={true}
                  uploadImmediately={true} 
                  onUploaded={handleFilesUploaded}
                  onDeleteFile={handleDeleteFile}
                  onValidationErrors={handleFileValidationErrors}
                  onPendingFilesChange={(files) => setPendingFiles(files)}
                />
              </div>
            </div>

            {/* Details Component */}
            <details className="govuk-details" data-module="govuk-details" style={{ marginTop: '30px' }}>
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  What information should be included in the documents?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">Your documents should include:</p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>
                    Evidence of ecological surveys conducted within sensitive areas, including species presence and habitat
                    assessments
                  </li>
                  <li>
                    Archaeological reports detailing any heritage assets or sites of historical significance affected by the
                    route
                  </li>
                  <li>
                    Consultation records with relevant statutory bodies such as Natural England, Natural Resources Wales, or
                    Historic England
                  </li>
                  <li>
                    Mitigation measures proposed to minimize environmental or archaeological impacts during construction and
                    operation
                  </li>
                </ul>
                <p className="govuk-body">
                  <strong>File requirements:</strong>
                </p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>Accepted formats: .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, .xlsx</li>
                  <li>Maximum file size: 25MB per file</li>
                  <li>Files cannot be password protected</li>
                </ul>
              </div>
            </details>

            {/* Buttons */}
            <div className="govuk-button-group" style={{ marginTop: '40px' }}>
              <button
                className="govuk-button"
                data-module="govuk-button"
                onClick={() => handleSaveReview('continue')}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save and continue'}
              </button>

              {/* <button
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={() => handleSaveReview('later')}
                disabled={loading}
              >
                Save for later
              </button> */}
            </div>
          </div>
        </div>
    {/* </div> */}
    </main>
  );
};

export default ReviewDocumentsPage;
