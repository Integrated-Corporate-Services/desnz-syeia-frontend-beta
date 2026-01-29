import React, { useState, useEffect } from "react";
import { S37_BASE_URL } from "../../../constants/s37";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import RadioGroup from "../component/RadioGroup";
// import { useApplicationStore } from "../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useEiaFeesStore } from "../../../store/useEiaFeesStore";

const EIAFeesForm: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useGetApplicationId();

  // State for fetched EIA Fees
  const eiaFees = useEiaFeesStore((state) => state.eiaFees);
  const fetchEiaFees = useEiaFeesStore((state) => state.fetchEiaFees);
  const createEiaFees = useEiaFeesStore((state) => state.createEiaFees);
  const updateEiaFees = useEiaFeesStore((state) => state.updateEiaFees);
  type FormState = {
    isEiaDevelopment: string;
    screeningOnly: string;
    eiaFeeId?: string;
    applicationId?: string;
  };
  const [form, setForm] = useState<FormState>({
    isEiaDevelopment: "",
    screeningOnly: "",
    eiaFeeId: undefined,
    applicationId: undefined,
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    [],
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
        isEiaDevelopment: eiaFees.isEiaDevelopment ? "true" : "false",
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
    if (!form.isEiaDevelopment) {
      newErrors.push({
        field: "isEiaDevelopment",
        message:
          "Select yes or no to the Environmental Impact Assessment question",
      });
    } else if (form.isEiaDevelopment === "true") {
      if (!form.screeningOnly) {
        newErrors.push({
          field: "screeningOnly",
          message: "Select yes or no to confirm the EIA fee",
        });
      } else if (form.screeningOnly === "false") {
        newErrors.push({
          field: "isEiaDevelopment",
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
          screeningOnly: boolean;
          updatedAt: string;
          updatedBy: string;
          eiaId?: string;
          createdAt?: string;
          createdBy?: string;
        };
        const payload: EiaPayload = {
          applicationId: applicationId,
          isEiaDevelopment: form.isEiaDevelopment === "true", // maps first question
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
            screeningOnly: payload.screeningOnly,
            updatedAt: payload.updatedAt,
            updatedBy: payload.updatedBy,
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
            screeningOnly: payload.screeningOnly,
            createdAt,
            updatedAt: payload.updatedAt,
            createdBy,
            updatedBy: payload.updatedBy,
          });
        }
        setSuccess(true);
        setForm({
          isEiaDevelopment: "",
          screeningOnly: "",
          eiaFeeId: undefined,
          applicationId: undefined,
        });
        // Redirect to tasklist page after success
        const redirectId = payload.applicationId;
        navigate(`${S37_BASE_URL}/${redirectId}/task-list`);
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
            <Link
              className="govuk-breadcrumbs__link"
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
            >
              Task list
            </Link>
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

            <form
              method="post"
              data-module="fds-html-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="govuk-form-group">
                <RadioGroup
                  isEiaDevelopment={form.isEiaDevelopment}
                  screeningOnly={form.screeningOnly}
                  onChange={handleChange}
                  errorMessage={getErrorMessage("isEiaDevelopment")}
                  screeningErrorMessage={getErrorMessage("screeningOnly")}
                />
              </div>
              {form.screeningOnly === "true" && (
                <div
                  className={`govuk-form-group${
                    hasError("screeningOnly") ? " govuk-form-group--error" : ""
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
