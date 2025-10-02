/// <reference types="vite/client" />

export const progressApiService = {

  // Fetch progress for an application
  fetchApplicationProgress: async (applicationId: string) => {
    const response = await fetch(`/api/applications/${applicationId}/progress`);
    if (!response.ok) throw new Error('Failed to fetch application progress');
    return response.json();
  },

  // Update progress for a subsection
  updateApplicationProgress: async (
    applicationId: string,
    section_name: string,
    subsection_name: string,
    is_completed: boolean
  ) => {
    const response = await fetch(`/api/applications/${applicationId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name, subsection_name, is_completed }),
    });
    if (!response.ok) throw new Error('Failed to update application progress');
    return response.json();
  },
};