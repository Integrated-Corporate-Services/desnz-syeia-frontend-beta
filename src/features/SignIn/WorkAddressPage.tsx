import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import { useAccessRequest } from "../../hooks/useAccessRequest";

const WorkAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useAccessRequest();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [localData, setLocalData] = useState({
    line1: formData.line1 || "",
    line2: formData.line2 || "",
    town: formData.town || "",
    county: formData.county || "",
    postCode: formData.postCode || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    // Apply input restrictions based on field type
    let sanitizedValue = value;
    
    if (name === 'town' || name === 'county') {
      // Allow only letters, spaces, hyphens, and apostrophes
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    } else if (name === 'line1' || name === 'line2') {
      // Allow alphanumeric, spaces, commas, periods, hyphens, and apostrophes
      sanitizedValue = value.replace(/[^a-zA-Z0-9\s,.'-]/g, '');
    } else if (name === 'postCode') {
      // Allow alphanumeric and spaces only, convert to uppercase
      sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase();
    }
    
    setLocalData((prev) => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateUKPostcode = (postcode: string): boolean => {
    // Remove all spaces and convert to uppercase
    const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
    
    // UK postcode regex - covers all valid UK postcode formats
    // Examples: SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT, W1A 0AX, EC1A 1BB
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    
    return postcodeRegex.test(postcode) && cleanPostcode.length >= 5 && cleanPostcode.length <= 7;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Address line 1 validation (required)
    if (!localData.line1.trim()) {
      newErrors.line1 = "Enter address line 1, typically the building and street";
    } else if (localData.line1.trim().length > 4000) {
      newErrors.line1 = "You cannot enter more than 4,000 characters";
    }

    // Address line 2 validation (optional but validate if provided)
    if (localData.line2.trim() && localData.line2.trim().length > 4000) {
      newErrors.line2 = "You cannot enter more than 4,000 characters";
    }

    // Town validation (required)
    if (!localData.town.trim()) {
      newErrors.town = "Enter a town or city";
    } else if (localData.town.trim().length > 4000) {
      newErrors.town = "You cannot enter more than 4,000 characters";
    }

    // County validation (optional but validate if provided)
    if (localData.county.trim() && localData.county.trim().length > 4000) {
      newErrors.county = "You cannot enter more than 4,000 characters";
    }

    // Postcode validation (required)
    if (!localData.postCode.trim()) {
      newErrors.postCode = "Enter a full UK postcode";
    } else if (!validateUKPostcode(localData.postCode)) {
      newErrors.postCode = "Enter a full UK postcode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    updateFormData(localData);

    // Navigate to next page
    navigate("/request-access/agent-question");
  };

  // Convert errors object to ErrorSummary format
  const errorSummaryItems = Object.entries(errors).map(([fieldId, message]) => ({
    fieldId,
    message,
  }));

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
            <ErrorSummary ref={errorSummaryRef} errors={errorSummaryItems} />
            
            <h1 className="govuk-heading-l">Enter your work address</h1>

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
              >
                Use this address
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkAddressPage;
