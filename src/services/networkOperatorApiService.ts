/// <reference types="vite/client" />

export const networkOperatorApiService = {
  // To fetch network operator by email
  getNetworkOperatorByEmail: async (emailId: string) => {
    const response = await fetch(`/api/network-operators/${emailId}`);
    if (!response.ok) throw new Error('Failed to fetch network operator details');
    return response.json();
  },
  
};