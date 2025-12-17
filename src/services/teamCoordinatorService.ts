import axios from 'axios';
import { createLogger } from '../utils/logger';
import { TeamCoordinator, UpdateTeamCoordinatorData } from '../types/organisation';

const logger = createLogger('teamCoordinatorService');

// Re-export for backward compatibility
export type { TeamCoordinator, UpdateTeamCoordinatorData };

/**
 * Get all team coordinators for an organisation
 */
export const getTeamCoordinators = async (organisationId: string): Promise<TeamCoordinator[]> => {
  try {
    logger.debug('Fetching team coordinators', { organisationId });
    const response = await axios.get(
      `/backend/api/admin/organisations/${organisationId}/team-coordinators`
    );
    logger.debug('Team coordinators fetched successfully', { count: response.data.length });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to fetch team coordinators', {
      error: error.message,
      organisationId
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
    logger.debug('Fetching team coordinator', { organisationId, coordinatorId });
    const response = await axios.get(
      `/backend/api/admin/organisations/${organisationId}/team-coordinators/${coordinatorId}`
    );
    logger.debug('Team coordinator fetched successfully');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to fetch team coordinator', {
      error: error.message,
      organisationId,
      coordinatorId
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
    logger.debug('Updating team coordinator', { organisationId, coordinatorId, updates });
    const response = await axios.put(
      `/backend/api/admin/organisations/${organisationId}/team-coordinators/${coordinatorId}`,
      updates
    );
    logger.debug('Team coordinator updated successfully');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to update team coordinator', {
      error: error.message,
      organisationId,
      coordinatorId
    });
    throw error;
  }
};
