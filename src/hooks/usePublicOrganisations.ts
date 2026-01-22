import { useState, useEffect } from "react";
import organisationService from "../services/organisationService";
import { createLogger } from "../utils/logger";

const logger = createLogger("usePublicOrganisations");

interface OrganisationOption {
  value: string;
  label: string;
}

interface OrganisationResponse {
  organisation_id: string;
  organisation_name?: string;
  name?: string;
}

export const usePublicOrganisations = () => {
  const [organisations, setOrganisations] = useState<OrganisationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await organisationService.getPublicOrganisations();

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to fetch organisations");
        }

        logger.debug("Public organisations fetched", {
          count: response.data.length,
        });

        const formattedOrgs = response.data.map(
          (org: OrganisationResponse) => ({
            value: org.organisation_id,
            label: org.organisation_name || org.name || "Unknown Organisation",
          })
        );

        setOrganisations(formattedOrgs);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch organisations";
        logger.error("Failed to fetch public organisations", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganisations();
  }, []);

  return { organisations, isLoading, error };
};
