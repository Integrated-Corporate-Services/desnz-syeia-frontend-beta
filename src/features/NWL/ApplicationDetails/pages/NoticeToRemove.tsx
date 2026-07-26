import React, { useState, useEffect, useRef } from "react";
import SkipLink from '../../../../components/SkipLink';
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload, { FileUploadHandle, FileUploadGate, DEFAULT_FILE_UPLOAD_GATE } from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import {
  validateDate,
  validateDateNotInFuture,
  formatDateForAPI,
  parseDateFromAPI,
  VALIDATION_MESSAGES,
} from "../services/applicationDetailsService";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
} from "../constants/noticeToRemoveConstants";
import { SHARED_UPLOAD_LABELS } from "../constants/sharedConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Notice to Remove Page
 * Provide the Notice to Remove date and upload documents
 */
const NoticeToRemove: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToNoticeToRemoveClear, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { applicationDetails, updateFields } = useApplicationDetailsData(appId);

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    day?: string;
    month?: string;
    year?: string;
  }>({});
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  // Ref for file upload
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [uploadGate, setUploadGate] = useState<FileUploadGate>(DEFAULT_FILE_UPLOAD_GATE);

  // Handle file validation errors from FileUpload component
  const handleFileValidationErrors = (errors: string[]) => {
    // Always update from FileUpload component to clear errors when new files selected
    setFileValidationErrors(errors);
    // Don't clear main errors array - it should be managed independently
  };

  // Handle error click to focus file upload area
  const handleErrorClick = (errorType: string) => {
    if (errorType === 'fileUpload') {
      const fileUploadSection = document.querySelector('#file-upload');
      if (fileUploadSection) {
        // First scroll to the section smoothly
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll to complete, then focus the upload container
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
          } else {
            // Fallback: try to focus the file input directly
            const fileInput = fileUploadSection.querySelector('#file-upload-input');
            if (fileInput) {
              (fileInput as HTMLElement).focus();
            }
          }
        }, 300);
      }
    }
  };

  useEffect(() => {
    // Load saved data if it exists, or clear if it's been reset to null
    if (applicationDetails?.notice_to_remove_date) {
      const parsed = parseDateFromAPI(applicationDetails.notice_to_remove_date);
      if (parsed) {
        setDay(parsed.day);
        setMonth(parsed.month);
        setYear(parsed.year);
      }
    } else if (applicationDetails && applicationDetails.notice_to_remove_date === null) {
      // Explicitly clear local state if notice_to_remove_date was set to null
      setDay("");
      setMonth("");
      setYear("");
    }

    // Load uploaded documents and files
    if (applicationDetails?.notice_to_remove_documents) {
      const docs = applicationDetails.notice_to_remove_documents.map((doc) => ({
        documentId: doc.document_id,
        applicationId: appId || '',
        fileId: doc.file_id,
        category: NWL_FILE_CATEGORIES.NWL_NOTICE_TO_REMOVE,
        title: doc.filename,
        filename: doc.filename,
        addedBy: '',
        addedAt: doc.uploaded_at,
      }));
      
      const files = applicationDetails.notice_to_remove_documents.map((doc) => ({
        id: doc.file_id,
        storageProvider: 'aws_s3',
        s3Key: doc.s3_key,
        bucketName: '',
        virtualFolder: doc.s3_key.split('/').slice(0, -1).join('/'),
        filename: doc.filename,
        fileContentType: doc.file_content_type || 'application/octet-stream',
        fileSizeBytes: Number(doc.file_size),
        uploadedAtTimestamp: doc.uploaded_at,
      }));
      
      setApplicationDocuments(docs as unknown as ApplicationDocument[]);
      setUploadedFiles(files as unknown as UploadedFile[]);
    }
  }, [applicationDetails, appId]);

  const validateForm = (uploadedFilesCount: number, applicationDocsCount: number): boolean => {
    const newErrors: string[] = [];
    const newFieldErrors: typeof fieldErrors = {};

    if (!day || !month || !year) {
      newErrors.push(VALIDATION_MESSAGES.DATE_REQUIRED);
      if (!day) newFieldErrors.day = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!month) newFieldErrors.month = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!year) newFieldErrors.year = VALIDATION_MESSAGES.DATE_REQUIRED;
    } else if (!validateDate(day, month, year)) {
      newErrors.push(VALIDATION_MESSAGES.DATE_INVALID);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_INVALID;
    } else if (!validateDateNotInFuture(day, month, year)) {
      newErrors.push(FORM_ERRORS.FUTURE_DATE);
      newFieldErrors.day = FORM_ERRORS.FUTURE_DATE;
    }

    // Validate files
    const totalFiles = uploadedFilesCount + applicationDocsCount;
    if (totalFiles === 0) {
      //newErrors.push(FORM_ERRORS.NO_FILES);
      // Set file validation errors for inline display
      setFileValidationErrors([FORM_ERRORS.NO_FILES]);
    } else {
      // Clear file validation errors if files are present
      setFileValidationErrors([]);
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger file upload first if there are pending files (deferred upload pattern)
    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];
    const fileErrors: string[] = [];
    
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
        
        // Update state immediately so files remain visible even if validation fails
        setUploadedFiles(prev => [...prev, ...newlyUploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
        // Clear file validation errors after successful upload
        setFileValidationErrors([]);
      } catch {
        const errorMsg = 'Failed to upload files. Please try again.';
        fileErrors.push(errorMsg);
        setFileValidationErrors([errorMsg]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Validate form with updated file counts
    const totalUploadedFiles = uploadedFiles.length + newlyUploadedFiles.length;
    const totalApplicationDocs = applicationDocuments.length + newlyUploadedDocuments.length;
    
    // Build validation errors locally without relying on async state
    const newErrors: string[] = [];
    const newFieldErrors: typeof fieldErrors = {};

    // Validate date
    if (!day || !month || !year) {
      newErrors.push(VALIDATION_MESSAGES.DATE_REQUIRED);
      if (!day) newFieldErrors.day = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!month) newFieldErrors.month = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!year) newFieldErrors.year = VALIDATION_MESSAGES.DATE_REQUIRED;
    } else if (!validateDate(day, month, year)) {
      newErrors.push(VALIDATION_MESSAGES.DATE_INVALID);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_INVALID;
    } else if (!validateDateNotInFuture(day, month, year)) {
      newErrors.push(FORM_ERRORS.FUTURE_DATE);
      newFieldErrors.day = FORM_ERRORS.FUTURE_DATE;
    }

    // Validate files
    const totalFiles = totalUploadedFiles + totalApplicationDocs;
    if (totalFiles === 0) {
      fileErrors.push(FORM_ERRORS.NO_FILES);
    }

    // Set all errors at once
    setErrors(newErrors);
    setFieldErrors(newFieldErrors);
    if (fileErrors.length > 0) {
      setFileValidationErrors(fileErrors);
    } else {
      setFileValidationErrors([]);
    }

    // If there are any validation errors, stay on page
    if (newErrors.length > 0 || fileErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
      const allDocuments = [...applicationDocuments, ...newlyUploadedDocuments];
      const documentIds = allDocuments.map(doc => doc.documentId);
      const formattedDate = formatDateForAPI(day, month, year);
      
      // This page is only for existing_lines flow
      // Pass page name constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        notice_to_remove_date: formattedDate,
        notice_to_remove_document_ids: documentIds,
        notice_to_remove_uploaded_files: allUploadedFiles,
        notice_to_remove_application_documents: allDocuments,
      }, APPLICATION_DETAILS_PAGE_IDS.NOTICE_TO_REMOVE);

      navigateToNoticeToRemoveClear();
    } catch (error: unknown) {
      const err = error as Error;
      setErrors([err.message || 'Failed to save application details']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasDateError = fieldErrors.day || fieldErrors.month || fieldErrors.year;

  return (
    <>
      <SkipLink />
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a
              className="govuk-breadcrumbs__link"
              href="#"
              onClick={(e) => { e.preventDefault(); navigateToTaskList(); }}
            >
              {BREADCRUMBS.TASK_LIST}
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.APPLICATION_DETAILS}
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

            {(errors.length > 0 || fileValidationErrors.length > 0) && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
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
                    {errors.map((error, idx) => {
                      // Check if this is a file-related error
                      const isFileError = error.includes('upload') || error.includes('document');
                      return (
                        <li key={idx}>
                          <a 
                            href={isFileError ? "#" : "#notice-to-remove-date-day"}
                            onClick={isFileError ? (e) => {
                              e.preventDefault();
                              handleErrorClick('fileUpload');
                            } : undefined}
                          >
                            {error}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Date input */}
              <div
                className={`govuk-form-group ${
                  hasDateError ? "govuk-form-group--error" : ""
                }`}
              >
                <fieldset className="govuk-fieldset" role="group">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    <span className="govuk-label govuk-label--s">
                      {LABELS.DATE_LABEL}
                    </span>
                  </legend>
                  {hasDateError && (
                    <p id="notice-to-remove-date-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>
                      {fieldErrors.day || fieldErrors.month || fieldErrors.year}
                    </p>
                  )}
                  <div className="govuk-date-input" id="notice-to-remove-date">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="notice-to-remove-date-day"
                        >
                          {LABELS.DAY_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.day ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-remove-date-day"
                          name="day"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={day}
                          onChange={(e) => {
                            setDay(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="notice-to-remove-date-month"
                        >
                          {LABELS.MONTH_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.month ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-remove-date-month"
                          name="month"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={month}
                          onChange={(e) => {
                            setMonth(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="notice-to-remove-date-year"
                        >
                          {LABELS.YEAR_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                            fieldErrors.year ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-remove-date-year"
                          name="year"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={year}
                          onChange={(e) => {
                            setYear(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* File upload */}
              <div className={`govuk-form-group ${fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''}`} id="file-upload">
                {fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
                  <p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {error}
                  </p>
                ))}
                
                {uploadedFiles && uploadedFiles.length > 0 && (
                  <div className="govuk-!-margin-top-2">
                    <h3 className="govuk-heading-s">{SHARED_UPLOAD_LABELS.DOCUMENTS_UPLOADED}</h3>
                  </div>
                )}
                
                <FileUpload
                  ref={fileUploadRef}
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_NOTICE_TO_REMOVE}`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_NOTICE_TO_REMOVE}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  showDocumentsHeading={true}
                  uploadImmediately={true}
                  onPendingFilesChange={setPendingFiles}
                  onDeleteFile={(fileId) => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
                    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
                    setErrors([]);
                    setFileValidationErrors([]);
                  }}
                  onUploaded={(newUploadedFiles, newDocuments) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                  }}
                  onValidationErrors={handleFileValidationErrors}
                  onUploadGateChange={setUploadGate}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={!uploadGate.canContinue}
                >
                  Save and continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default NoticeToRemove;
