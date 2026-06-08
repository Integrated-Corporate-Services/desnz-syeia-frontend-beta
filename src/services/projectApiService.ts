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
  if (!response.ok) throw new Error('Failed to save project overview');
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
