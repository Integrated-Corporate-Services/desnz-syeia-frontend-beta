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
    params: { applicationId, userId }
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

export async function withdrawConsultationRequest({ applicationId, consultationId, updatedBy }: { applicationId: string, consultationId: string, updatedBy: string }): Promise<any> {
  const url = `/backend/api/consultations/${applicationId}/${consultationId}/withdraw-consultation`;
  const response = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationId, consultationId, updatedBy }),
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to withdraw consultation");
  }
  return response.json();
}