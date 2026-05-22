import { useState, useEffect } from 'react';
import { LandDetails } from '../types';
import { landDetailsService } from '../services/landDetailsService';
import logger from '../../../../logger';

export const useLandDetailsData = (applicationId: string) => {
  const [landDetails, setLandDetails] = useState<LandDetails>({
    site_address_line1: '',
    site_address_line2: '',
    site_town: '',
    site_county: '',
    site_postcode: '',
    site_country: '',
    land_registry_title_number: '',
    os_grid_reference_letter: '',
    os_grid_reference_easting: '',
    os_grid_reference_northing: '',
    what3words_address: '',
    identifying_information: '',
    additional_land_description: '',
    uploadedFiles: [],
    applicationDocuments: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!applicationId) return;

    const fetchLandDetails = async () => {
      setIsLoading(true);
      try {
        const data = await landDetailsService.getLandDetails(applicationId);
        if (data) {
          setLandDetails(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        logger.error('Failed to fetch land details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandDetails();
  }, [applicationId]);

  const updateLandDetails = async (updates: Partial<LandDetails>) => {
    // Update local state immediately for UI responsiveness
    setLandDetails(prev => ({ ...prev, ...updates }));
    
    // Save to backend
    try {
      const result = await landDetailsService.updateLandDetails(applicationId, updates);
      if (result) {
        // Update with server response to ensure consistency
        setLandDetails(prev => ({ ...prev, ...result }));
      }
    } catch (error) {
      logger.error('Failed to save land details:', error);
      // Don't revert local state - user can retry
      throw error;
    }
  };

  return {
    landDetails,
    updateLandDetails,
    isLoading,
  };
};
