import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "../../components/commonFormFields/TextInput";
import SelectInput from "../../components/commonFormFields/SelectInput";
import { useAccessRequestStore } from "../../store/accessRequestStore";
import { useSaveAccessRequest } from "../../hooks/useSaveAccessRequest";
import { useAuthUserContext } from "../../context/AuthUserContext";
import { useGetAccessRequest } from "../../hooks/useGetAccessRequest";

const ContactDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const { formData, updateFormData } = useAccessRequestStore();
  const { saveAccessRequest, isLoading } = useSaveAccessRequest();
  
  // Fetch existing access request data
  const { data: existingRequest, isLoading: isLoadingRequest } = useGetAccessRequest(user?.email);
  
  const [localData, setLocalData] = useState({
    title: formData.title || "",
    firstName: formData.firstName || "",
    lastName: formData.lastName || "",
    email: formData.email || user?.email || "",
    phoneNumber: formData.phoneNumber || "",
  });

  // Update form data from existing access request if available
  useEffect(() => {
    if (existingRequest) {
      setLocalData({
        title: existingRequest.title || formData.title || "",
        firstName: existingRequest.first_name || formData.firstName || "",
        lastName: existingRequest.last_name || formData.lastName || "",
        email: existingRequest.email || user?.email || "",
        phoneNumber: existingRequest.phone_number || formData.phoneNumber || "",
      });
      
      // Also update the store with existing data
      updateFormData({
        title: existingRequest.title || "",
        firstName: existingRequest.first_name || "",
        lastName: existingRequest.last_name || "",
        email: existingRequest.email || "",
        phoneNumber: existingRequest.phone_number || "",
      });
    }
  }, [existingRequest]);

  // Update email from session if not already set
  useEffect(() => {
    if (user?.email && !localData.email) {
      setLocalData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

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
    setLocalData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

    const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localData.firstName.trim()) {
      newErrors.firstName = "Enter your first name";
    }

    if (!localData.lastName.trim()) {
      newErrors.lastName = "Enter your last name";
    }

    if (!localData.email.trim()) {
      newErrors.email = "Enter your email address";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localData.email)) {
        newErrors.email = "Enter a valid email address";
      }
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
        email: localData.email,
        title: localData.title,
        firstName: localData.firstName,
        lastName: localData.lastName,
        phoneNumber: localData.phoneNumber,
      });

      // Update store
      updateFormData(localData);

      // Navigate to next page
      navigate("/request-access/work-address");
    } catch (error) {
      setErrors({ general: "Failed to save. Please try again." });
    }
  };

  return (
    <div className="govuk-width-container">
      <a
        href="/request-access/intro"
        className="govuk-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate("/request-access/intro");
        }}
      >
        Back
      </a>

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Enter your contact details</h1>

            {isLoadingRequest ? (
              <p className="govuk-body">Loading your details...</p>
            ) : (
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

export default ContactDetailsPage;
