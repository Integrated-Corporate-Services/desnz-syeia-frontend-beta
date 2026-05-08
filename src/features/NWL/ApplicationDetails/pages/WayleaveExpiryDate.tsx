import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import FileUpload from "../../../../components/FileUpload";
import { UploadedFile, ApplicationDocument } from "../../../../types/fileUpload";
import {
  BREADCRUMBS,
  LABELS,
} from "../constants/wayleaveExpiryDateConstants";

/**
 * Wayleave Expiry Date Page
 * Confirm the expiry date and upload documents
 */
const WayleaveExpiryDate: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();
  const { user } = useAuthUser();
  const userId = user?.user_id;
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

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
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  useEffect(() => {
    // Load saved data if it exists
    if (application?.wayleave_expiry_date) {
      const date = new Date(application.wayleave_expiry_date);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Save to backend when API is ready
    navigate(`${NWL_BASE_URL}/${appId}/notice-to-remove`);
  };

  const handleSaveForLater = () => {
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  const hasDateError = fieldErrors.day || fieldErrors.month || fieldErrors.year;

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
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
                        <a href="#wayleave-expiry-date-day">{error}</a>
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
                    <p id="wayleave-expiry-date-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>
                      {fieldErrors.day || fieldErrors.month || fieldErrors.year}
                    </p>
                  )}
                  <div className="govuk-date-input" id="wayleave-expiry-date">
                    <div className="govuk-date-input__item">
                      <div className="govuk-form-group">
                        <label
                          className="govuk-label govuk-date-input__label"
                          htmlFor="wayleave-expiry-date-day"
                        >
                          {LABELS.DAY_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.day ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-expiry-date-day"
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
                          htmlFor="wayleave-expiry-date-month"
                        >
                          {LABELS.MONTH_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                            fieldErrors.month ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-expiry-date-month"
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
                          htmlFor="wayleave-expiry-date-year"
                        >
                          {LABELS.YEAR_LABEL}
                        </label>
                        <input
                          className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                            fieldErrors.year ? "govuk-input--error" : ""
                          }`}
                          id="wayleave-expiry-date-year"
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
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="file-upload">
                  {LABELS.UPLOAD_LABEL}
                </label>
                <div className="govuk-hint">
                  {LABELS.UPLOAD_HINT}
                </div>
                <FileUpload
                  title=""
                  prefix={`${appId}/${NWL_FILE_CATEGORIES.NWL_WAYLEAVE_EXPIRY}/`}
                  applicationId={appId}
                  category={NWL_FILE_CATEGORIES.NWL_WAYLEAVE_EXPIRY}
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
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WayleaveExpiryDate;
