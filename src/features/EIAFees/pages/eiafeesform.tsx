import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import RadioGroup from "../component/RadioGroup";
import CheckboxGroup from "../component/CheckboxGroup";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useEiaFeesStore } from '../../../store/useEiaFeesStore';

// Helper to get CSRF token from cookie
function getCsrfToken() {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )_csrf=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
  }
  return '';
}

const EIAFeesForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const application = useApplicationStore((state) => state.application);
  // Helper to get applicationId from store, params, or query string
  const getApplicationId = () => {
    if (application && application.application_id)
      return application.application_id;
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(location.search);
      const idFromQuery =
        searchParams.get("id") || searchParams.get("applicationId");
      if (idFromQuery) return idFromQuery;
    }
    return "";
  };
  const applicationId = getApplicationId();

  // State for fetched EIA Fees
  const eiaFees = useEiaFeesStore((state) => state.eiaFees);
  const fetchEiaFees = useEiaFeesStore((state) => state.fetchEiaFees);
  const createEiaFees = useEiaFeesStore((state) => state.createEiaFees);
  const updateEiaFees = useEiaFeesStore((state) => state.updateEiaFees);
  type FormState = {
    isEiaDevelopment: boolean;
    requiresFullEia: string;
    screeningOnly: string;
    eiaFeeId?: string;
    applicationId?: string;
  };
  const [form, setForm] = useState<FormState>({
    isEiaDevelopment: false,
    requiresFullEia: "",
    screeningOnly: "",
    eiaFeeId: undefined,
    applicationId: undefined,
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch EIA Fees on mount
  useEffect(() => {
    if (!applicationId) return;
    fetchEiaFees(applicationId);
  }, [applicationId, fetchEiaFees]);

  // Populate form when EIA Fees are loaded
  useEffect(() => {
    if (eiaFees) {
      setForm({
        isEiaDevelopment: !!eiaFees.isEiaDevelopment,
        requiresFullEia: eiaFees.requiresFullEia ? "true" : "false",
        screeningOnly: eiaFees.screeningOnly ? "true" : "false",
        eiaFeeId: eiaFees.eiaFeeId,
        applicationId: eiaFees.applicationId,
      });
    }
  }, [eiaFees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors([]);
    setApiError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { field: string; message: string }[] = [];
    // Validation logic:
    if (!form.requiresFullEia) {
      newErrors.push({
        field: "requiresFullEia",
        message:
          "Select yes or no to the Environmental Impact Assessment question",
      });
    } else if (form.requiresFullEia === "true") {
      if (!form.screeningOnly) {
        newErrors.push({
          field: "screeningOnly",
          message: "Select yes or no to confirm the EIA fee",
        });
      } else if (form.screeningOnly === "false") {
        newErrors.push({
          field: "requiresFullEia",
          message: "Select no to the Environmental Impact Assessment question",
        });
      }
    }
    setErrors(newErrors);
    setApiError(null);
    setSuccess(false);
    if (newErrors.length === 0) {
      setLoading(true);
      try {
        // Compose payload for backend
        type EiaPayload = {
          applicationId: string;
          isEiaDevelopment: boolean;
          requiresFullEia: boolean;
          screeningOnly: boolean;
          updatedAt: string;
          updatedBy: string;
          eiaId?: string;
          createdAt?: string;
          createdBy?: string;
        };
        const payload: EiaPayload = {
          applicationId: applicationId,
          isEiaDevelopment: form.isEiaDevelopment,
          requiresFullEia: form.requiresFullEia === "true", // maps first question
          screeningOnly: form.screeningOnly === "true", // maps second question
          updatedAt: new Date().toISOString(),
          updatedBy: "system",
        };
        if (eiaFees && eiaFees.eiaFeeId) {
          // Update existing EIA Fee using store (PUT)
          await updateEiaFees({
            eiaFeeId: eiaFees.eiaFeeId,
            applicationId: payload.applicationId,
            isEiaDevelopment: payload.isEiaDevelopment,
            requiresFullEia: payload.requiresFullEia,
            screeningOnly: payload.screeningOnly,
            updatedAt: payload.updatedAt,
            updatedBy: payload.updatedBy
          });
        } else {
          // Create new EIA Fee using store (POST)
          const eiaId = crypto.randomUUID();
          const createdAt = new Date().toISOString();
          const createdBy = "system";
          await createEiaFees({
            eiaId,
            applicationId: payload.applicationId,
            isEiaDevelopment: payload.isEiaDevelopment,
            requiresFullEia: payload.requiresFullEia,
            screeningOnly: payload.screeningOnly,
            createdAt,
            updatedAt: payload.updatedAt,
            createdBy,
            updatedBy: payload.updatedBy
          });
        }
        setSuccess(true);
        setForm({
          isEiaDevelopment: false,
          requiresFullEia: "",
          screeningOnly: "",
          eiaFeeId: undefined,
          applicationId: undefined,
        });
        // Redirect to tasklist page after success
        const redirectId = payload.applicationId;
        navigate(`/task-list?id=${redirectId}`);
      } catch {
        setApiError("Failed to submit EIA Fees. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const hasError = (field: string) => errors.some((err) => err.field === field);
  const getErrorMessage = (field: string) => {
    const err = errors.find((e) => e.field === field);
    return err ? err.message : "";
  };

  return (
    <div className="govuk-width-container">
      {success && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
        >
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            EIA Fees submitted successfully.
          </div>
        </div>
      )}
      {apiError && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">{apiError}</div>
        </div>
      )}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a
              className="govuk-breadcrumbs__link"
              href={`/frontend/task-list?id=${applicationId}`}
            >
              Task list
            </a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            EIA fees
          </li>
        </ol>
      </nav>
      {errors.length > 0 && (
        <div
          className="govuk-error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
          data-module="govuk-error-summary"
          data-govuk-error-summary-init=""
        >
          <h2 className="govuk-error-summary__title" id="error-summary-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              {errors.map((err, idx) => (
                <li key={idx}>
                  <a href={`#${err.field}`}>{err.message}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">EIA fees</h1>

            <CheckboxGroup isEiaDevelopment={form.isEiaDevelopment} onChange={handleChange} />
            <form
              method="post"
              data-module="fds-html-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <input
                type="hidden"
                name="_csrf"
                value={getCsrfToken()}
              />
              <div
                className={`govuk-form-group${
                  hasError("isEiaDevelopment") ? " govuk-form-group--error" : ""
                }`}
              >
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby={
                    hasError("isEiaDevelopment")
                      ? "isEiaDevelopment-error"
                      : undefined
                  }
                >
                  {hasError("isEiaDevelopment") && (
                    <p
                      id="isEiaDevelopment-error"
                      className="govuk-error-message"
                      style={{ color: "#d4351c" }}
                    >
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      <span style={{ color: "#d4351c", fontWeight: "bold" }}>
                        {getErrorMessage("isEiaDevelopment")}
                      </span>
                    </p>
                  )}
                </fieldset>
                <RadioGroup
                  requiresFullEia={form.requiresFullEia}
                  screeningOnly={form.screeningOnly}
                  onChange={handleChange}
                  errorMessage={getErrorMessage("requiresFullEia")}
                  screeningErrorMessage={getErrorMessage("screeningOnly")}
                />
              </div>
              {form.screeningOnly === "true" && (
                <div
                  className={`govuk-form-group${
                    hasError("screeningOnly")
                      ? " govuk-form-group--error"
                      : ""
                  }`}
                >
                  <fieldset
                    className="govuk-fieldset"
                    aria-describedby={
                      hasError("screeningOnly")
                        ? "screeningOnly-error"
                        : undefined
                    }
                  >
                    {hasError("screeningOnly") && (
                      <p
                        id="screeningOnly-error"
                        className="govuk-error-message"
                      >
                        <span className="govuk-visually-hidden">Error:</span>{" "}
                        {getErrorMessage("screeningOnly")}
                      </p>
                    )}
                  </fieldset>
                </div>
              )}
              <button
                type="submit"
                data-module="govuk-button"
                className="govuk-button"
                value="Save and continue"
                name="Save and continue"
                data-prevent-double-click="true"
                data-fds-disable-on-submit="false"
                data-govuk-button-init=""
                disabled={loading}
              >
                Save and continue
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EIAFeesForm;
