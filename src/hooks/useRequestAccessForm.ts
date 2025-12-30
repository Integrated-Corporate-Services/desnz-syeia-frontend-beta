import { useState, useEffect } from "react";

export interface FormData {
  fullName: string;
  email: string;
  line1: string;
  line2: string;
  town: string;
  country: string;
  postCode: string;
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
    fullName: "",
    email: initialEmail,
    line1: "",
    line2: "",
    town: "",
    country: "United Kingdom",
    postCode: "",
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
      fullName: "",
      email: initialEmail,
      line1: "",
      line2: "",
      town: "",
      country: "United Kingdom",
      postCode: "",
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
