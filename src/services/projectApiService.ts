// src/services/projectApiService.ts
import { buildBackendUrl } from '../utils/apiConfig';

export const getProjectOverview = async (applicationId: string) => {
  const response = await fetch(buildBackendUrl(`/backend/api/project/${applicationId}`), {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch project overview');
  return response.json();
};

export const saveProjectOverview = async (data: any) => {
  const response = await fetch(buildBackendUrl('/backend/api/project/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = 'Failed to save project overview';
    
    try {
      const errorData = await response.json();
      
      // Handle version conflict (409)
      if (response.status === 409 || errorData.error === 'VERSION_CONFLICT') {
        const conflictError: any = new Error(errorData.message );
        conflictError.statusCode = 409;
        conflictError.isVersionConflict = true;
        throw conflictError;
      }
      
      if (errorData.error === 'numeric field overflow') {
        errorMessage = 'One or more values are too large. Please check the pole height is 9999 metres or less.';
      } else if (errorData.message) {
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
};

// Fetch all projects except the given applicationId
export const listProjects = async (applicationId: string) => {
  const response = await fetch(buildBackendUrl(`/backend/api/project?applicationId=${applicationId}`), {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch project list');
  return response.json();
};