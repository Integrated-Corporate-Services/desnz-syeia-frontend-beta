import { useState, useEffect } from "react";
import * as teamCoordinatorService from "../services/teamCoordinatorService";
import { TeamCoordinator } from "../types/organisation";
import { createLogger } from "../utils/logger";

const logger = createLogger("useTeamCoordinators");

export const useTeamCoordinators = (organisationId?: string) => {
  const [coordinators, setCoordinators] = useState<TeamCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCoordinators = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        logger.debug("Fetching team coordinators", { organisationId });

        const result = await teamCoordinatorService.getTeamCoordinators(
          organisationId
        );
        logger.debug("Team coordinators fetched successfully", {
          count: result.length,
        });
        setCoordinators(result);
      } catch (err: any) {
        const errorMsg =
          err.message || "An error occurred while fetching team coordinators";
        logger.error("Error fetching team coordinators", { error: errorMsg });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinators();
  }, [organisationId]);

  return { coordinators, loading, error };
};
