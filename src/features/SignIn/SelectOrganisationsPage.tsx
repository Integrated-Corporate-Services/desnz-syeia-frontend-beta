import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { usePublicOrganisations } from "../../hooks/usePublicOrganisations";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useGetAccessRequest } from "../../hooks/useGetAccessRequest";

const SelectOrganisationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const { organisations, isLoading } = usePublicOrganisations();
  const { saveAccessRequest, isLoading: isSaving } = useSaveAccessRequest();
  
  // Fetch existing access request data
  const { data: existingRequest, isLoading: isLoadingRequest } = useGetAccessRequest(user?.email);

  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(
    formData.organisationIds || []
  );
  const [error, setError] = useState<string>("");

  const isAgent = formData.isAgent;

  // Update selected organisations from existing access request if available
  useEffect(() => {
    if (existingRequest?.organisations && existingRequest.organisations.length > 0) {
      const orgIds = existingRequest.organisations.map((org) => org.organisation_id);
      setSelectedOrgs(orgIds);
      updateFormData({ organisationIds: orgIds });
    }
  }, [existingRequest]);

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
      setError(
        isAgent
          ? "Select at least one organisation"
          : "Select the organisation you work for"
      );
      return;
    }

    try {
      // Update store
      updateFormData({ organisationIds: selectedOrgs });

      // Submit to backend - this will be the final save that marks as PENDING
      const result = await saveAccessRequest({
        email: formData.email!,
        organisationIds: selectedOrgs,
      });

      // Navigate to success page
      navigate("/request-access/submitted");
    } catch (err) {
      setError("Failed to submit request. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="govuk-width-container">Loading...</div>;
  }

  return (
    <div className="govuk-width-container">
      <a
        href={isAgent ? "/request-access/company-name" : "/request-access/agent-question"}
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate(
            isAgent
              ? "/request-access/company-name"
              : "/request-access/agent-question"
          );
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}
              >
                <fieldset className="govuk-fieldset">
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
      </main>
    </div>
  );
};

export default SelectOrganisationsPage;
