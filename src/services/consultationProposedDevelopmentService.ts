const API_BASE = '/backend/api/applications';

export interface ProposedDevelopmentData {
  projectDescription: string;
  representationsObjections: string;
  complianceDetails: string;
}

/**
 * Get proposed development
 */
export async function getProposedDevelopment(
  applicationId: string,
  consultationId: string
): Promise<ProposedDevelopmentData | null> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/proposed-development`;
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to get proposed development');
  }
  
  return await res.json();
}

/**
 * Save proposed development
 */
export async function saveProposedDevelopment(
  applicationId: string,
  consultationId: string,
  data: ProposedDevelopmentData
): Promise<{ success: boolean; data?: ProposedDevelopmentData }> {
  const url = `${API_BASE}/${applicationId}/consultations/${consultationId}/proposed-development`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save proposed development');
  }
  
  return await res.json();
}