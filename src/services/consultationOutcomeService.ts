import axios from "axios";
import {
  ConsultationOutcomeData,
  ConsultationOutcomeResponse,
  ConsultationOutcomeStatusResponse,
} from "../types/ConsultationOutcome";

/**
 * Save or update consultation outcome for an application
 * @param applicationId - The application ID
 * @param data - The consultation outcome data
 * @returns The saved consultation outcome
 */
export async function saveConsultationOutcome(
  applicationId: string,
  data: ConsultationOutcomeData
): Promise<{ success: boolean; data: ConsultationOutcomeResponse }> {
  const response = await axios.post(
    `/backend/api/applications/${applicationId}/consultation-outcome`,
    data
  );
  return response.data;
}

/**
 * Get consultation outcome for an application
 * @param applicationId - The application ID
 * @returns The consultation outcome or null if not found
 */
export async function getConsultationOutcome(
  applicationId: string
): Promise<ConsultationOutcomeResponse | null> {
  try {
    const response = await axios.get(
      `/backend/api/applications/${applicationId}/consultation-outcome`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Check if consultation outcome is complete for an application
 * @param applicationId - The application ID
 * @returns Status indicating if the outcome is complete
 */
export async function getConsultationOutcomeStatus(
  applicationId: string
): Promise<ConsultationOutcomeStatusResponse> {
  const response = await axios.get(
    `/backend/api/applications/${applicationId}/consultation-outcome/status`
  );
  return response.data;
}
