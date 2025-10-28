import axios from 'axios';
import { ConsultationDetails } from '../types/ConsultationDetails';

export async function fetchConsultationDetails(applicationId: string, userId: string): Promise<ConsultationDetails> {
  const response = await axios.get('/backend/api/consultations/getConsultationById', {
    params: { applicationId, userId }
  });
  return response.data;
}
