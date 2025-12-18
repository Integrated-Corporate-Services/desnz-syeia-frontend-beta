import { useState, useEffect } from 'react';
import organisationService from '../services/organisationService';
import { Organisation } from '../types/organisation';
import { createLogger } from '../utils/logger';

const logger = createLogger('useOrganisation');

export const useOrganisation = (organisationId?: string) => {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrganisation = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        logger.debug('Fetching organisation', { organisationId });
        
        const result = await organisationService.getOrganisationById(organisationId);
        
        if (result.success && result.data) {
          logger.debug('Organisation fetched successfully');
          setOrganisation(result.data);
        } else {
          const errorMsg = result.message || 'Failed to fetch organisation';
          logger.error('Failed to fetch organisation', { error: errorMsg });
          setError(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || 'An error occurred while fetching organisation';
        logger.error('Error fetching organisation', { error: errorMsg });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisation();
  }, [organisationId]);

  return { organisation, loading, error };
};
