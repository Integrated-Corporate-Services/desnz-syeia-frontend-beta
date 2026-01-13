import { useState, useEffect } from "react";

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  workAddressLine1: string;
  workAddressLine2: string;
  workTown: string;
  workCounty: string;
  workPostcode: string;
  company: string;
  organisations: string[];
  applyingOnBehalf: boolean;
}

type FormEvent =
  | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  | {
      target: {
        name: string;
        value: string | string[] | boolean;
        type?: string;
        checked?: boolean;
      };
    };

export const useRequestAccessForm = (initialEmail: string = "") => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: initialEmail,
    phoneNumber: "",
    workAddressLine1: "",
    workAddressLine2: "",
    workTown: "",
    workCounty: "",
    workPostcode: "",
    company: "",
    organisations: [],
    applyingOnBehalf: false,
  });

  // Update email when it changes from auth
  useEffect(() => {
    if (initialEmail && formData.email !== initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const handleChange = (e: FormEvent) => {
    const { name, value, type } = e.target;
    let checked = false;

    if ("checked" in e.target && typeof e.target.checked === "boolean") {
      checked = e.target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: initialEmail,
      phoneNumber: "",
      workAddressLine1: "",
      workAddressLine2: "",
      workTown: "",
      workCounty: "",
      workPostcode: "",
      company: "",
      organisations: [],
      applyingOnBehalf: false,
    });
  };

  return {
    formData,
    handleChange,
    resetForm,
  };
};
