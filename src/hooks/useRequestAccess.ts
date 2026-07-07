import { useState } from "react";
import { useNavigate } from "react-router-dom";
import accessRequestApplicationService from "../services/accessRequestApplicationService";
import type { RequestAccessRequest } from "../types/requestAccess";

interface ValidationError {
  fieldId: string;
  message: string;
}

export const useRequestAccess = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  const validateForm = (formData: RequestAccessRequest): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.firstName.trim()) {
      newErrors.push({
        fieldId: "first-name",
        message: "Enter your first name",
      });
    }

    if (!formData.lastName.trim()) {
      newErrors.push({ fieldId: "last-name", message: "Enter your last name" });
    }

    if (!formData.email.trim()) {
      newErrors.push({ fieldId: "email", message: "Enter your email address" });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.push({
          fieldId: "email",
          message: "Enter a valid email address",
        });
      }
    }

    if (!formData.workAddressLine1.trim()) {
      newErrors.push({
        fieldId: "work-address-line-1",
        message: "Enter address line 1",
      });
    }

    if (!formData.workTown.trim()) {
      newErrors.push({ fieldId: "work-town", message: "Enter a town or city" });
    }

    if (!formData.workPostcode.trim()) {
      newErrors.push({ fieldId: "work-postcode", message: "Enter a postcode" });
    }

    if (formData.applyingOnBehalf) {
      if (!formData.company.trim()) {
        newErrors.push({
          fieldId: "company",
          message: "Enter your employer or agency name",
        });
      }

      if (!formData.organisations || formData.organisations.length === 0) {
        newErrors.push({
          fieldId: "organisations",
          message: "Select at least one organisation",
        });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const submitRequestAccess = async (formData: RequestAccessRequest) => {
    if (!validateForm(formData)) {
      return false;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response =
        await accessRequestApplicationService.submitRequestAccess(formData);

      if (response.success && response.referenceNumber) {
        setReferenceNumber(response.referenceNumber);
        navigate("/sent-for-approval", {
          state: { referenceNumber: response.referenceNumber },
        });
        return true;
      }

      // Handle "already exists" case
      if (response.alreadyExists) {
        setErrors([
          {
            fieldId: "email",
            message:
              response.message ||
              "An access request for this email address has already been submitted.",
          },
        ]);
        return false;
      }

      return false;
    } catch (error: any) {
      // Check if error response contains "already exists" info
      if (error.response?.data?.alreadyExists) {
        setErrors([
          {
            fieldId: "email",
            message:
              error.response.data.message ||
              "An access request for this email address has already been submitted.",
          },
        ]);
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setErrors([{ fieldId: "general", message: errorMessage }]);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errors,
    referenceNumber,
    validateForm,
    submitRequestAccess,
    setErrors,
  };
};
