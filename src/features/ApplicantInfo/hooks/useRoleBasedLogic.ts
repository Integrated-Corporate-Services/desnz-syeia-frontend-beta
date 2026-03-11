import { useEffect, useState, useMemo } from "react";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import { ROLES } from "../../../constants/roles";
import type { ApplicationParty } from "../../../types/application";
import type { TeamCoordinator } from "../../../types/organisation";

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
 * AC5: Applicant Agent - show only DNO team coordinators, not agents
 * AC6: Normal Applicant - auto-select own name, show team members but not agents
 * AC7: Applicant Agent - auto-add email to additional contacts
 */
export const useRoleBasedLogic = ({
  coordinators,
  options,
  setSelectedOrgName,
  setSelectedOrganisation,
  additionalContacts,
  setAdditionalContacts,
}: UseRoleBasedLogicParams): UseRoleBasedLogicReturn => {
  const { user } = useAuthUserContext();
  const [hasAutoSelectedDefault, setHasAutoSelectedDefault] = useState(false);
  const [hasAutoAddedAgentEmail, setHasAutoAddedAgentEmail] = useState(false);

  // Filter options based on user role
  const filteredOptions = useMemo(() => {
    if (!user || !coordinators.length) return options;

    if (user.role === ROLES.APPLICANT_AGENT) {
      // AC5: Applicant Agent should only see DNO team coordinators, not agents
      return options.filter(option => {
        const coordinator = coordinators.find(coord => 
          `${coord.first_name} ${coord.last_name}` === option.person_name
        );
        // Only show if it's a team coordinator and not an agent
        return coordinator && coordinator.role === ROLES.APPLICANT_TEAM_COORDINATOR;
      });
    } else if (user.role === ROLES.APPLICANT_USER) {
      // AC6: Normal Applicant should see team members but not agents
      return options.filter(option => {
        const coordinator = coordinators.find(coord => 
          `${coord.first_name} ${coord.last_name}` === option.person_name
        );
        // Show team members (including themselves) but not agents
        return coordinator && 
          (coordinator.role === ROLES.APPLICANT_TEAM_COORDINATOR || 
           coordinator.role === ROLES.APPLICANT_USER);
      });
    }

    return options;
  }, [user, coordinators, options]);

  // AC6: Auto-select normal applicant's own name by default
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

  // AC7: Auto-add Applicant Agent email to additional contacts
  useEffect(() => {
    if (
      !user ||
      user.role !== ROLES.APPLICANT_AGENT ||
      !user.email ||
      hasAutoAddedAgentEmail ||
      additionalContacts.includes(user.email)
    ) return;

    setAdditionalContacts([...additionalContacts, user.email]);
    setHasAutoAddedAgentEmail(true);
  }, [user, additionalContacts, hasAutoAddedAgentEmail, setAdditionalContacts]);

  return {
    filteredOptions,
    hasAutoSelectedDefault,
  };
};