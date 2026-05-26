import React, { useState, useEffect, useRef } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload, { FileUploadHandle } from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import {
  validateDate,
  validateDateNotInFuture,
  validateDateAtLeast21DaysAgo,
  formatDateForAPI,
  parseDateFromAPI,
  VALIDATION_MESSAGES,
} from "../services/applicationDetailsService";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
} from "../constants/wayleaveOfferConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Wayleave Notice Page (New Lines)
 * For new lines - collects wayleave notice date with 21-day validation
 * Navigates to StandardTermNewLines page after successful save
 */
const WayleaveOffer: React.FC = () => {
  const appId = useGetApplicationId();
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);
  const { navigateToTaskList, navigateToStandardTerm } = useApplicationNavigation(appId || "");

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
  const [has21DayError, setHas21DayError] = useState<boolean>(false);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const handleFileValidationErrors = (errors: string[]) => {
    // Always update from FileUpload component to clear errors when new files selected
    setFileValidationErrors(errors);
    if (errors.length === 0) {
      setErrors([]);
    }
  };

  const handleErrorClick = (errorType: string) => {
    if (errorType === 'fileUpload') {
      const fileUploadSection = document.querySelector('#file-upload');
      if (fileUploadSection) {
        fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
          if (uploadContainer) {
            (uploadContainer as HTMLElement).focus();
          } else {
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
    // Load saved data
    const savedDate = applicationDetails?.wayleave_offer_date;
    if (savedDate) {
      const parsed = parseDateFromAPI(savedDate);
      if (parsed) {
        setDay(parsed.day);
        setMonth(parsed.month);
        setYear(parsed.year);
      }
    }

    // Load uploaded documents
    if (applicationDetails?.wayleave_offer_documents) {
      // Map DocumentInfo to ApplicationDocument format
      const docs = applicationDetails.wayleave_offer_documents.map((doc) => ({
        documentId: doc.document_id,
        applicationId: appId || '',
        fileId: doc.file_id,
        category: NWL_FILE_CATEGORIES.NWL_WAYLEAVE_OFFER,
        title: doc.filename,
        filename: doc.filename,
        addedBy: '',
        addedAt: doc.uploaded_at,
      }));
      
      const files = applicationDetails.wayleave_offer_documents.map((doc) => ({
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

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    const newFieldErrors: typeof fieldErrors = {};

    // Validate date fields are filled
    if (!day || !month || !year) {
      newErrors.push(VALIDATION_MESSAGES.DATE_REQUIRED);
      if (!day) newFieldErrors.day = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!month) newFieldErrors.month = VALIDATION_MESSAGES.DATE_REQUIRED;
      if (!year) newFieldErrors.year = VALIDATION_MESSAGES.DATE_REQUIRED;
    } else if (!validateDate(day, month, year)) {
      newErrors.push(VALIDATION_MESSAGES.DATE_INVALID);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_INVALID;
    } else if (!validateDateNotInFuture(day, month, year)) {
      newErrors.push(VALIDATION_MESSAGES.DATE_FUTURE);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_FUTURE;
    } else if (!validateDateAtLeast21DaysAgo(day, month, year)) {
      newErrors.push(VALIDATION_MESSAGES.DATE_NOT_21_DAYS_AGO);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_NOT_21_DAYS_AGO;
      setHas21DayError(true);
    } else {
      setHas21DayError(false);
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let newlyUploadedFiles: UploadedFile[] = [];
    let newlyUploadedDocuments: ApplicationDocument[] = [];
    
    if (fileUploadRef.current && pendingFiles.length > 0) {
      try {
        const result = await fileUploadRef.current.triggerUpload();
        newlyUploadedFiles = result.uploadedFiles;
        newlyUploadedDocuments = result.applicationDocuments;
        
        setUploadedFiles(prev => [...prev, ...newlyUploadedFiles]);
        setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
        // Clear file validation errors after successful upload
        setFileValidationErrors([]);
      } catch {
        const errorMsg = 'Failed to upload files. Please try again.';
        setFileValidationErrors([errorMsg]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (!validateForm()) {
      if (has21DayError) {
        navigateToTaskList();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (fileValidationErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if at least one file is uploaded (mandatory)
    const allUploadedFiles = [...uploadedFiles, ...newlyUploadedFiles];
    if (allUploadedFiles.length === 0) {
      setFileValidationErrors([FORM_ERRORS.MISSING_FILE]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const allDocuments = [...applicationDocuments, ...newlyUploadedDocuments];
      const documentIds = allDocuments.map(doc => doc.documentId);

      const formattedDate = formatDateForAPI(day, month, year);
      await updateFields({
        type_of_use: 'new_lines',
        wayleave_offer_date: formattedDate,
        wayleave_offer_document_ids: documentIds,
        wayleave_offer_uploaded_files: allUploadedFiles,
        wayleave_offer_application_documents: allDocuments,
      }, APPLICATION_DETAILS_PAGE_IDS.WAYLEAVE_OFFER);

      navigateToStandardTerm();
    } catch (error: unknown) {
      const err = error as Error;
      setErrors([err.message || 'Failed to save application details']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasDateError = fieldErrors.day || fieldErrors.month || fieldErrors.year;

  return (
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

            {!has21DayError && (
              <p className="govuk-hint">{LABELS.PAGE_HINT}</p>
            )}

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
                      const isFileError = error.includes('upload') || error.includes('document');
                      return (
                        <li key={idx}>
                          <a 
                            href={isFileError ? "#" : "#wayleave-offer-date-day"}
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
                    <p id="wayleave-offer-date-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>
                      {fieldErrors.day || fieldErrors.month || fieldErrors.year}
                    </p>
                  )}
                  <div className="govuk-date-input" id="wayleave-offer-date">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="wayleave-offer-date-day"
                        >
                          {LABELS.DAY_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.day ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-offer-date-day"
                          name="day"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={day}
                          onChange={(e) => {
                            setDay(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                            setHas21DayError(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="wayleave-offer-date-month"
                        >
                          {LABELS.MONTH_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.month ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-offer-date-month"
                          name="month"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={month}
                          onChange={(e) => {
                            setMonth(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                            setHas21DayError(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="wayleave-offer-date-year"
                        >
                          {LABELS.YEAR_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                            fieldErrors.year ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-offer-date-year"
                          name="year"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={year}
                          onChange={(e) => {
                            setYear(e.target.value);
                            setErrors([]);
                            setFieldErrors({});
                            setHas21DayError(false);
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
                <FileUpload
                  ref={fileUploadRef}
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_WAYLEAVE_OFFER}/`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_WAYLEAVE_OFFER}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  showDocumentsHeading={true}
                  onDeleteFile={(fileId) => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
                    setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
                    setErrors([]);
                  }}
                  onValidationErrors={handleFileValidationErrors}
                  onPendingFilesChange={(files) => setPendingFiles(files)}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (has21DayError ? 'Return to tasklist' : 'Save and continue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WayleaveOffer;
