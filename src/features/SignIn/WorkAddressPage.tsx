import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useGetAccessRequest } from "../../hooks/useGetAccessRequest";

const WorkAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const { saveAccessRequest, isLoading } = useSaveAccessRequest();
  
  // Fetch existing access request data
  const { data: existingRequest, isLoading: isLoadingRequest } = useGetAccessRequest(user?.email);

  const [localData, setLocalData] = useState({
    line1: formData.line1 || "",
    line2: formData.line2 || "",
    town: formData.town || "",
    county: formData.county || "",
    postCode: formData.postCode || "",
  });

  // Update form data from existing access request if available
  useEffect(() => {
    if (existingRequest) {
      setLocalData({
        line1: existingRequest.line1 || formData.line1 || "",
        line2: existingRequest.line2 || formData.line2 || "",
        town: existingRequest.town_city || formData.town || "",
        county: existingRequest.county || formData.county || "",
        postCode: existingRequest.postcode || formData.postCode || "",
      });
      
      // Also update the store
      updateFormData({
        line1: existingRequest.line1 || "",
        line2: existingRequest.line2 || "",
        town: existingRequest.town_city || "",
        county: existingRequest.county || "",
        postCode: existingRequest.postcode || "",
      });
    }
  }, [existingRequest]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.line1.trim()) {
      newErrors.line1 = "Enter address line 1";
    }

    if (!localData.town.trim()) {
      newErrors.town = "Enter town or city";
    }

    if (!localData.postCode.trim()) {
      newErrors.postCode = "Enter postcode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Save to backend
      await saveAccessRequest({
        email: formData.email!,
        line1: localData.line1,
        line2: localData.line2,
        town: localData.town,
        county: localData.county,
        postCode: localData.postCode,
      });

      // Update store
      updateFormData(localData);

      // Navigate to next page
      navigate("/request-access/agent-question");
    } catch (error) {
      setErrors({ general: "Failed to save. Please try again." });
    }
  };

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access/contact-details"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access/contact-details");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Enter your work address</h1>

            {isLoadingRequest ? (
              <p className="govuk-body">Loading your details...</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
              <TextInput
                id="line1"
                name="line1"
                label="Address line 1"
                value={localData.line1}
                onChange={(e) => handleChange("line1", e.target.value)}
                error={errors.line1}
                autoComplete="address-line1"
              />

              <TextInput
                id="line2"
                name="line2"
                label="Address line 2 (optional)"
                value={localData.line2}
                onChange={(e) => handleChange("line2", e.target.value)}
                autoComplete="address-line2"
              />

              <TextInput
                id="town"
                name="town"
                label="Town or city"
                value={localData.town}
                onChange={(e) => handleChange("town", e.target.value)}
                error={errors.town}
                autoComplete="address-level2"
              />

              <TextInput
                id="county"
                name="county"
                label="County (optional)"
                value={localData.county}
                onChange={(e) => handleChange("county", e.target.value)}
                autoComplete="address-level1"
              />

              <TextInput
                id="postCode"
                name="postCode"
                label="Postcode"
                value={localData.postCode}
                onChange={(e) => handleChange("postCode", e.target.value)}
                error={errors.postCode}
                autoComplete="postal-code"
                className="govuk-input--width-10"
              />

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Use this address"}
              </button>
            </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkAddressPage;
