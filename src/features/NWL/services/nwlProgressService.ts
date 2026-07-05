/**
 * NWL Progress API Service
 * Handles progress tracking for NWL subsections
 */
import axios from 'axios';

export const nwlProgressService = {
  /**
   * Fetch progress for an NWL application
   */
  fetchProgress: async (applicationId: string) => {
    const response = await axios.get(`/backend/api/applications/${applicationId}/progress`);
    return response.data;
  },

  /**
   * Update progress for a subsection
   */
  updateProgress: async (
    applicationId: string,
    subsectionName: string,
    status: string
  ) => {
    const response = await axios.post(`/backend/api/applications/${applicationId}/progress`, { 
      subsection_name: subsectionName, 
      status,
      application_type: 'NWL'
    });
    return response.data;
  },

}