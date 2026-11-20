import axios from "axios";
import { createLogger } from "../utils/logger";
import { TeamCoordinator } from "../types/organisation";

const logger = createLogger("teamCoordinatorService");

// Re-export for backward compatibility
export type { TeamCoordinator };

/**
 * Get all team coordinators for the user's organisation
 * Uses the new /api/team-coordinators endpoint which:
 * - Accepts optional organisation_id query parameter (for agents)
 * - Falls back to user's organisation_id if not provided
 * - Returns only approved coordinators
 * - Accessible by APPLICANT_TEAM_COORDINATOR, APPLICANT_AGENT, and APPLICANT_USER
 */
export const getTeamCoordinators = async (
  organisationId?: string,
): Promise<TeamCoordinator[]> => {
  try {
    const url = organisationId
      ? `/api/team-coordinators?organisation_id=${organisationId}`
      : `/api/team-coordinators`;
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    logger.error("Failed to fetch team coordinators", {
      error: error.message,
    });
    throw error;
  }
};

