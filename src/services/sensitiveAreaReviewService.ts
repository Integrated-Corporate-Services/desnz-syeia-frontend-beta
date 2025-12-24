import axios from 'axios';
import { SensitiveAreaReview } from '../types/sensitiveAreaReviewTypes';

export async function getSensitiveAreaReview(applicationId: string): Promise<SensitiveAreaReview[]> {
  const res = await axios.get(`/backend/api/get-sensitivereview?application_id=${applicationId}`);
  return res.data;
}

export async function saveSensitiveAreaReview(review: SensitiveAreaReview): Promise<SensitiveAreaReview> {
  const res = await axios.post('/backend/api/save-sensitivereview', review);
  return res.data;
}
