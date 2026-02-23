import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { useSensitiveAreaReview } from '../../../store/sensitiveAreaReviewStore';
import { SensitiveAreaReview } from '../../../types/sensitiveAreaReviewTypes';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';

const ReviewDocumentsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

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
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      errors.push('Upload at least one environmental and archaeological document');
    }

    return errors;
  };

  // Save handler
  const handleSaveReview = async (saveType: 'continue' | 'later' = 'continue') => {
    setFormErrors([]);
    setApiError(null);

    // Validate only on 'continue'
    if (saveType === 'continue') {
      const errors = validateForm();
      if (errors.length > 0) {
        setFormErrors(errors);
        // Scroll to error summary
        document.getElementById('error-summary')?.focus();
        return;
      }
    }

    // Build payload - preserve all existing data
    const payload: SensitiveAreaReview = {
      id: review?.id || '',
      application_id: applicationId || '',
      route_id: review?.route_id || '',
      settings_id: review?.settings_id || '',
      asset_presence_option_id: review?.asset_presence_option_id,
      other_sensitive_areas_note: review?.other_sensitive_areas_note || '',
      reviewed_by: review?.reviewed_by || '',
      reviewed_at: review?.reviewed_at || '',
      created_at: review?.created_at || '',
      updated_at: review?.updated_at || '',
      uploaded_files: uploadedFiles,
      application_documents: applicationDocuments,
    };

    // Enhanced logging for debugging
    console.log('=== ReviewDocumentsPage Save Debug ===');
    console.log('Payload structure:', {
      id: payload.id,
      application_id: payload.application_id,
      route_id: payload.route_id,
      settings_id: payload.settings_id,
      uploaded_files_count: payload.uploaded_files?.length || 0,
      application_documents_count: payload.application_documents?.length || 0,
    });
    console.log('Uploaded Files:', JSON.stringify(uploadedFiles, null, 2));
    console.log('Application Documents:', JSON.stringify(applicationDocuments, null, 2));
    console.log('Full Payload:', JSON.stringify(payload, null, 2));

    try {
      await saveReview(payload);

      // Always navigate to task list (this is the final page)
      navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
    } catch (err: unknown) {
      console.error('Save error:', err);
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
    console.log('[ReviewDocumentsPage] Files uploaded:', { 
      newFiles, 
      newDocuments,
      newFilesCount: newFiles.length,
      newDocsCount: newDocuments.length 
    });
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
    setFormErrors([]);
    setApiError(null);
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
      {/* Back link */}
      <Link 
        to={`${S37_BASE_URL}/${applicationId}/sensitive-area-review/poles`}
        className="govuk-back-link"
      >
        Back
      </Link>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds govuk-!-margin-top-4">
            {/* Error Summary */}
            {formErrors.length > 0 && (
              <div
                id="error-summary"
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
                data-module="govuk-error-summary"
              >
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {formErrors.map((error, index) => (
                      <li key={index}>
                        <a href="#file-upload-section">{error}</a>
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
              Upload environmental and archaeological documents (optional)
            </h2>

            {/* Instructions */}
            <p className="govuk-body">
              Upload documents that supports your application, such as:
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
                  formErrors.some((err) => err.includes('document'))
                    ? ' govuk-form-group--error'
                    : ''
                }`}
              >
                {/* Inline error message */}
                {formErrors.some((err) => err.includes('document')) && (
                  <span id="file-upload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    Upload at least one environmental and archaeological document
                  </span>
                )}

                <FileUpload
                  title="Upload a file"
                  prefix={`${applicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
                  uploadedFiles={uploadedFiles}
                  applicationId={applicationId || ''}
                  category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
                  addedBy={review?.reviewed_by || 'current-user'}
                  showDocumentsHeading={true}
                  onUploaded={handleFilesUploaded}
                  onDeleteFile={handleDeleteFile}
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
