import React, { useState, useEffect } from "react";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload from "../../../../components/FileUpload";
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
} from "../constants/wayleaveOfferConstants";
import { APPLICATION_DETAILS_PAGE_IDS } from "../constants/pageNames";

/**
 * Wayleave Notice Page (New Lines)
 * For new lines - collects wayleave notice date with 21-day validation
 * Navigates to StandardTermNewLines page after successful save
 */
const WayleaveOffer: React.FC = () => {
  const appId = useGetApplicationId();
  const { user } = useAuthUser();
  const userId = user?.user_id;
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
        fileId: doc.document_id,
        category: 'wayleave_offer',
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

    if (!validateForm()) {
      // If has21DayError, navigate to task list
      if (has21DayError) {
        navigateToTaskList();
      }
      return;
    }

    try {
      // Prepare document IDs from uploaded files
      const documentIds = applicationDocuments.map(doc => doc.documentId);

      // Update the existing record with wayleave notice details
      // This page is only for new_lines flow, so always set type_of_use to 'new_lines'
      // Pass page name constant for page-specific validation
      const formattedDate = formatDateForAPI(day, month, year);
      await updateFields({
        type_of_use: 'new_lines',
        wayleave_offer_date: formattedDate,
        wayleave_offer_document_ids: documentIds,
      }, APPLICATION_DETAILS_PAGE_IDS.WAYLEAVE_OFFER);

      // Navigate to standard term page
      navigateToStandardTerm();
    } catch (error: unknown) {
      const err = error as Error;
      setErrors([err.message || 'Failed to save application details']);
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
                        <a href="#wayleave-offer-date-day">{error}</a>
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
              <div className="govuk-form-group">
                <FileUpload
                  title={LABELS.UPLOAD_LABEL}
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_WAYLEAVE_OFFER}/`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_WAYLEAVE_OFFER}
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
