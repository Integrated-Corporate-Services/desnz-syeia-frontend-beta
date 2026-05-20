import { LandDetails } from '../types';

const API_BASE_URL = '/backend/api/nwl';

/**
 * Get land details for an application
 */
export const getLandDetails = async (applicationId: string): Promise<LandDetails | null> => {
  try {
    console.log('[getLandDetails] Fetching for applicationId:', applicationId);
    const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[getLandDetails] No land details found (404)');
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch land details: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[getLandDetails] Backend response:', data);
    return data;
  } catch (error) {
    console.error('[getLandDetails] Error:', error);
    throw error;
  }
};

/**
 * Update land details using PATCH
 */
export const updateLandDetails = async (
  applicationId: string,
  updates: Partial<LandDetails>
): Promise<LandDetails> => {
  console.log('[updateLandDetails] Sending PATCH request:', {
    applicationId,
    endpoint: `${API_BASE_URL}/${applicationId}/land-details`,
    payload: updates
  });
  
  const response = await fetch(`${API_BASE_URL}/${applicationId}/land-details`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[updateLandDetails] Failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`Failed to update land details: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('[updateLandDetails] Success response:', data);
  return data;
};

/**
 * Save site address
 */
export const saveSiteAddress = async (
  applicationId: string,
  data: {
    site_address_line1?: string;
    site_address_line2?: string;
    site_town?: string;
    site_county?: string;
    site_postcode?: string;
  }
): Promise<LandDetails> => {
  console.log('[saveSiteAddress] Saving:', { applicationId, data });
  return updateLandDetails(applicationId, data);
};

/**
 * Save country selection
 */
export const saveCountry = async (
  applicationId: string,
  country: string
): Promise<LandDetails> => {
  console.log('[saveCountry] Saving:', { applicationId, country });
  return updateLandDetails(applicationId, { country });
};

/**
 * Save land registry information
 */
export const saveLandRegistry = async (
  applicationId: string,
  data: {
    is_land_registered?: boolean;
    land_registry_title_number?: string;
  }
): Promise<LandDetails> => {
  console.log('[saveLandRegistry] Saving:', { applicationId, data });
  return updateLandDetails(applicationId, data);
};

/**
 * Save OS Grid Reference
 */
export const saveOSGridReference = async (
  applicationId: string,
  data: {
    os_grid_letter?: string;
    os_grid_easting?: string;
    os_grid_northing?: string;
  }
): Promise<LandDetails> => {
  console.log('[saveOSGridReference] Saving:', { applicationId, data });
  return updateLandDetails(applicationId, data);
};

/**
 * Save identifying information/land description
 */
export const saveIdentifyingInformation = async (
  applicationId: string,
  landDescription: string
): Promise<LandDetails> => {
  console.log('[saveIdentifyingInformation] Saving:', { applicationId, landDescription });
  return updateLandDetails(applicationId, { land_description: landDescription });
};

export const landDetailsService = {
  getLandDetails,
  updateLandDetails,
  saveSiteAddress,
  saveCountry,
  saveLandRegistry,
  saveOSGridReference,
  saveIdentifyingInformation,
};

