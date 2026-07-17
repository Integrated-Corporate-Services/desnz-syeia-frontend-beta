import { NegotiationsData } from '../types';
import { createLogger } from '../../../../utils/logger';
import { getCsrfHeaders } from '../../../../utils/csrf';

const logger = createLogger('negotiationsService');
import { buildBackendUrl } from '../../../../utils/apiConfig';

const API_BASE = buildBackendUrl('/api/nwl');

// Re-export Page IDs for convenience
export { NEGOTIATIONS_PAGE_IDS } from '../constants/pageNames';

export const getNegotiationsData = async (applicationId: string): Promise<NegotiationsData | null> => {
  try {
    logger.debug('[getNegotiationsData] Fetching from API:', `${API_BASE}/${applicationId}/negotiations`);
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      credentials: 'include'
    });
    
    logger.debug('[getNegotiationsData] Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        logger.debug('[getNegotiationsData] Not found (404), returning null');
        return null;
      }
      const errorText = await response.text();
      logger.error('[getNegotiationsData] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch negotiations data: ${response.statusText}`);
    }
    
    const data = await response.json();
    logger.debug('[getNegotiationsData] Received data from API:', {
      hasData: !!data,
      has_negotiations: data?.has_negotiations,
      negotiations_comments: data?.negotiations_comments,
      comments_length: data?.negotiations_comments?.length,
      no_negotiations_reason: data?.no_negotiations_reason,
      reason_length: data?.no_negotiations_reason?.length || 0,
      uploaded_files_count: data?.uploaded_files?.length || 0,
      application_documents_count: data?.application_documents?.length || 0,
      uploaded_files_sample: data?.uploaded_files?.[0],
      application_documents_sample: data?.application_documents?.[0],
      full_data: JSON.stringify(data, null, 2),
    });
    
    return data;
  } catch (error: unknown) {
    logger.error('[getNegotiationsData] Error:', error);
    if (error instanceof Error) {
      logger.error('[getNegotiationsData] Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
};

/**
 * Save negotiations data (creates if doesn't exist, updates if exists)
 * Uses POST which does upsert on backend
 * @param applicationId - Application ID
 * @param data - Negotiations data
 * @param pageId - Optional Page ID for page-specific validation (e.g., 'tell-us-negotiations', 'evidence-of-negotiations', 'why-no-negotiations')
 */
export const saveNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>,
  pageId?: string
): Promise<NegotiationsData | null> => {
  try {
    logger.debug('[saveNegotiationsData] Sending POST request:', {
      applicationId,
      pageId,
      data: JSON.stringify(data, null, 2),
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add X-Page-ID header if pageId is provided for page-specific validation
    if (pageId) {
      headers['X-Page-ID'] = pageId;
    }

    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'POST',
      headers: {
        ...headers,
        ...getCsrfHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('[saveNegotiationsData] POST failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Failed to save negotiations data: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const result = await response.json();
    logger.debug('[saveNegotiationsData] POST successful:', result);
    return result;
  } catch (error) {
    logger.error('[saveNegotiationsData] Error:', error);
    return null;
  }
};

/**
 * Update negotiations data (alias for saveNegotiationsData for backward compatibility)
 * Now uses POST instead of PATCH to support upsert pattern
 * @param pageId - Optional Page ID for page-specific validation
 */
export const updateNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>,
  pageId?: string
): Promise<NegotiationsData | null> => {
  // Use POST (upsert) instead of PATCH to ensure record is created if it doesn't exist
  return saveNegotiationsData(applicationId, data, pageId);
};

/**
 * Partial update of negotiations (only updates provided fields)
 * If record doesn't exist (404), automatically falls back to POST (upsert)
 * @param pageId - Optional Page ID for page-specific validation
 */
export const patchNegotiationsData = async (
  applicationId: string,
  data: Partial<NegotiationsData>,
  pageId?: string
): Promise<NegotiationsData | null> => {
  try {
    logger.debug('[patchNegotiationsData] Attempting PATCH for applicationId:', applicationId);
    logger.debug('[patchNegotiationsData] PageId:', pageId);
    logger.debug('[patchNegotiationsData] Payload:', JSON.stringify(data, null, 2));
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add X-Page-ID header if pageId is provided for page-specific validation
    if (pageId) {
      headers['X-Page-ID'] = pageId;
    }
    
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'PATCH',
      headers: {
        ...headers,
        ...getCsrfHeaders(),
      },
      body: JSON.stringify(data),
    });
    
    logger.debug('[patchNegotiationsData] Response status:', response.status);
    
    // If record doesn't exist (404), fallback to POST (upsert)
    if (response.status === 404) {
      logger.debug('[patchNegotiationsData] Record not found (404), falling back to POST (upsert)...');
      return await saveNegotiationsData(applicationId, data, pageId);
    }
    
    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('[patchNegotiationsData] PATCH failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`Failed to update negotiations data: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const result = await response.json();
    logger.debug('[patchNegotiationsData] PATCH successful:', {
      negotiations_id: result.negotiations_id,
      has_negotiations: result.has_negotiations,
      no_negotiations_reason: result.no_negotiations_reason,
      reason_length: result.no_negotiations_reason?.length || 0,
      full_result: JSON.stringify(result, null, 2),
    });
    return result;
  } catch (error: unknown) {
    logger.error('[patchNegotiationsData] Error updating negotiations data:', error);
    
    // If PATCH fails, try POST as fallback
    logger.debug('[patchNegotiationsData] Attempting POST fallback after error...');
    try {
      return await saveNegotiationsData(applicationId, data);
    } catch (fallbackError: unknown) {
      logger.error('[patchNegotiationsData] POST fallback also failed:', fallbackError);
      return null;
    }
  }
};

export const deleteNegotiationsData = async (applicationId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${applicationId}/negotiations`, {
      method: 'DELETE',
      headers: {
        ...getCsrfHeaders(),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete negotiations data: ${response.statusText}`);
    }
    
    return true;
  } catch (error: unknown) {
    logger.error('Error deleting negotiations data:', error);
    return false;
  }
};
