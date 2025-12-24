/// <reference types="vite/client" />

export const applicationApiService = {

  // Fetch applications for a user
  fetchApplicationsByUser: async (created_by: string) => {
    const response = await fetch(`/backend/api/applications?created_by=${created_by}`);
    return response.json();
  },
  // Create a new application
  createApplication: async (applicationData: any) => {
    const response = await fetch('/backend/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    });
    return response.json();
  },
  getApplicationById: async (id: string) => {
    const response = await fetch(`/backend/api/applications/${id}`);
    return response.json();
  },
  saveNetworkOperator: async (data: any) => {
    const response = await fetch('/backend/api/applications/network-operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  submitApplication: async (applicationId: string) => {
    const res = await fetch(`/backend/api/applications/${applicationId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Failed to submit application');
    }
    return res.json();
  },

  updateApplicantInfo: async (applicationId: string, operatorRef: string, type: string, additionalContacts: string) => {
    const response = await fetch(`/backend/api/applications/${applicationId}/applicant-info`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator_ref: operatorRef, type, additional_contacts: additionalContacts }),
    });
    return response.json();
  },

  deleteApplication: async (applicationId: string) => {
    const response = await fetch(`/backend/api/applications/${applicationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to delete application');
    }
    return response;
  },

};