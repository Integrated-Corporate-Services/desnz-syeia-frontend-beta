import { useState, useEffect } from 'react';
import organisationService from '../services/organisationService';
import { Organisation } from '../types/organisation';
import { createLogger } from '../utils/logger';

const logger = createLogger('useOrganisations');

export const useOrganisations = () => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await organisationService.getOrganisationsDetailed();
        if (response.success && response.data) {
          setOrganisations(response.data);
        } else {
          setError(response.message || 'Failed to load organisations');
        }
      } catch (error) {
        logger.error('Failed to load organisations:', error);
        setError('Failed to load organisations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, []);

  return {
    organisations,
    loading,
    error
  };
};
