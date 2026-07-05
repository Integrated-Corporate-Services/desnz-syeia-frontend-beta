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
    let errorMessage = 'Failed to update works overview';
    
    try {
      const errorData = await response.json();
      
      // Handle version conflict (409)
      if (response.status === 409 || errorData.error === 'VERSION_CONFLICT') {
        const conflictError: any = new Error(errorData.message);
        conflictError.statusCode = 409;
        conflictError.isVersionConflict = true;
        throw conflictError;
      }
      
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (parseError: any) {
      // If it's already our conflict error, re-throw it
      if (parseError.isVersionConflict) {
        throw parseError;
      }
      // If JSON parsing fails, use default error message
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
}
