import { useState, useCallback } from "react";
import type { ApplicationParty } from "../../../types/application";
import { FORM_ERRORS } from "../constants/networkOperatorDetails";

interface UseNetworkOperatorFormReturn {
  networkOperatorRef: string;
  setNetworkOperatorRef: (value: string) => void;
  selectedOrgName: string;
  setSelectedOrgName: (value: string) => void;
  selectedOrganisation: ApplicationParty | null;
  setSelectedOrganisation: (org: ApplicationParty | null) => void;
  errors: string[];
  showErrorSummary: boolean;
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

    if (!networkOperatorRef.trim()) {
      newErrors.push(FORM_ERRORS.MISSING_REFERENCE);
    } else if (!/^[A-Za-z0-9 \-]+$/.test(networkOperatorRef.trim())) {
      newErrors.push(FORM_ERRORS.INVALID_REFERENCE);
    }
    if (!selectedOrgName.trim()) {
      newErrors.push(FORM_ERRORS.MISSING_OPERATOR);
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
    },
    []
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
    showErrorSummary,
    validateForm,
    handleOperatorChange,
    resetForm,
  };
};
