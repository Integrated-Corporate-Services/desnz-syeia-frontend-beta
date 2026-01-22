import { useState, useEffect } from "react";
import { networkOperatorApiService } from "../../../services/networkOperatorApiService";

type NetworkOperator = {
  organisation_id: string;
  organisation_name: string;
  full_name: string;
  line1?: string;
};

/**
 * Custom hook to fetch network operators
 * @returns Network operators list, selected organisation, selected name, and handlers
 */
export const useNetworkOperators = () => {
  const [options, setOptions] = useState<NetworkOperator[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<NetworkOperator | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      setIsLoading(true);
      let orgOptions: NetworkOperator[] = [];
      try {
        const data = await networkOperatorApiService.getNetworkOperators();
        orgOptions = Array.isArray(data) ? data : [];
      } catch {
        orgOptions = [];
      }
      if (!isMounted) return;
      setOptions(orgOptions);
      // Don't auto-select - let user choose from dropdown
      setIsLoading(false);
    };
    fetchOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedOrgName(selectedName);
    const org = options.find((opt) => opt.organisation_name === selectedName);
    setSelectedOrganisation(org || null);
  };

  return {
    options,
    selectedOrganisation,
    selectedOrgName,
    isLoading,
    handleOrgChange,
  };
};
