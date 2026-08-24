import { useMemo } from "react";
import type { ApplicationParty } from "../../../../types/application";
import type { TeamCoordinator } from "../../../../types/organisation";
import { createLogger } from "../../../../utils/logger";

const logger = createLogger("useCoordinatorOptions-NWL");

interface UseCoordinatorOptionsParams {
  coordinators: TeamCoordinator[];
  organisationId?: string;
  organisationName?: string;
}

/**
 * Custom hook to map team coordinators to dropdown options
 * Filters coordinators by organization ID and memoized for performance
 */
export const useCoordinatorOptions = ({
  coordinators,
  organisationId,
  organisationName = "",
}: UseCoordinatorOptionsParams): ApplicationParty[] => {
  return useMemo(() => {
    if (!organisationId || !coordinators.length) {
      logger.debug("No organisation ID provided or no coordinators available", {
        organisationId,
        coordinatorsCount: coordinators.length,
      });
      return [];
    }

    // Filter coordinators to only include those from the selected organization
    const filteredCoordinators = coordinators.filter(
      (coord: TeamCoordinator) => coord.organisation_id === organisationId
    );


    return filteredCoordinators.map((coord: TeamCoordinator) => ({
      organisation_id: organisationId,
      organisation_name: organisationName,
      // IMPORTANT: Use person_id (not user_id) - person is core identity, user is auth layer
      // Backend FK constraint: contact_person_id REFERENCES person(person_id)
      person_id: coord.person_id,
      contact_id: coord.person_id,
      person_name: `${coord.first_name} ${coord.last_name}`,
      line1: coord.address_line1 ?? "",
      line2: coord.address_line2 ?? undefined,
      city: coord.town_city ?? undefined,
      county: coord.organisation_name,
      postcode: coord.postcode ?? undefined,
      email: coord.email,
      phone: coord.phone_number ?? undefined,
      party_type: "Network Operator",
      is_primary: true,
      contact_isconfirmed: true,
    }));
  }, [coordinators, organisationId, organisationName]);
};
