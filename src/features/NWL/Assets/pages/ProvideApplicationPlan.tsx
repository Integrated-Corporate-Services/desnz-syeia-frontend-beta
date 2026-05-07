import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { useApplicationId } from '../hooks';
import { BREADCRUMBS, LABELS, HINTS, FORM_ERRORS } from '../constants';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';

const ProvideApplicationPlan: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  const { user } = useAuthUserContext();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  const handleSubmit = async () => {
    // Track if we uploaded files in this submission
    let filesWereUploaded = false;

    // First, upload any pending files to S3
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        if (result && result.uploadedFiles.length > 0) {
          filesWereUploaded = true;
          // Files are already added to state via onUploaded callback
        }
      } catch (_error) {
        setError(FORM_ERRORS.FILE_UPLOAD_FAILED);
        setShowErrorSummary(true);
        return;
      }
    }

    // Validate that files exist (either uploaded or pending)
    if (!filesWereUploaded && uploadedFiles.length === 0 && pendingFiles.length === 0) {
      setError(FORM_ERRORS.MISSING_FILE);
      setShowErrorSummary(true);
      return;
    }

    // Check for file validation errors
    if (fileValidationErrors.length > 0) {
      setError(fileValidationErrors[0]);
      setShowErrorSummary(true);
      return;
    }

    // Clear errors
    setError('');
    setShowErrorSummary(false);

    // TODO: Save uploaded files to backend if needed

    // Navigate to assets match plan page
    navigate(`${NWL_BASE_URL}/${applicationId}/plan-verification`);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      {/* Breadcrumbs */}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${applicationId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            {BREADCRUMBS.ASSETS}
          </li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          
          <h1 className="govuk-heading-xl">{LABELS.APPLICATION_PLAN_TITLE}</h1>

          {/* Error Summary */}
          {showErrorSummary && (error || fileValidationErrors.length > 0) && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              tabIndex={-1}
              role="alert"
            >
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  <li>
                    <a href="#file-upload">{error || fileValidationErrors[0]}</a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="govuk-body">{HINTS.APPLICATION_PLAN_INTRO}</p>
          <ul className="govuk-list govuk-list--bullet">
            {HINTS.APPLICATION_PLAN_BULLETS.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>

          {/* File Upload Section */}
          <h2 className="govuk-heading-m">{LABELS.UPLOAD_SECTION_TITLE}</h2>
          <p className="govuk-body">{HINTS.FILE_UPLOAD_INFO}</p>

          <div className={`govuk-form-group ${error || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
            {(error || fileValidationErrors.length > 0) && (
              <p id="file-upload-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {error || fileValidationErrors[0]}
              </p>
            )}
            
            <FileUpload
              ref={fileUploadRef}
              title="Upload a file"
              showTitle={false}
              prefix={`${applicationId}/application-plan`}
              applicationId={applicationId}
              category={FILE_CATEGORIES.PLAN_INFO}
              addedBy={userId}
              uploadedFiles={uploadedFiles}
              applicationDocuments={applicationDocuments}
              showDocumentsHeading={false}
              onDeleteFile={handleDeleteFile}
              onPendingFilesChange={setPendingFiles}
              onValidationErrors={(errors) => {
                setFileValidationErrors(errors);
                if (errors.length > 0) {
                  setShowErrorSummary(true);
                }
              }}
              onUploaded={(newUploadedFiles, newProjectDocuments) => {
                setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
                setApplicationDocuments(prev => [...prev, ...newProjectDocuments]);
              }}
            />
          </div>

          {/* Form Actions */}
          <button
            type="button"
            className="govuk-button"
            data-module="govuk-button"
            onClick={handleSubmit}
          >
            {LABELS.CONTINUE}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProvideApplicationPlan;
