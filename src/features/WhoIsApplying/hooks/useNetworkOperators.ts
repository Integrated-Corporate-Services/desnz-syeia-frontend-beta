import { useState, useEffect } from "react";
import { networkOperatorApiService } from "../../../services/networkOperatorApiService";

// Type for individual user from backend
type NetworkOperatorUser = {
  organisation_id: string;
  organisation_name: string;
  first_name: string;
  last_name: string;
  person_id: string;
  email: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  town_city?: string;
  county?: string;
  postcode?: string;
  role: string;
  user_id: string;
  status: string;
};

// Type for organization summary (what we show in WhoIsApplying dropdown)
export type OrganizationOption = {
  organisation_id: string;
  organisation_name: string;
  users: NetworkOperatorUser[]; // All users in this organization
};

/**
 * Custom hook to fetch network operators for "Who is applying?" page
 * Groups individual users by organization and returns unique organizations
 * @returns Organization options, selected organisation, selected name, and handlers
 */
export const useNetworkOperators = () => {
  const [options, setOptions] = useState<OrganizationOption[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<OrganizationOption | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      setIsLoading(true);
      let organizationOptions: OrganizationOption[] = [];
      try {
        const data = await networkOperatorApiService.getNetworkOperators();
        const users: NetworkOperatorUser[] = Array.isArray(data) ? data : [];
        
        // Group users by organization
        const organizationsMap = new Map<string, OrganizationOption>();
        
        users.forEach(user => {
          const orgId = user.organisation_id;
          if (organizationsMap.has(orgId)) {
            organizationsMap.get(orgId)!.users.push(user);
          } else {
            organizationsMap.set(orgId, {
              organisation_id: orgId,
              organisation_name: user.organisation_name,
              users: [user]
            });
          }
        });
        
        organizationOptions = Array.from(organizationsMap.values());
      } catch {
        organizationOptions = [];
      }
      if (!isMounted) return;
      setOptions(organizationOptions);
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
    // Find organization by organization name
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
