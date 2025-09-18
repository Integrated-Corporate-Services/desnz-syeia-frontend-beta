// src/services/projectApiService.ts

export const getProjectOverview = async (applicationId: string) => {
  const response = await fetch(`/api/projects/overview/${applicationId}`);
  if (!response.ok) throw new Error('Failed to fetch project overview');
  return response.json();
};

export const saveProjectOverview = async (data: any) => {
  const response = await fetch('/api/projects/overview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save project overview');
  return response.json();
};

export const listProjects = async () => {
  const response = await fetch('/api/projects/list');
  if (!response.ok) throw new Error('Failed to fetch project list');
  return response.json();
};
