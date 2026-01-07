import React, { useEffect, useRef } from "react";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import TextInput from "../../components/commonFormFields/TextInput";
import MultiSelect from "../../components/commonFormFields/MultiSelect";
import { useRequestAccess } from "../../hooks/useRequestAccess";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { usePublicOrganisations } from "../../hooks/usePublicOrganisations";
import { useRequestAccessForm } from "../../hooks/useRequestAccessForm";

const RequestAccessPage: React.FC = () => {
  const { user } = useAuthUserContext();
  const { isSubmitting, errors, submitRequestAccess } = useRequestAccess();
  const { organisations: organisationOptions, isLoading: isLoadingOrgs } =
    usePublicOrganisations();
  const { formData, handleChange } = useRequestAccessForm(user?.email || "");
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
      errorSummaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitRequestAccess(formData);
  };

  const getFieldError = (fieldId: string): string => {
    const error = errors.find((err) => err.fieldId === fieldId);
    return error ? error.message : "";
  };

  return (
    <div className="govuk-width-container">
      <a href="/landingPage" className="govuk-back-link">
        Back
      </a>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errors} />

            <h1 className="govuk-heading-l">Request access to this service</h1>

            <p className="govuk-body">
              A DNO administrator will review your request. You cannot use the
              service until they approve your access.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-6">
              We'll email you when your request has been reviewed.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="first-name"
                name="firstName"
                label="First name"
                value={formData.firstName}
                onChange={handleChange}
                error={getFieldError("first-name")}
                autoComplete="given-name"
                className="govuk-!-width-two-thirds"
              />

              <TextInput
                id="last-name"
                name="lastName"
                label="Last name"
                value={formData.lastName}
                onChange={handleChange}
                error={getFieldError("last-name")}
                autoComplete="family-name"
                className="govuk-!-width-two-thirds"
              />

              <TextInput
                id="email"
                name="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                readOnly
                error={getFieldError("email")}
                hint="This is your GOV.UK One Login email address."
                autoComplete="email"
                className="govuk-!-width-two-thirds"
              />

              <TextInput
                id="phone-number"
                name="phoneNumber"
                label="Phone number (optional)"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={getFieldError("phone-number")}
                hint="We may need to call you about your request."
                autoComplete="tel"
                className="govuk-!-width-two-thirds"
              />

              <fieldset
                className="govuk-fieldset"
                aria-describedby="work-address-hint"
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                  <h2 className="govuk-fieldset__heading">Work address</h2>
                </legend>
                <div id="work-address-hint" className="govuk-hint">
                  We'll use this address on official correspondence.
                </div>

                <TextInput
                  id="work-address-line-1"
                  name="workAddressLine1"
                  label="Address line 1"
                  value={formData.workAddressLine1}
                  onChange={handleChange}
                  error={getFieldError("work-address-line-1")}
                  autoComplete="address-line1"
                />

                <TextInput
                  id="work-address-line-2"
                  name="workAddressLine2"
                  label="Address line 2 (optional)"
                  value={formData.workAddressLine2}
                  onChange={handleChange}
                  error={getFieldError("work-address-line-2")}
                  autoComplete="address-line2"
                />

                <TextInput
                  id="work-town"
                  name="workTown"
                  label="Town or city"
                  value={formData.workTown}
                  onChange={handleChange}
                  error={getFieldError("work-town")}
                  autoComplete="address-level2"
                  className="govuk-!-width-two-thirds"
                />

                <TextInput
                  id="work-county"
                  name="workCounty"
                  label="County (optional)"
                  value={formData.workCounty}
                  onChange={handleChange}
                  error={getFieldError("work-county")}
                  autoComplete="address-level1"
                  className="govuk-!-width-two-thirds"
                />

                <TextInput
                  id="work-postcode"
                  name="workPostcode"
                  label="Postcode"
                  value={formData.workPostcode}
                  onChange={handleChange}
                  error={getFieldError("work-postcode")}
                  autoComplete="postal-code"
                  className="govuk-input--width-10"
                />
              </fieldset>

              <div className="govuk-form-group">
                <div
                  className="govuk-checkboxes"
                  data-module="govuk-checkboxes"
                >
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="applying-on-behalf"
                      name="applyingOnBehalf"
                      type="checkbox"
                      checked={formData.applyingOnBehalf}
                      onChange={handleChange}
                      aria-controls="conditional-organisations"
                      aria-expanded={formData.applyingOnBehalf}
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor="applying-on-behalf"
                    >
                      I'm an agent or contractor representing DNOs
                    </label>
                    <div className="govuk-hint govuk-checkboxes__hint">
                      Only select this if you don't work directly for a DNO.
                      We'll auto-detect your organisation from your email if you
                      do.
                    </div>
                  </div>

                  {formData.applyingOnBehalf && (
                    <div
                      className="govuk-checkboxes__conditional"
                      id="conditional-organisations"
                    >
                      <TextInput
                        id="company"
                        name="company"
                        label="Your employer"
                        value={formData.company}
                        onChange={handleChange}
                        error={getFieldError("company")}
                        autoComplete="organization"
                        hint="Enter your agency name, not the DNOs you represent."
                      />

                      <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset">
                          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                            <h2 className="govuk-fieldset__heading">
                              Which DNOs do you represent?
                            </h2>
                          </legend>
                          <MultiSelect
                            id="organisations"
                            name="organisations"
                            label="Select organisations"
                            values={formData.organisations}
                            onChange={handleChange}
                            options={organisationOptions}
                            error={getFieldError("organisations")}
                            hint="You can select multiple organisations."
                            disabled={isLoadingOrgs}
                          />
                        </fieldset>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="govuk-form-group govuk-!-margin-top-6">
                <p className="govuk-body">
                  By continuing, you agree to the{" "}
                  <a href="/privacy-notice" className="govuk-link">
                    privacy notice
                  </a>
                  .
                </p>
              </div>

              <div className="govuk-form-group govuk-!-margin-top-6">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Continue"}
                </button>
              </div>
            </form>

            <details className="govuk-details govuk-!-margin-top-6">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Who should use this form?
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  Use this form if you work for a DNO or if you're an agent
                  acting on their behalf.
                </p>
                <p className="govuk-body">
                  Agents can select multiple DNOs if they work across several
                  networks.
                </p>
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestAccessPage;
