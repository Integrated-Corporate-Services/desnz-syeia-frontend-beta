import axios from 'axios';
import { createLogger } from '../utils/logger';
import { ApprovedDomainsResponse } from '../types/organisation';

const logger = createLogger('approvedDomainsService');

// Re-export for backward compatibility
export type { ApprovedDomainsResponse };

/**
 * Get approved email domains for an organisation
 */
export const getApprovedDomains = async (organisationId: string): Promise<string[]> => {
  try {
    logger.debug('Fetching approved domains', { organisationId });
    const response = await axios.get<ApprovedDomainsResponse>(
      `/backend/api/admin/organisations/${organisationId}/approved-domains`
    );
    logger.debug('Approved domains fetched successfully', { count: response.data.approved_domains.length });
    return response.data.approved_domains;
  } catch (error: any) {
    logger.error('Failed to fetch approved domains', {
      error: error.message,
      organisationId
    });
    throw error;
  }
};

/**
 * Update approved email domains for an organisation
 */
export const updateApprovedDomains = async (
  organisationId: string,
  domains: string[]
): Promise<string[]> => {
  try {
    logger.debug('Updating approved domains', { organisationId, domains });
    const response = await axios.put<ApprovedDomainsResponse>(
      `/backend/api/admin/organisations/${organisationId}/approved-domains`,
      { approved_domains: domains }
    );
    logger.debug('Approved domains updated successfully');
    return response.data.approved_domains;
  } catch (error: any) {
    logger.error('Failed to update approved domains', {
      error: error.message,
      organisationId
    });
    throw error;
  }
};
