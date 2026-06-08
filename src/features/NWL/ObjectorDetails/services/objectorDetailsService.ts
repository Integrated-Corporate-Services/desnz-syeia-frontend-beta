import { ObjectorDetails } from '../types';

import { buildBackendUrl } from '../../../../utils/apiConfig';

const API_BASE = buildBackendUrl('/backend/api/nwl');

export const getObjectorDetails = async (applicationId: string): Promise<ObjectorDetails | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(`Failed to fetch objector details: ${response.statusText}`);
      error.status = response.status;
      error.validationErrors = errorData.details || errorData.message || errorData;
      throw error;
    }
    return await response.json();
  } catch (error) {
    console.error('[Frontend Service] Error fetching objector details:', error);
    // Return null for 404, throw for other errors
    if ((error as any).status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Save or update objector details (upsert)
 * Backend PATCH endpoint handles both create and update automatically
 */
export const saveObjectorDetails = async (
  applicationId: string,
  details: Partial<ObjectorDetails>
): Promise<ObjectorDetails | null> => {
  try {
    console.log('[Frontend Service] About to send PATCH request', {
      applicationId,
      details,
      detailsKeys: Object.keys(details),
      objector_organisation: details.objector_organisation,
      detailsStringified: JSON.stringify(details)
    });

    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(details),
    });
    
    console.log('[Frontend Service] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(`Failed to save objector details: ${response.statusText}`);
      error.status = response.status;
      error.validationErrors = errorData.details || errorData.message || errorData;
      throw error;
    }
    
    const result = await response.json();
    console.log('[Frontend Service] Response data:', result);
    
    return result;
  } catch (error) {
    console.error('[Frontend Service] Error saving objector details:', error);
    throw error;
  }
};

export const deleteObjectorDetails = async (applicationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(`Failed to delete objector details: ${response.statusText}`);
      error.status = response.status;
      error.validationErrors = errorData.details || errorData.message || errorData;
      throw error;
    }

    return true;
  } catch (error) {
    console.error('[Frontend Service] Error deleting objector details:', error);
    throw error;
  }
};

export const saveObjectorPersonalInfo = async (
  applicationId: string,
  data: {
    objector_title?: string;
    objector_full_name?: string;
    objector_organisation?: string;
    objector_email?: string;
    objector_phone?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};

export const saveObjectorAddress = async (
  applicationId: string,
  data: {
    objector_address_line1?: string;
    objector_address_line2?: string;
    objector_town?: string;
    objector_county?: string;
    objector_postcode?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};

export const saveObjectorLandownerStatus = async (
  applicationId: string,
  isLandowner: boolean
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, { is_objector_also_landowner: isLandowner });
};

export const saveLandownerDetails = async (
  applicationId: string,
  data: {
    landowner_title?: string;
    landowner_full_name?: string;
    landowner_organisation?: string;
    landowner_email?: string;
    landowner_phone?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};

export const saveLandownerAddress = async (
  applicationId: string,
  data: {
    landowner_address_line1?: string;
    landowner_address_line2?: string;
    landowner_town?: string;
    landowner_county?: string;
    landowner_postcode?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};

export const saveRepresentativeStatus = async (
  applicationId: string,
  hasRepresentative: boolean
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, { has_representative: hasRepresentative });
};

export const saveRepresentativeDetails = async (
  applicationId: string,
  data: {
    representative_title?: string;
    representative_full_name?: string;
    representative_organisation?: string;
    representative_email?: string;
    representative_phone?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};

export const saveRepresentativeAddress = async (
  applicationId: string,
  data: {
    representative_address_line1?: string;
    representative_address_line2?: string;
    representative_town?: string;
    representative_county?: string;
    representative_postcode?: string;
  }
): Promise<ObjectorDetails | null> => {
  return saveObjectorDetails(applicationId, data);
};
