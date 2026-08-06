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
    const response = await axios.get<ApprovedDomainsResponse>(
      `/api/admin/organisations/${organisationId}/approved-domains`
    );
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
    const response = await axios.put<ApprovedDomainsResponse>(
      `/api/admin/organisations/${organisationId}/approved-domains`,
      { approved_domains: domains }
    );
    return response.data.approved_domains;
  } catch (error: any) {
    logger.error('Failed to update approved domains', {
      error: error.message,
      organisationId
    });
    throw error;
  }
};
