import { ObjectorDetails } from '../types';

const API_BASE = '/backend/api/nwl';

export const getObjectorDetails = async (applicationId: string): Promise<ObjectorDetails | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`);
    if (!response.ok) {
      if (response.status === 404) {
        // No objector details found yet - this is ok for new forms
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch objector details: ${response.status} ${errorText}`);
    }
    const data: ObjectorDetails = await response.json();
    console.log('[getObjectorDetails] Backend response:', data);
    return data;
  } catch (error) {
    console.error('[getObjectorDetails] Error:', error);
    throw error; // Re-throw so the hook can handle it properly
  }
};

export const saveObjectorDetails = async (
  applicationId: string,
  details: Partial<ObjectorDetails>
): Promise<ObjectorDetails | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save objector details: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const updateObjectorDetails = async (
  applicationId: string,
  details: Partial<ObjectorDetails>
): Promise<ObjectorDetails | null> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update objector details: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const deleteObjectorDetails = async (applicationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/objector-details`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete objector details: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    return false;
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
  return updateObjectorDetails(applicationId, data);
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
  return updateObjectorDetails(applicationId, data);
};

export const saveObjectorLandownerStatus = async (
  applicationId: string,
  isLandowner: boolean
): Promise<ObjectorDetails | null> => {
  return updateObjectorDetails(applicationId, { is_landowner: isLandowner });
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
  return updateObjectorDetails(applicationId, data);
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
  return updateObjectorDetails(applicationId, data);
};

export const saveRepresentativeStatus = async (
  applicationId: string,
  hasRepresentative: boolean
): Promise<ObjectorDetails | null> => {
  return updateObjectorDetails(applicationId, { has_representative: hasRepresentative });
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
  return updateObjectorDetails(applicationId, data);
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
  return updateObjectorDetails(applicationId, data);
};
