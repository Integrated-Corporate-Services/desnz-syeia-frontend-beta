import React from "react";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import { useNetworkOperators } from "../hooks/useNetworkOperators";
import { useWhoIsApplyingForm } from "../hooks/useWhoIsApplyingForm";
import PageTitle from "../../../components/PageTitle";
import Details from "../../../components/Details";
import AccessibleSelect from "../../../components/commonFormFields/AccessibleSelect";

const WhoIsApplying: React.FC = () => {
  const { user } = useAuthUserContext();

  const { options, selectedOrganisation, selectedOrgName, handleOrgChange } =
    useNetworkOperators();

  const { submitted, error, handleSubmit, clearError } = useWhoIsApplyingForm();

  const handleContinue = (e: React.FormEvent) => {
    handleSubmit(e, selectedOrgName, selectedOrganisation, user);
  };

  const handleOrgSelectChange = (value: string) => {
    handleOrgChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>);
    // Clear any existing errors when user makes a selection
    if (value && error) {
      clearError();
    }
  };

  return (
    <>
            <PageTitle title="Who is applying?" />
            <div className="govuk-width-container">
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Who is applying?</h1>
            {/* Error summary */}
            {submitted && error && (
              <div
                className="govuk-error-summary govuk-!-margin-bottom-4"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#location">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleContinue} noValidate>
              <div
                className={`govuk-form-group govuk-!-width-full${
                  error ? " govuk-form-group--error" : ""
                }`}
              >
                <label className="govuk-label" htmlFor="location">
                  Network operator
                </label>
                {error && (
                  <p id="location-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>{" "}
                    {error}
                  </p>
                )}
                <AccessibleSelect
                  className="govuk-!-width-full govuk-!-font-size-19"
                  id="location"
                  aria-describedby={error ? "location-error" : undefined}
                  value={selectedOrgName}
                  onChange={handleOrgSelectChange}
                  disabled={options.length === 0}
                  required
                  options={[
                    {
                      value: "",
                      text:
                        options.length === 0
                          ? "No network operators found"
                          : "Select option...",
                    },
                    ...options.map((opt) => ({
                      value: opt.organisation_name,
                      text: opt.organisation_name,
                    })),
                  ]}
                />
              </div>
              <Details
                id="network-operator-not-listed"
                summary="The network operator is not listed"
                className="govuk-!-margin-top-6"
                initialOpen={true}
              >
                <p>
                  You must contact the team coordinator in your organisation
                  that you want to create an application for to provide you
                  with access to their organisation.
                </p>
                <p>
                  If you do not know who the team coordinator is then contact
                  the service desk for advice at{" "}
                  <a
                    href="mailto:xxx@desnz.com"
                    className="govuk-link"
                  >
                    xxx@desnz.com
                  </a>
                </p>
              </Details>
              <button
                type="submit"
                className="govuk-button govuk-!-margin-top-6"
                data-module="govuk-button"
                disabled={options.length === 0}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
            </div>
    </>
  );
};

export default WhoIsApplying;
