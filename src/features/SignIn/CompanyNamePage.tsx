import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import { useAccessRequest } from "../../hooks/useAccessRequest";

const CompanyNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useAccessRequest();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [agencyName, setAgencyName] = useState(formData.agencyName || "");
  const [error, setError] = useState<string>("");

  const handleChange = (value: string) => {
    // Allow alphanumeric, spaces, hyphens, apostrophes, ampersands, periods, commas
    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s'\-&.,]/g, '');
    setAgencyName(sanitizedValue);
    setError("");
  };

  const validate = (): boolean => {
    if (!agencyName.trim()) {
      setError("Enter your agency name");
      return false;
    }
    
    if (agencyName.trim().length > 4000) {
      setError("You cannot enter more than 4,000 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Focus error summary for accessibility
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
        errorSummaryRef.current.scrollIntoView({ block: "start" });
      }
      return;
    }

    // Update store only - no backend save yet
    updateFormData({ agencyName });

    // Navigate to select organisations page
    navigate("/request-access/select-organisations");
  };

  // Convert error to ErrorSummary format
  const errorSummaryItems = error ? [{ fieldId: "agencyName", message: error }] : [];

  return (
    <div className="govuk-width-container">
      <Link
        to="/request-access/agent-question"
        className="govuk-back-link"
      >
        Back
      </Link>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errorSummaryItems} />
            
            <h1 className="govuk-heading-l">Enter your agency name</h1>

            <p className="govuk-body">e.g. Fisher Gordon</p>

            <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="agencyName"
                name="agencyName"
                label="Enter your agency name"
                value={agencyName}
                onChange={(e) => handleChange(e.target.value)}
                error={error}
                className="govuk-input--width-20"
              />

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
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

export default CompanyNamePage;
