import { useState, useEffect } from 'react';
import { LandDetails } from '../types';
import { landDetailsService } from '../services/landDetailsService';
import logger from '../../../../logger';
import { useAuthUser } from '../../../../hooks/useAuthUser';

export const useLandDetailsData = (applicationId: string) => {
  const { user } = useAuthUser();
  const [landDetails, setLandDetails] = useState<LandDetails>({
    is_site_at_objector_address: undefined,
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

    // Avoid sending a PATCH if there are no actual value changes
    const prevState: Partial<LandDetails> = landDetails;

    const changedKeys = Object.keys(updates).filter((k) => {
      const key = k as keyof LandDetails;
      const newVal = (updates as any)[key];
      const oldVal = (prevState as any)[key];
      try {
        if (Array.isArray(newVal) || typeof newVal === 'object') {
          return JSON.stringify(newVal) !== JSON.stringify(oldVal);
        }
        return newVal !== oldVal;
      } catch (_e) {
        return true;
      }
    });

    if (changedKeys.length === 0) {
      // No changes to persist
      return prevState as LandDetails;
    }

    // Build a reduced updates object containing only actual changes
    const reducedUpdates: Partial<LandDetails> = {};
    changedKeys.forEach(k => { (reducedUpdates as any)[k] = (updates as any)[k]; });

    // Save to backend
    try {
      // Ensure applicationDocuments include a non-null addedBy (backend requires added_by)
      if ((reducedUpdates as any).applicationDocuments && Array.isArray((reducedUpdates as any).applicationDocuments)) {
        const uid = user?.user_id || undefined;
        (reducedUpdates as any).applicationDocuments = (reducedUpdates as any).applicationDocuments.map((doc: any) => ({
          ...doc,
          addedBy: doc.addedBy || doc.added_by || uid,
        }));
      }

      const result = await landDetailsService.updateLandDetails(applicationId, reducedUpdates);
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
