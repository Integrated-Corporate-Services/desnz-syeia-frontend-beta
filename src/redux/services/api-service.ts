/// <reference types="vite/client" />
const API_URL = import.meta.env.API_URL;

export const apiService = {
  
  // To fetch network operator by person Id
  getNetworkOperatorByPerson: async (personId: string) => {
    const response = await fetch(`/api/network-operator-by-person/${personId}`);
    if (!response.ok) throw new Error('Failed to fetch network operator details');
    return response.json();
  },
  
};