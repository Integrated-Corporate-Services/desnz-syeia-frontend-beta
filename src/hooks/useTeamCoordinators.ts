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

export const useTeamCoordinator = (
  organisationId?: string,
  coordinatorId?: string
) => {
  const [coordinator, setCoordinator] = useState<TeamCoordinator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // useTeamCoordinator useEffect triggered

    const fetchCoordinator = async () => {
      if (!organisationId || !coordinatorId) {
        // Missing IDs, aborting
        setLoading(false);
        return;
      }

      try {
        // Starting fetch
        setLoading(true);
        setError("");
        logger.debug("Fetching team coordinator", {
          organisationId,
          coordinatorId,
        });

        const result = await teamCoordinatorService.getTeamCoordinatorById(
          organisationId,
          coordinatorId
        );
        logger.debug("Team coordinator fetched successfully");
        // Fetch successful, setting coordinator
        setCoordinator(result);
      } catch (err: any) {
        const errorMsg =
          err.message || "An error occurred while fetching team coordinator";
        logger.error("[useTeamCoordinator] Fetch failed:", err, {
          errorMsg,
          status: err.response?.status,
        });
        logger.error("Error fetching team coordinator", { error: errorMsg });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinator();
  }, [organisationId, coordinatorId]);

  const updateCoordinator = async (updates: any) => {
    if (!organisationId || !coordinatorId) {
      throw new Error("Organisation ID and Coordinator ID are required");
    }

    try {
      logger.debug("Updating team coordinator", { coordinatorId, updates });
      const result = await teamCoordinatorService.updateTeamCoordinator(
        organisationId,
        coordinatorId,
        updates
      );
      logger.debug("Team coordinator updated successfully");
      setCoordinator(result);
      return result;
    } catch (err: any) {
      const errorMsg =
        err.message || "An error occurred while updating team coordinator";
      logger.error("Error updating team coordinator", { error: errorMsg });
      throw err;
    }
  };

  return { coordinator, loading, error, updateCoordinator };
};
