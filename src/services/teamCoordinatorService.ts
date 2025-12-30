import axios from "axios";
import { createLogger } from "../utils/logger";
import {
  TeamCoordinator,
  UpdateTeamCoordinatorData,
} from "../types/organisation";

const logger = createLogger("teamCoordinatorService");

// Re-export for backward compatibility
export type { TeamCoordinator, UpdateTeamCoordinatorData };

/**
 * Get all team coordinators for the user's organisation
 * Uses the new /api/team-coordinators endpoint which:
 * - Accepts optional organisation_id query parameter (for agents)
 * - Falls back to user's organisation_id if not provided
 * - Returns only approved coordinators
 * - Accessible by DNO_TEAM_COORDINATOR, DNO_AGENT, and DNO_USER
 */
export const getTeamCoordinators = async (
  organisationId?: string
): Promise<TeamCoordinator[]> => {
  try {
    logger.debug("Fetching team coordinators", { organisationId });
    const url = organisationId
      ? `/backend/api/team-coordinators?organisation_id=${organisationId}`
      : `/backend/api/team-coordinators`;
    const response = await axios.get(url);
    logger.debug("Team coordinators fetched successfully", {
      count: response.data.length,
    });
    return response.data;
  } catch (error: any) {
    logger.error("Failed to fetch team coordinators", {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get a specific team coordinator by ID
 */
export const getTeamCoordinatorById = async (
  organisationId: string,
  coordinatorId: string
): Promise<TeamCoordinator> => {
  try {
    logger.debug("Fetching team coordinator", {
      organisationId,
      coordinatorId,
    });
    const url = `/backend/api/admin/organisations/${organisationId}/team-coordinators/${coordinatorId}`;
    const response = await axios.get(url);
    logger.debug("Team coordinator fetched successfully", {
      data: response.data,
    });
    return response.data;
  } catch (error: any) {
    logger.error("Failed to fetch team coordinator", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      organisationId,
      coordinatorId,
    });
    throw error;
  }
};

/**
 * Update team coordinator details
 */
export const updateTeamCoordinator = async (
  organisationId: string,
  coordinatorId: string,
  updates: UpdateTeamCoordinatorData
): Promise<TeamCoordinator> => {
  try {
    logger.debug("Updating team coordinator", {
      organisationId,
      coordinatorId,
      updates,
    });
    const response = await axios.put(
      `/backend/api/admin/organisations/${organisationId}/team-coordinators/${coordinatorId}`,
      updates
    );
    logger.debug("Team coordinator updated successfully");
    return response.data;
  } catch (error: any) {
    logger.error("Failed to update team coordinator", {
      error: error.message,
      organisationId,
      coordinatorId,
    });
    throw error;
  }
};
