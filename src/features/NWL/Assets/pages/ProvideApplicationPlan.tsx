import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { useApplicationId } from '../hooks';
import { BREADCRUMBS, LABELS, HINTS, FORM_ERRORS } from '../constants';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { NWL_FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';
import { createLogger } from '../../../../utils/logger';
import { nwlAssetService } from '../services/nwlAssetService';

const logger = createLogger('ProvideApplicationPlan');

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
    // Track newly uploaded files
    let newUploadedFiles: UploadedFile[] = [];
    let newApplicationDocuments: ApplicationDocument[] = [];

    // First, upload any pending files to S3
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        logger.debug('[handleSubmit] Uploading pending files', {
          applicationId,
          pendingFileCount: pendingFiles.length,
        });

        const result = await fileUploadRef.current.triggerUpload();
        if (result && result.uploadedFiles.length > 0) {
          newUploadedFiles = result.uploadedFiles;
          newApplicationDocuments = result.applicationDocuments;
          
          logger.info('[handleSubmit] Files uploaded to S3 successfully', {
            uploadedCount: result.uploadedFiles.length,
          });
        }
      } catch (uploadError) {
        logger.error('[handleSubmit] Error uploading files to S3', { error: uploadError });
        setError(FORM_ERRORS.FILE_UPLOAD_FAILED);
        setShowErrorSummary(true);
        return;
      }
    }

    // Combine existing and newly uploaded files
    const allUploadedFiles = [...uploadedFiles, ...newUploadedFiles];
    const allApplicationDocuments = [...applicationDocuments, ...newApplicationDocuments];

    // Validate that files exist
    if (allUploadedFiles.length === 0) {
      logger.warn('[handleSubmit] No files to save');
      setError(FORM_ERRORS.MISSING_FILE);
      setShowErrorSummary(true);
      return;
    }

    // Check for file validation errors
    if (fileValidationErrors.length > 0) {
      logger.warn('[handleSubmit] File validation errors', { errors: fileValidationErrors });
      setError(fileValidationErrors[0]);
      setShowErrorSummary(true);
      return;
    }

    // Save file metadata to database
    try {
      logger.debug('[handleSubmit] Saving file metadata to database', {
        applicationId,
        uploadedFilesCount: allUploadedFiles.length,
        documentsCount: allApplicationDocuments.length,
      });

      await nwlAssetService.saveApplicationPlanDocuments(
        applicationId!,
        allUploadedFiles,
        allApplicationDocuments
      );

      logger.info('[handleSubmit] File metadata saved to database successfully', {
        applicationId,
        documentCount: allUploadedFiles.length,
      });

      // Clear errors
      setError('');
      setShowErrorSummary(false);

      // Navigate to assets match plan page
      navigate(`${NWL_BASE_URL}/${applicationId}/plan-verification`);
    } catch (saveError) {
      logger.error('[handleSubmit] Error saving file metadata to database', {
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
      });
      setError('Failed to save documents. Please try again.');
      setShowErrorSummary(true);
    }
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
              category={NWL_FILE_CATEGORIES.NWL_PLAN_INFO}
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
