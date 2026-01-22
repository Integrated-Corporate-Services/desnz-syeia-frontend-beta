/// <reference types="vite/client" />

import { generateCorrelationId } from "../utils/correlationId";

export const applicationApiService = {
  // Fetch applications for a user
  fetchApplicationsByUser: async (
    created_by: string,
    correlationId?: string
  ) => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications?created_by=${created_by}`,
      { credentials: "include", headers }
    );
    return response.json();
  },

  // Create a new application
  createApplication: async (applicationData: any, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch("/backend/api/applications", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(applicationData),
    });
    return response.json();
  },

  getApplicationById: async (id: string, correlationId?: string) => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(`/backend/api/applications/${id}`, {
      credentials: "include",
      headers,
    });
    return response.json();
  },

  saveNetworkOperator: async (data: any, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      "/backend/api/applications/network-operators",
      {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  submitApplication: async (applicationId: string, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const res = await fetch(
      `/backend/api/applications/${applicationId}/submit`,
      {
        method: "POST",
        headers,
        credentials: "include",
      }
    );
    if (!res.ok) {
      throw new Error("Failed to submit application");
    }
    return res.json();
  },

  updateApplicantInfo: async (
    applicationId: string,
    operatorRef: string,
    type: string,
    additionalContacts: string
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/applicant-info`,
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          operator_ref: operatorRef,
          type,
          additional_contacts: additionalContacts,
        }),
      }
    );
    return response.json();
  },

  updateOrganisation: async (
    applicationId: string,
    organisationId: string,
    organisationName: string,
    line1?: string
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/organisation`,
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          organisation_id: organisationId,
          organisation_name: organisationName,
          line1,
        }),
      }
    );
    return response.json();
  },

  confirmContactDetails: async (
    applicationId: string,
    isConfirmed: boolean
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/contact-confirmation`,
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          contact_isconfirmed: isConfirmed,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to confirm contact details");
    }

    return response.json();
  },

  confirmDeclaration: async (applicationId: string, isConfirmed: boolean) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/declaration`,
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          declaration_confirmed: isConfirmed,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update declaration");
    }

    return response.json();
  },

  deleteApplication: async (applicationId: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
    };
    const response = await fetch(`/backend/api/applications/${applicationId}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to delete application");
    }
    return response;
  },
};
