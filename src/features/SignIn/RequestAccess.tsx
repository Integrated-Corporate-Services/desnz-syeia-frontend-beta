import React from "react";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import TextInput from "../../components/commonFormFields/TextInput";
import MultiSelect from "../../components/commonFormFields/MultiSelect";
import Checkbox from "../../components/commonFormFields/Checkbox";
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
      <a
        href="/landingPage"
        className="govuk-back-link govuk-!-margin-bottom-6 govuk-!-margin-top-0"
        style={{ display: "inline-block", marginBottom: "32px", marginTop: 0 }}
      >
        Submit your Energy Infrastructure Application
      </a>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} />

            <h1 className="govuk-heading-l">
              Provide your details to request access to this service
            </h1>

            <p className="govuk-body govuk-!-margin-bottom-2">
              We need a few more details to give you access to this service. A
              Distribution Network Operator (DNO) administrator will review your
              request.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-4">
              Once you submit this form, we will send your request to your
              organisation's administrator. You will not be able to use the
              service until they approve your access.
            </p>

            <p className="govuk-body govuk-!-margin-bottom-6">
              We will email you when your request has been reviewed.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="full-name"
                name="fullName"
                label="Full name"
                value={formData.fullName}
                onChange={handleChange}
                error={getFieldError("full-name")}
                autoComplete="name"
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
                hint="This is the email address you used to sign in with GOV.UK One Login."
                autoComplete="email"
              />

              <MultiSelect
                id="organisations"
                name="organisations"
                label="Which organisations do you work for or represent?"
                values={formData.organisations}
                onChange={handleChange}
                options={organisationOptions}
                error={getFieldError("organisations")}
                hint="Choose the Distribution Network Operators (DNOs) you work for or represent. You can select multiple organisations if you work across several."
                disabled={isLoadingOrgs}
              />

              <Checkbox
                id="applying-on-behalf"
                name="applyingOnBehalf"
                label="I am authorised to act on behalf of these organisations"
                checked={formData.applyingOnBehalf}
                onChange={handleChange}
                hint="Select this if you are an agent or contractor representing these organisations."
              />

              <div className="govuk-form-group govuk-!-margin-top-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                  Privacy notice
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-1">
                  By continuing, you agree to the processing of your
                  information.
                </p>
                <a href="#" className="govuk-link">
                  Read the privacy notice
                </a>
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
                  Use this form if you work for one or more Distribution Network
                  Operators (DNOs) or if you are an authorised agent acting on
                  their behalf.
                </p>
                <p className="govuk-body">
                  You can select multiple organisations if you work across
                  several DNOs or represent multiple networks.
                </p>
                <p className="govuk-body">
                  If you cannot find your organisation in the list, contact your
                  DNO administrator.
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
