import { useEffect, useState } from "react";
import { useAuthUserContext } from "../../../../context/AuthUserContext";
import { ROLES } from "../../../../constants/roles";
import type { ApplicationParty } from "../../../../types/application";
import type { TeamCoordinator } from "../../../../types/organisation";

interface UseRoleBasedLogicParams {
  coordinators: TeamCoordinator[];
  organisationId?: string;
  organisationName?: string;
  options: ApplicationParty[];
  setSelectedOrgName: (name: string) => void;
  setSelectedOrganisation: (org: ApplicationParty | null) => void;
  additionalContacts: string[];
  setAdditionalContacts: (contacts: string[]) => void;
}

interface UseRoleBasedLogicReturn {
  filteredOptions: ApplicationParty[];
  hasAutoSelectedDefault: boolean;
}

/**
 * Custom hook to handle role-based logic for different user types
 * Note: Role-based filtering is now handled by the backend (/api/network-operators)
 * This hook only handles auto-selection and auto-add email logic:
 * - Auto-select normal applicant's own name
 * - Auto-add Applicant Agent email to additional contacts
 */
export const useRoleBasedLogic = ({
  options,
  setSelectedOrgName,
  setSelectedOrganisation,

}: UseRoleBasedLogicParams): UseRoleBasedLogicReturn => {
  const { user } = useAuthUserContext();
  const [hasAutoSelectedDefault, setHasAutoSelectedDefault] = useState(false);
  
  // No filtering needed - backend now provides role-based filtering
  // Return all options as provided by the backend
  const filteredOptions = options;

  // Auto-select normal applicant's own name by default
  useEffect(() => {
    if (
      !user ||
      !filteredOptions.length ||
      hasAutoSelectedDefault ||
      user.role !== ROLES.APPLICANT_USER
    ) return;

    const userFullName = `${user.first_name} ${user.last_name}`;
    const userOption = filteredOptions.find(option => 
      option.person_name === userFullName
    );

    if (userOption && userOption.person_name) {
      setSelectedOrgName(userOption.person_name);
      setSelectedOrganisation(userOption);
      setHasAutoSelectedDefault(true);
    }
  }, [user, filteredOptions, hasAutoSelectedDefault, setSelectedOrgName, setSelectedOrganisation]);

 
  return {
    filteredOptions,
    hasAutoSelectedDefault,
  };
};
