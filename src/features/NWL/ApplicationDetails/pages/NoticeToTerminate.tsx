import React, { useState, useEffect } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { useApplicationNavigation, useApplicationDetailsData } from "../hooks";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload from "../../../../components/FileUpload";
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
} from "../constants/noticeToTerminateConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Notice to Terminate Page
 * Date of the Notice to Terminate and document upload
 */
const NoticeToTerminate: React.FC = () => {
  const appId = useGetApplicationId();
  const { navigateToTerminationPeriodExpired, navigateToTaskList } = useApplicationNavigation(appId || "");
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const { applicationDetails, updateFields, isLoading } = useApplicationDetailsData(appId);

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

  useEffect(() => {
    // Load saved data if it exists, or clear if it's been reset to null
    if (applicationDetails?.notice_to_terminate_date) {
      const parsed = parseDateFromAPI(applicationDetails.notice_to_terminate_date);
      if (parsed) {
        setDay(parsed.day);
        setMonth(parsed.month);
        setYear(parsed.year);
      }
    } else if (applicationDetails && applicationDetails.notice_to_terminate_date === null) {
      // Explicitly clear local state if notice_to_terminate_date was set to null
      setDay("");
      setMonth("");
      setYear("");
    }

    // Load uploaded documents
    if (applicationDetails?.notice_to_terminate_documents) {
      const docs = applicationDetails.notice_to_terminate_documents.map((doc) => ({
        documentId: doc.document_id,
        applicationId: appId || '',
        fileId: doc.document_id,
        category: 'notice_to_terminate',
        filename: doc.filename,
        addedBy: '',
        addedAt: doc.uploaded_at,
      }));
      setApplicationDocuments(docs as unknown as ApplicationDocument[]);
    }
  }, [applicationDetails, appId]);

  const validateForm = (): boolean => {
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
      newErrors.push(VALIDATION_MESSAGES.DATE_FUTURE);
      newFieldErrors.day = VALIDATION_MESSAGES.DATE_FUTURE;
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const documentIds = applicationDocuments.map(doc => doc.documentId);
      const formattedDate = formatDateForAPI(day, month, year);
      
      // This page is only for existing_lines flow
      // Pass page ID constant for page-specific validation
      await updateFields({
        type_of_use: 'existing_lines',
        notice_to_terminate_date: formattedDate,
        notice_to_terminate_document_ids: documentIds,
      }, APPLICATION_DETAILS_PAGE_IDS.NOTICE_TO_TERMINATE);

      navigateToTerminationPeriodExpired();
    } catch (error: unknown) {
      const err = error as Error;
      setErrors([err.message || 'Failed to save application details']);
    }
  };

  // const handleSaveForLater = () => {
  //   navigateToTaskList();
  // };

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

            {errors.length > 0 && (
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
                    {errors.map((error, idx) => (
                      <li key={idx}>
                        <a href="#notice-to-terminate-date-day">{error}</a>
                      </li>
                    ))}
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
                  <legend className="govuk-fieldset__legend">
                    <span className="govuk-label">
                      {LABELS.DATE_QUESTION}
                    </span>
                  </legend>
                  {hasDateError && (
                    <p id="notice-to-terminate-date-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>
                      {fieldErrors.day || fieldErrors.month || fieldErrors.year}
                    </p>
                  )}
                  <div className="govuk-date-input" id="notice-to-terminate-date">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="notice-to-terminate-date-day"
                        >
                          {LABELS.DAY_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.day ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-terminate-date-day"
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
                          htmlFor="notice-to-terminate-date-month"
                        >
                          {LABELS.MONTH_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.month ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-terminate-date-month"
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
                          htmlFor="notice-to-terminate-date-year"
                        >
                          {LABELS.YEAR_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                            fieldErrors.year ? "govuk-input--error" : ""
                          }`}
                          id="notice-to-terminate-date-year"
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

              {applicationDocuments.length > 0 && (
                <div className="govuk-form-group">
                  <p className="govuk-body govuk-!-font-weight-bold">
                    {LABELS.DOCUMENTS_UPLOADED}
                  </p>
                </div>
              )}

              {/* File upload */}
              <div className="govuk-form-group">
                <FileUpload
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_NOTICE_TO_TERMINATE}/`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_NOTICE_TO_TERMINATE}
                  addedBy={userId}
                  uploadedFiles={uploadedFiles}
                  applicationDocuments={applicationDocuments}
                  onUploaded={(newUploadedFiles: UploadedFile[], newProjectDocuments: ApplicationDocument[]) => {
                    setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                    setApplicationDocuments((prev) => [...prev, ...newProjectDocuments]);
                  }}
                />
              </div>

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Save and continue
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoticeToTerminate;
