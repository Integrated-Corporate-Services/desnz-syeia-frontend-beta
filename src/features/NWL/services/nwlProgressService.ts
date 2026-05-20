/**
 * NWL Progress API Service
 * Handles progress tracking for NWL subsections
 */

export const nwlProgressService = {
  /**
   * Fetch progress for an NWL application
   */
  fetchProgress: async (applicationId: string) => {
    const response = await fetch(`/backend/api/applications/${applicationId}/progress`);
    if (!response.ok) {
      throw new Error('Failed to fetch application progress');
    }
    return response.json();
  },

  /**
   * Update progress for a subsection
   */
  updateProgress: async (
    applicationId: string,
    subsectionName: string,
    status: string
  ) => {
    const response = await fetch(`/backend/api/applications/${applicationId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        subsection_name: subsectionName, 
        status,
        application_type: 'NWL'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update application progress');
    }
    
    return response.json();
  },

}