/// <reference types="vite/client" />
import { buildBackendUrl } from '../utils/apiConfig';
import { getCsrfHeaders } from '../utils/csrf';

export const progressApiService = {

  // Fetch progress for an application
  fetchApplicationProgress: async (applicationId: string) => {
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/progress`), {
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.error || 'Failed to fetch application progress') as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  // Update progress for a subsection
  updateApplicationProgress: async (
    applicationId: string,
    subsection_name: string,
    status: string,
    application_type?: string
  ) => {
  const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/progress`), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getCsrfHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ subsection_name, status, application_type }),
    });
    if (!response.ok) throw new Error('Failed to update application progress');
    return response.json();
  },
};