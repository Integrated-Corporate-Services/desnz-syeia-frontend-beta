/// <reference types="vite/client" />
const API_URL = import.meta.env.API_URL;

export const apiService = {
  // To fetch network operator by email
  getNetworkOperatorByEmail: async (emailId: string) => {
    const response = await fetch(`/api/network-operators/${emailId}`);
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
    const response = await fetch('/api/applications/network-operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Fetch progress for an application
  fetchApplicationProgress: async (applicationId: string) => {
    const response = await fetch(`/api/applications/${applicationId}/progress`);
    if (!response.ok) throw new Error('Failed to fetch application progress');
    return response.json();
  },

  // Update progress for a subsection
  updateApplicationProgress: async (
    applicationId: string,
    section_name: string,
    subsection_name: string,
    is_completed: boolean
  ) => {
    const response = await fetch(`/api/applications/${applicationId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name, subsection_name, is_completed }),
    });
    if (!response.ok) throw new Error('Failed to update application progress');
    return response.json();
  },
};