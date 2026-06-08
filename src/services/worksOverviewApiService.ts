import { WorksOverviewRequest } from '../types/works';
import { buildBackendUrl } from '../utils/apiConfig';

// Fetch WorksOverview by applicationId
export async function getWorksOverview(applicationId: string) {
  const response = await fetch(buildBackendUrl(`/backend/api/applications/${applicationId}/works-overview`), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch works overview');
  }
  return response.json();
}

// Create WorksOverview
export async function createWorksOverview(payload: WorksOverviewRequest) {
  const response = await fetch(buildBackendUrl('/backend/api/applications/works-overview'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create works overview');
  }
  return response.json();
}

// Update WorksOverview
export async function updateWorksOverview(applicationId: string, payload: WorksOverviewRequest) {
  const response = await fetch(buildBackendUrl(`/backend/api/applications/works-overview/${applicationId}`), {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update works overview');
  }
  return response.json();
}
