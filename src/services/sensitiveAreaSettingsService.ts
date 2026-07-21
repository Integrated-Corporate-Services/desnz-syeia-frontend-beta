import axios from 'axios';

export async function getSensitiveAreaSettings(applicationId: string) {
  const res = await axios.get(`/api/sensitive-area-settings/${applicationId}`);
  return res.data;
}
