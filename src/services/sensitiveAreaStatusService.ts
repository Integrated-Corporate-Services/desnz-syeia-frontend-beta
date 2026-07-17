import axios from 'axios';

export async function getSensitiveAreaCheckStatus(applicationId: string) {
  // Adjust endpoint as needed for your backend
  const res = await axios.get(`/api/sensitive-areas/${applicationId}`);
  return res.data;
}
