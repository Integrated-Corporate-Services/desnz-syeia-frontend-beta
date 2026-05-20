import axios from 'axios';
import { ConsultationDetails } from '../types/ConsultationDetails';

// Save 'Consultation Not Required' status
export async function saveNotRequiredStatus(consultationId: string, consultationDetails: any): Promise<any> {
    // consultationDetails should include all details, uploadedFiles, applicationDocuments, and updated reason
    const response = await axios.post(`/backend/api/consultations/${consultationId}/savenotrequiredstatus`, { consultationDetails });
    return response.data;
}

// Fetch 'Consultation Not Required' status
export async function getNotRequiredStatus(consultationId: string, applicationId: string): Promise<any> {
    const response = await axios.get(`/backend/api/consultations/${consultationId}/${applicationId}/getnotrequiredstatus`);
    return response.data;
}

export async function fetchConsultationDetails(applicationId: string, userId: string): Promise<ConsultationDetails> {
    const response = await axios.get('/backend/api/consultations/getConsultationById', {
        params: { applicationId, userId },
    });
    return response.data;
}

export async function getConsultationDetailsById(consultationId: string): Promise<ConsultationDetails> {
    const response = await axios.get(`/backend/api/consultations/${consultationId}/details`);
    return response.data;
}

export async function saveConsultationMessage(consultationId: string, message: string, consulteeEmailAddress: string): Promise<any> {
    const response = await axios.post(`/backend/api/consultations/${consultationId}/save-message`, { message, consulteeEmailAddress });
    return response.data;
}

export async function withdrawConsultationRequest({ applicationId, consultationId, updatedBy }: { applicationId: string; consultationId: string; updatedBy: string }): Promise<any> {
    const url = `/backend/api/consultations/${applicationId}/${consultationId}/withdraw-consultation`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, consultationId, updatedBy }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to withdraw consultation');
    }
    return response.json();
}

// Update all consultations for an application with lastUpdatedBy user id
export async function updateAllConsultations(applicationId: string, userId: string): Promise<any> {
    const url = `/backend/api/consultations/${applicationId}/update-all-consultations`;
    const payload = { userId };

    try {
        const response = await axios.post(url, payload, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
        throw new Error(`Failed to update all consultations for applicationId=${applicationId}, userId=${userId}: ${originalMessage}`);
    }
}

// Create LPA consultations for selected LPAs
export async function createLpaConsultations(applicationId: string, lpas: Array<{ lpa_code: string; lpa_name: string }>, userId: string, consultationType?: string): Promise<any> {
    const url = `/backend/api/applications/${applicationId}/consultations`;
    const payload = { lpas, userId, consultationType };

    try {
        const response = await axios.post(url, payload, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
        throw new Error(`Failed to create LPA consultations for applicationId=${applicationId}: ${originalMessage}`);
    }
}

/**
 * Mark consultation as request sent with current date
 */
export async function markConsultationAsRequestSent(
  consultationId: string
): Promise<{ success: boolean; data?: any }> {
  const url = `/backend/api/consultations/${consultationId}/mark-request-sent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to mark consultation as request sent');
  }
  
  return await res.json();
}

/**
 * Fetch all consultee organisations with consultation_type = 'OTHER'
 * @param applicationId - The application ID
 * @returns {Promise<Array>} Array of other consultee organisations
 */
export async function getOtherConsulteeOrganisations(applicationId: string): Promise<any> {
  const url = `/backend/api/consultations/${applicationId}/other-consultees`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    throw new Error(`Failed to fetch OTHER consultee organisations: ${originalMessage}`);
  }
}

/**
 * Create OTHER consultations for selected consultees
 * @param applicationId - The application ID
 * @param consultees - Array of consultee objects with either consulteeOrganisationId or otherConsulteeName
 * @param userId - The user ID
 * @returns {Promise<any>}
 */
export async function createOtherConsultations(
  applicationId: string,
  consultees: Array<{ consulteeOrganisationId?: string; otherConsulteeName?: string }>,
  userId: string
): Promise<any> {
  const url = `/backend/api/applications/${applicationId}/other-consultations`;
  const payload = { consultees, userId };

  try {
    const response = await axios.post(url, payload, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    throw new Error(`Failed to create OTHER consultations for applicationId=${applicationId}: ${originalMessage}`);
  }
}

/**
 * Create PUBLIC consultation for lines of 132kV or more
 * @param applicationId - The application ID
 * @param userId - The user ID
 * @returns {Promise<any>}
 */
export async function createPublicConsultation(
  applicationId: string,
  userId: string
): Promise<any> {
  const url = `/backend/api/applications/${applicationId}/public-consultation`;
  const payload = { userId };

  try {
    const response = await axios.post(url, payload, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    throw new Error(`Failed to create PUBLIC consultation for applicationId=${applicationId}: ${originalMessage}`);
  }
}

/**
 * Remove a consultation by setting its status to INACTIVE
 * @param consultationId - The consultation ID
 * @returns {Promise<any>}
 */
export async function removeConsultation(consultationId: string): Promise<any> {
  const url = `/backend/api/consultations/${consultationId}/remove`;
  const payload = { userId: localStorage.getItem('user_id') };

  try {
    const response = await axios.post(url, payload, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    throw new Error(`Failed to remove consultation ${consultationId}: ${originalMessage}`);
  }
}

/**
 * Manage PUBLIC consultation based on voltage - create if high voltage, mark as inactive if not
 * @param applicationId - The application ID
 * @param userId - The user ID
 * @param hasHighVoltage - Whether the application has high voltage (>=132kV)
 * @returns {Promise<any>}
 */
export async function managePublicConsultationByVoltage(
  applicationId: string,
  userId: string,
  hasHighVoltage: boolean
): Promise<any> {
  const url = `/backend/api/applications/${applicationId}/public-consultation/manage`;
  const payload = { userId, hasHighVoltage };

  try {
    const response = await axios.post(url, payload, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    const originalMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    throw new Error(`Failed to manage PUBLIC consultation for applicationId=${applicationId}: ${originalMessage}`);
  }
}
