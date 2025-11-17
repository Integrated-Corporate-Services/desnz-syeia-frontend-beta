// Save 'Consultation Not Required' status
export async function saveNotRequiredStatus(consultationId: string, consultationDetails: any): Promise<any> {
  // consultationDetails should include all details, uploadedFiles, applicationDocuments, and updated reason
  const response = await axios.post(`/backend/api/consultations/${consultationId}/savenotrequiredstatus`, { consultationDetails });
  return response.data;
}
import axios from 'axios';
import { ConsultationDetails } from '../types/ConsultationDetails';

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

export async function saveConsultationMessage(consultationId: string, message: string): Promise<any> {
  const response = await axios.post(`/backend/api/consultations/${consultationId}/save-message`, { message });
  return response.data;
}
