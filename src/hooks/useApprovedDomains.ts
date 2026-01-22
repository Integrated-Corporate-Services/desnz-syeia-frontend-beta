import { useState, useEffect } from 'react';
import * as approvedDomainsService from '../services/approvedDomainsService';
import { createLogger } from '../utils/logger';

const logger = createLogger('useApprovedDomains');

export const useApprovedDomains = (organisationId?: string) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchDomains = async () => {
    if (!organisationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      logger.debug('Fetching approved domains', { organisationId });
      
      const result = await approvedDomainsService.getApprovedDomains(organisationId);
      logger.debug('Approved domains fetched successfully', { count: result.length });
      setDomains(result);
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while fetching approved domains';
      logger.error('Error fetching approved domains', { error: errorMsg });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [organisationId]);

  const updateDomains = async (newDomains: string[]) => {
    if (!organisationId) {
      throw new Error('Organisation ID is required');
    }

    try {
      logger.debug('Updating approved domains', { organisationId, domains: newDomains });
      const result = await approvedDomainsService.updateApprovedDomains(
        organisationId,
        newDomains
      );
      logger.debug('Approved domains updated successfully');
      setDomains(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while updating approved domains';
      logger.error('Error updating approved domains', { error: errorMsg });
      throw err;
    }
  };

  return { domains, loading, error, updateDomains, refetch: fetchDomains };
};
