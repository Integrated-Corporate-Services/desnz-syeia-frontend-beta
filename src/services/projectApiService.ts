// src/services/projectApiService.ts

export const getProjectOverview = async (applicationId: string) => {
  const response = await fetch(`/api/project/${applicationId}`);
  if (!response.ok) throw new Error('Failed to fetch project overview');
  return response.json();
};

export const saveProjectOverview = async (data: any) => {
  const response = await fetch('/api/project/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save project overview');
  return response.json();
};

// Fetch all projects except the given applicationId
export const listProjects = async (applicationId: string) => {
  const response = await fetch(`/api/project?applicationId=${applicationId}`);
  if (!response.ok) throw new Error('Failed to fetch project list');
  return response.json();
};
