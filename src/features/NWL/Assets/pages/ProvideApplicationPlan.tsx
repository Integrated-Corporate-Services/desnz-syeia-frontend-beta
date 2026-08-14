import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { useApplicationId, useAssetsData } from '../hooks';
import { BREADCRUMBS, LABELS, HINTS, FORM_ERRORS, MESSAGES } from '../constants';
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
  
  // Fetch existing assets data
  const { assetsData, loading } = useAssetsData(applicationId);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Load existing files when assetsData is available
  useEffect(() => {
    if (assetsData && !loading) {
      logger.debug('[ProvideApplicationPlan] Loading existing files', {
        uploadedFilesCount: assetsData.uploadedFiles?.length || 0,
        documentsCount: assetsData.applicationDocuments?.length || 0,
      });

      if (assetsData.uploadedFiles && assetsData.uploadedFiles.length > 0) {
        setUploadedFiles(assetsData.uploadedFiles);
      }

      if (assetsData.applicationDocuments && assetsData.applicationDocuments.length > 0) {
        setApplicationDocuments(assetsData.applicationDocuments);
      }
    }
  }, [assetsData, loading]);

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
  };

  const handleSubmit = async () => {
    if (fileUploadRef.current?.isBusy()) {
      const scanInProgressMessage = 'File scan is in progress. Wait for the scan to finish before continuing.';
      setFileValidationErrors([scanInProgressMessage]);
      setError(scanInProgressMessage);
      setShowErrorSummary(true);
      setTimeout(() => {
        setError(prev => (prev === scanInProgressMessage ? '' : prev));
        setFileValidationErrors(prev => (prev.length === 1 && prev[0] === scanInProgressMessage) ? [] : prev);
      }, 6000);
      return;
    }

    // Track newly uploaded files
    let newUploadedFiles: UploadedFile[] = [];
    let newApplicationDocuments: ApplicationDocument[] = [];

    if (fileUploadRef.current) {
      try {
        logger.debug('[handleSubmit] Uploading pending files', {
          applicationId,
          pendingFileCount: pendingFiles.length,
        });

        const result = await fileUploadRef.current.triggerUpload();
        if (result.scanErrors.length > 0) {
          setFileValidationErrors(result.scanErrors);
          setError(result.scanErrors[0]);
          setShowErrorSummary(true);
          return;
        }
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
    <>
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

          {/* Loading State */}
          {loading && (
            <p className="govuk-body">Loading existing files...</p>
          )}

          {/* Error Summary */}
          {!loading && showErrorSummary && (error || fileValidationErrors.length > 0) && (
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
          {!loading && (
            <>

              <p className="govuk-body">{HINTS.APPLICATION_PLAN_INTRO}</p>
              <p className="govuk-body">{HINTS.APPLICATION_PLAN_MUST_SHOW_HEADING}</p>
              <ul className="govuk-list govuk-list--bullet">
                {HINTS.APPLICATION_PLAN_BULLETS.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
              <p className="govuk-body">
                <a
                  href={HINTS.APPLICATION_PLAN_GUIDANCE_LINK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {HINTS.APPLICATION_PLAN_GUIDANCE_LINK_TEXT}
                </a>
              </p>

              {/* File Upload Section */}
              <div className={`govuk-form-group ${error || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                {(error || fileValidationErrors.length > 0) && (
                  <p id="file-upload-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error || fileValidationErrors[0]}
                  </p>
                )}
                
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">{MESSAGES.DOCUMENTS_UPLOADED}</h3>
                  </div>
                )}
                
                <FileUpload
                  key={`file-upload-${applicationId}-${assetsData?.metadata_id || 'new'}`}
                  ref={fileUploadRef}
                  title={LABELS.UPLOAD_SECTION_TITLE}
                  showTitle={true}
                  prefix={`${applicationId}/application-plan`}
                  applicationId={applicationId}
                  category={NWL_FILE_CATEGORIES.NWL_PLAN_INFO}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  showDocumentsHeading={true}
                  uploadImmediately={true}
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
            </>
          )}

          {/* Form Actions */}
          {!loading && (
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={handleSubmit}
            >
              {LABELS.CONTINUE}
            </button>
          )}
        </div>
      </div>
        </>
  );
};

export default ProvideApplicationPlan;
