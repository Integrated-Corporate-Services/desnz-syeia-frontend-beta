import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import SelectInput from "../../components/commonFormFields/SelectInput";
import ErrorSummary from "../../components/commonFormFields/ErrorSummary";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { useAuthUserContext } from "../../context/AuthUserContext";
import requestAccessService from "../../services/accessRequestApplicationService";
import { createLogger } from "../../utils/logger";

const logger = createLogger('ContactDetailsPage');

const ContactDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    email: formData.email || user?.email || "",
    phoneNumber: formData.phoneNumber || "",
  });

  // Check if user has already submitted a request and redirect if so
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user?.email) return;

      try {
        const result = await requestAccessService.checkExistingRequestByEmail(user.email);

        // If user has a submitted request, redirect to submitted page
        if (result.hasSubmittedRequest) {
          navigate("/request-access/submitted", { replace: true });
        }
      } catch (error: unknown) {
        logger.error("Error checking existing request:", error);
      }
    };

    checkExistingRequest();
  }, [user?.email, navigate]);

  // Update email from session if not already set
  useEffect(() => {
    if (user?.email && !localData.email) {
      setLocalData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email, localData.email]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const titleOptions = [
    { value: "", text: "Select a title" },
    { value: "Mr", text: "Mr" },
    { value: "Mrs", text: "Mrs" },
    { value: "Miss", text: "Miss" },
    { value: "Ms", text: "Ms" },
    { value: "Dr", text: "Dr" },
    { value: "Professor", text: "Professor" },
  ];

  const handleChange = (name: string, value: string) => {
    // Apply input restrictions based on field type
    let sanitizedValue = value;
    
    if (name === 'firstName' || name === 'lastName') {
      // Allow only letters, spaces, hyphens, and apostrophes (for names like O'Brien, Mary-Jane)
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    } else if (name === 'phoneNumber') {
      // Allow only numbers, spaces, plus, parentheses, and hyphens
      sanitizedValue = value.replace(/[^0-9\s+()-]/g, '');
    }
    
    setLocalData((prev) => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateUKPhoneNumber = (phone: string): boolean => {
    // Remove all spaces, parentheses, and hyphens for validation
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    
    // UK phone numbers: must start with 0 or +44, and be 10-11 digits (or 12-13 with +44)
    const ukPhoneRegex = /^(?:(?:\+44\s?|0)(?:\d\s?){9,10})$/;
    const cleanedForRegex = phone.replace(/[()-]/g, '');
    
    return ukPhoneRegex.test(cleanedForRegex) && cleanPhone.length >= 10 && cleanPhone.length <= 13;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!localData.firstName.trim()) {
      newErrors.firstName = "Enter your first name";
    } else if (localData.firstName.trim().length > 4000) {
      newErrors.firstName = "You cannot enter more than 4,000 characters";
    }

    // Last name validation
    if (!localData.lastName.trim()) {
      newErrors.lastName = "Enter your last name";
    } else if (localData.lastName.trim().length > 4000) {
      newErrors.lastName = "You cannot enter more than 4,000 characters";
    }

    // Email validation
    if (!localData.email.trim()) {
      newErrors.email = "Enter your email address";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localData.email)) {
        newErrors.email = "Enter an email address in the correct format, like name@example.com";
      }
    }

    // Phone number validation (optional but validate if provided)
    if (localData.phoneNumber.trim()) {
      if (!validateUKPhoneNumber(localData.phoneNumber)) {
        newErrors.phoneNumber = "Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192";
      }
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
    navigate("/request-access/work-address");
  };

  // Convert errors object to ErrorSummary format
  const errorSummaryItems = Object.entries(errors).map(([fieldId, message]) => ({
    fieldId,
    message,
  }));

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary ref={errorSummaryRef} errors={errorSummaryItems} />
            
            <h1 className="govuk-heading-l">Enter your contact details</h1>

            <form onSubmit={handleSubmit} noValidate>
              <SelectInput
                id="title"
                name="title"
                label="Title (optional)"
                value={localData.title}
                options={titleOptions}
                onChange={(e) => handleChange("title", e.target.value)}
              />

              <TextInput
                id="firstName"
                name="firstName"
                label="First name"
                value={localData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                autoComplete="given-name"
              />

              <TextInput
                id="lastName"
                name="lastName"
                label="Last name"
                value={localData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
              />

              <TextInput
                id="email"
                name="email"
                label="Email"
                type="email"
                value={localData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                hint="This should be the same email you used for One Login"
                autoComplete="email"
                readOnly
              />

              <TextInput
                id="phoneNumber"
                name="phoneNumber"
                label="Phone (optional)"
                type="tel"
                value={localData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                error={errors.phoneNumber}
                autoComplete="tel"
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

export default ContactDetailsPage;
