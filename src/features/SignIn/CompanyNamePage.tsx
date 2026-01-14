import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useGetAccessRequest } from "../../hooks/useGetAccessRequest";

const CompanyNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const { saveAccessRequest, isLoading } = useSaveAccessRequest();
  
  // Fetch existing access request data
  const { data: existingRequest, isLoading: isLoadingRequest } = useGetAccessRequest(user?.email);

  const [agencyName, setAgencyName] = useState(formData.agencyName || "");
  const [error, setError] = useState<string>("");

  // Update form data from existing access request if available
  useEffect(() => {
    if (existingRequest && existingRequest.agency_name) {
      setAgencyName(existingRequest.agency_name);
      updateFormData({ agencyName: existingRequest.agency_name });
    }
  }, [existingRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agencyName.trim()) {
      setError("Enter your agency name");
      return;
    }

    try {
      // Save to backend
      await saveAccessRequest({
        email: formData.email!,
        agencyName,
      });

      // Update store
      updateFormData({ agencyName });

      // Navigate to select organisations page
      navigate("/request-access/select-organisations");
    } catch (error) {
      setError("Failed to save. Please try again.");
    }
  };

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access/agent-question"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access/agent-question");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Enter your agency name</h1>

            <p className="govuk-body">e.g. Fisher Gordon</p>

            {isLoadingRequest ? (
              <p className="govuk-body">Loading your details...</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="agencyName"
                name="agencyName"
                label=""
                value={agencyName}
                onChange={(e) => {
                  setAgencyName(e.target.value);
                  setError("");
                }}
                error={error}
                className="govuk-input--width-20"
              />

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save and continue"}
              </button>
            </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyNamePage;
