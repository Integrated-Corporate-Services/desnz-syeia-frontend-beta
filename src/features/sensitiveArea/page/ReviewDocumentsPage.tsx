import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { SensitiveAreaReview } from '../../../types/sensitiveAreaReviewTypes';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { saveSensitiveAreaReview, getSensitiveAreaReview } from '../../../services/sensitiveAreaReviewService';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';

const ReviewDocumentsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [review, setReview] = useState<SensitiveAreaReview | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch existing review data on mount
  useEffect(() => {
    const fetchReview = async () => {
      if (!applicationId) return;

      setLoading(true);
      try {
        const data = await getSensitiveAreaReview(applicationId);
        const existingReview = data?.[0] || null;
        setReview(existingReview);

        // Pre-populate uploaded files if exists
        if (existingReview?.uploaded_files) {
          setUploadedFiles(existingReview.uploaded_files);
        }
        if (existingReview?.application_documents) {
          setApplicationDocuments(existingReview.application_documents);
        }
      } catch (err: any) {
        setApiError(err?.message || 'Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [applicationId]);

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

    setLoading(true);
    try {
      await saveSensitiveAreaReview(payload);

      // Always navigate to task list (this is the final page)
      navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save review');
      setFormErrors(['There was a problem saving your data. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    setApplicationDocuments((prev) => prev.filter((doc) => doc.fileId !== fileId));
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
    <div className="govuk-width-container">
      {/* Breadcrumb */}
      <div className="govuk-breadcrumbs">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a
              className="govuk-breadcrumbs__link"
              href={`${S37_BASE_URL}/${applicationId}/task-list`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`${S37_BASE_URL}/${applicationId}/task-list`);
              }}
            >
              Task list
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            Review documents
          </li>
        </ol>
      </div>

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
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
            {apiError && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">Error</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{apiError}</p>
                </div>
              </div>
            )}

            {/* Page Heading */}
            <h1 className="govuk-heading-l">
              Upload environmental and archaeological documents (optional)
            </h1>

            {/* Instructions */}
            <p className="govuk-body">
              You can upload documents to support sensitive area reviews. These may include:
            </p>

            <ul className="govuk-list govuk-list--bullet">
              <li>ecological reports</li>
              <li>heritage reports</li>
              <li>consultations with Natural England or Natural Resources Wales</li>
              <li>evidence of other consultations with statutory bodies</li>
            </ul>

            {/* Documents Uploaded Section */}
            {uploadedFiles.length > 0 && (
              <div className="govuk-inset-text" style={{ marginTop: '30px', marginBottom: '30px' }}>
                <h2 className="govuk-heading-m">Documents uploaded</h2>
                <ul className="govuk-list">
                  {uploadedFiles.map((file) => (
                    <li key={file.id} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="govuk-body" style={{ marginRight: '20px' }}>
                          {file.filename}
                        </span>
                        <button
                          type="button"
                          className="govuk-button govuk-button--warning govuk-button--small"
                          data-module="govuk-button"
                          onClick={() => handleDeleteFile(file.id)}
                          style={{ marginBottom: '0' }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* File Upload Section */}
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
                title="Environmental and archaeological documents"
                prefix={`${applicationId}/${FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}`}
                applicationId={applicationId || ''}
                category={FILE_CATEGORIES.SENSITIVE_AREA_REVIEW}
                addedBy="user" // TODO: Get from auth context
                uploadedFiles={uploadedFiles}
                onUploaded={(newFiles: UploadedFile[], newDocuments: ApplicationDocument[]) => {
                  setUploadedFiles((prev) => [...prev, ...newFiles]);
                  setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  setFormErrors([]); // Clear errors on successful upload
                }}
              />
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

              <button
                className="govuk-button govuk-button--secondary"
                data-module="govuk-button"
                onClick={() => handleSaveReview('later')}
                disabled={loading}
              >
                Save for later
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewDocumentsPage;
