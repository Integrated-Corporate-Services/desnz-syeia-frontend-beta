import axios from 'axios';

// Service to fetch asset details from the backend
export const fetchAssetDetails = async (applicationId: string) => {
  try {
    console.log('Fetching asset details for applicationId:', applicationId);
    const response = await axios.get(`/api/applications/${applicationId}/assets`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};
