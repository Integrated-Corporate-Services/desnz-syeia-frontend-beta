/// <reference types="vite/client" />
const API_URL = import.meta.env.API_URL;

export const apiService = {
  // To fetch network operator by email
  getNetworkOperatorByEmail: async (emailId: string) => {
    const response = await fetch(`/api/network-operator-by-email/${emailId}`);
    if (!response.ok) throw new Error('Failed to fetch network operator details');
    return response.json();
  },
  // Fetch applications for a user
  fetchApplicationsByUser: async (created_by: string) => {
    const response = await fetch(`/api/applications?created_by=${created_by}`);
    return response.json();
  },
  // Create a new application
  createApplication: async (applicationData: any) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    });
    return response.json();
  },
  getApplicationById: async (id: string) => {
    const response = await fetch(`/api/applications/${id}`);
    return response.json();
  },
  saveNetworkOperator: async (data: any) => {
    const response = await fetch('/api/applications/save-network-operator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};