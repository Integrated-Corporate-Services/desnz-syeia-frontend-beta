import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';
const API_BASE = buildBackendUrl('/api/applications');

export interface LPADetails {
  lpaContactName: string;
  lpaContactEmail: string;
  lpaContactPhone: string;
}

/**
 * Get LPA details
 */
export async function getLpaDetails(applicationId: string, consultationId: string): Promise<LPADetails | null> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/lpa-details`;
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to get LPA details');
  }
  
  return await res.json();
}

/**
 * Save LPA details
 */
export async function saveLpaDetails(
  applicationId: string,
  consultationId: string,
  data: LPADetails
): Promise<{ success: boolean; data?: LPADetails }> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/lpa-details`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save LPA details');
  }
  
  return await res.json();
}