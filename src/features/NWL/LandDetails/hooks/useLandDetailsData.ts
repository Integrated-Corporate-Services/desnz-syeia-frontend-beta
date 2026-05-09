import { useState, useEffect } from 'react';
import { LandDetails } from '../types';

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

    setIsLoading(true);
    
    setIsLoading(false);
  }, [applicationId]);

  const updateLandDetails = (updates: Partial<LandDetails>) => {
    setLandDetails(prev => ({ ...prev, ...updates }));
  };

  return {
    landDetails,
    updateLandDetails,
    isLoading,
  };
};
