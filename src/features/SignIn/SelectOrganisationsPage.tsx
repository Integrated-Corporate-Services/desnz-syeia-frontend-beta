import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAccessRequest } from "../../hooks/useAccessRequest";
import { usePublicOrganisations } from "../../hooks/usePublicOrganisations";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";

const SelectOrganisationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequest();
  const { organisations, isLoading } = usePublicOrganisations();
  const { saveAccessRequest, isLoading: isSaving } = useSaveAccessRequest();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(
    formData.organisationIds || []
  );
  const [error, setError] = useState<string>("");

  const isAgent = formData.isAgent;

  const handleCheckboxChange = (orgId: string) => {
    if (isAgent) {
      // Agents can select multiple
      setSelectedOrgs((prev) =>
        prev.includes(orgId)
          ? prev.filter((id) => id !== orgId)
          : [...prev, orgId]
      );
    } else {
      // Employees can select only one
      setSelectedOrgs([orgId]);
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOrgs.length === 0) {
      const errorMsg = isAgent
        ? "Select at least one organisation"
        : "Select an organisation";
      setError(errorMsg);
      
      // Focus error summary for accessibility
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
        errorSummaryRef.current.scrollIntoView({ block: "start" });
      }
      return;
    }

    try {
      // Update store with organisation IDs
      updateFormData({ organisationIds: selectedOrgs });

      // Submit ALL form data to backend in one final save
      const completeFormData = {
        email: formData.email || user?.email || '',
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        line1: formData.line1,
        line2: formData.line2,
        town: formData.town,
        county: formData.county,
        postCode: formData.postCode,
        isAgent: formData.isAgent,
        agencyName: formData.agencyName,
        organisationIds: selectedOrgs,
      };

      await saveAccessRequest(completeFormData);

      // Navigate to success page (which will clear the session data)
      navigate("/request-access/submitted");
    } catch {
      const errorMsg = "Failed to submit request. Please try again.";
      setError(errorMsg);
      
      // Focus error summary for accessibility
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
        errorSummaryRef.current.scrollIntoView({ block: "start" });
      }
    }
  };

  // Convert error to ErrorSummary format
  const errorSummaryItems = error ? [{ fieldId: "organisations", message: error }] : [];

  if (isLoading) {
    return <div className="govuk-width-container">Loading...</div>;
  }

  return (
    <>
            <div className="govuk-width-container">
        <Link
          to={isAgent ? "/request-access/company-name" : "/request-access/agent-question"}
          className="govuk-back-link"
        >
        Back
      </Link>

              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errorSummaryItems} />
            
            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}
              >
                <fieldset 
                  className="govuk-fieldset"
                  aria-describedby={error ? "organisations-error" : undefined}
                >
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {isAgent
                        ? "Select all the organisations you submit applications for"
                        : "Select the organisation you work for"}
                    </h1>
                  </legend>

                  {!isAgent && (
                    <p className="govuk-body">
                      You must select the organisation you will submit
                      applications for.
                    </p>
                  )}

                  {isAgent && (
                    <p className="govuk-body">
                      You must select all the organisations you will submit
                      applications for.
                    </p>
                  )}

                  {error && (
                    <p id="organisations-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}

                  <div
                    className={
                      isAgent ? "govuk-checkboxes" : "govuk-radios"
                    }
                    data-module={isAgent ? "govuk-checkboxes" : "govuk-radios"}
                  >
                    {organisations.map((org) => (
                      <div
                        key={org.value}
                        className={
                          isAgent
                            ? "govuk-checkboxes__item"
                            : "govuk-radios__item"
                        }
                      >
                        <input
                          className={
                            isAgent
                              ? "govuk-checkboxes__input"
                              : "govuk-radios__input"
                          }
                          id={`org-${org.value}`}
                          name="organisations"
                          type={isAgent ? "checkbox" : "radio"}
                          value={org.value}
                          checked={selectedOrgs.includes(org.value)}
                          onChange={() =>
                            handleCheckboxChange(org.value)
                          }
                        />
                        <label
                          className={
                            isAgent
                              ? "govuk-label govuk-checkboxes__label"
                              : "govuk-label govuk-radios__label"
                          }
                          htmlFor={`org-${org.value}`}
                        >
                          {org.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isSaving}
              >
                {isSaving ? "Submitting..." : "Save and continue"}
              </button>
            </form>
          </div>
        </div>
            </div>
    </>
  );
};

export default SelectOrganisationsPage;
