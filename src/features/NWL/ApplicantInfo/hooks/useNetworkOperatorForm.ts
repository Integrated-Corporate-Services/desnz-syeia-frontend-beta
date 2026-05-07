import { useState, useCallback } from "react";
import type { ApplicationParty } from "../../../../types/application";
import { FORM_ERRORS } from "../constants/networkOperatorDetails";

interface UseNetworkOperatorFormReturn {
  networkOperatorRef: string;
  setNetworkOperatorRef: (value: string) => void;
  selectedOrgName: string;
  setSelectedOrgName: (value: string) => void;
  selectedOrganisation: ApplicationParty | null;
  setSelectedOrganisation: (org: ApplicationParty | null) => void;
  errors: string[];
  setErrors: (errors: string[]) => void;
  showErrorSummary: boolean;
  setShowErrorSummary: (show: boolean) => void;
  validateForm: () => boolean;
  handleOperatorChange: (
    e: React.ChangeEvent<HTMLSelectElement>,
    options: ApplicationParty[]
  ) => void;
  resetForm: () => void;
}

/**
 * Custom hook for network operator form state and validation
 */
export const useNetworkOperatorForm = (): UseNetworkOperatorFormReturn => {
  const [networkOperatorRef, setNetworkOperatorRef] = useState("");
  const [selectedOrgName, setSelectedOrgName] = useState("");
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<ApplicationParty | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: string[] = [];

    // Applicant contact name is mandatory
    if (!selectedOrgName.trim()) {
      newErrors.push(FORM_ERRORS.MISSING_OPERATOR);
    }

    // Reference is optional, only validate if provided
    if (networkOperatorRef.trim() && !/^[A-Za-z0-9 -]+$/.test(networkOperatorRef.trim())) {
      newErrors.push(FORM_ERRORS.INVALID_REFERENCE);
    }

    setErrors(newErrors);
    setShowErrorSummary(newErrors.length > 0);

    return newErrors.length === 0;
  }, [networkOperatorRef, selectedOrgName]);

  const handleOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>, options: ApplicationParty[]) => {
      const selectedName = e.target.value;
      setSelectedOrgName(selectedName);
      const org = options.find((opt) => opt.person_name === selectedName);
      setSelectedOrganisation(org || null);
      
      // Clear errors when a valid selection is made
      if (selectedName.trim()) {
        setErrors(prev => prev.filter(error => error !== FORM_ERRORS.MISSING_OPERATOR));
        const filteredErrors = errors.filter(error => error !== FORM_ERRORS.MISSING_OPERATOR);
        if (filteredErrors.length === 0) {
          setShowErrorSummary(false);
        }
      }
    },
    [errors, setErrors, setShowErrorSummary]
  );

  const resetForm = useCallback(() => {
    setNetworkOperatorRef("");
    setSelectedOrgName("");
    setSelectedOrganisation(null);
    setErrors([]);
    setShowErrorSummary(false);
  }, []);

  return {
    networkOperatorRef,
    setNetworkOperatorRef,
    selectedOrgName,
    setSelectedOrgName,
    selectedOrganisation,
    setSelectedOrganisation,
    errors,
    setErrors,
    showErrorSummary,
    setShowErrorSummary,
    validateForm,
    handleOperatorChange,
    resetForm,
  };
};
