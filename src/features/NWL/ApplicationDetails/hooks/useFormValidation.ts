import { useState, useCallback } from "react";

interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

/**
 * Hook for form validation with GOV.UK error patterns
 */
export const useFormValidation = (validationRules: ValidationRules) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = useCallback(
    (fieldName: string, value: unknown): string | null => {
      const rules = validationRules[fieldName];
      if (!rules) return null;

      for (const rule of rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
      return null;
    },
    [validationRules]
  );

  const validateForm = useCallback(
    (formData: Record<string, unknown>): boolean => {
      const newErrors: { [key: string]: string } = {};

      Object.keys(validationRules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [validationRules, validateField]
  );

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    getFieldError,
    hasErrors,
  };
};
