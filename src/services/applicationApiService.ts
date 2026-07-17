import { generateCorrelationId } from "../utils/correlationId";
import { buildBackendUrl } from "../utils/apiConfig";
import { fetchCsrfToken, getCsrfHeaders } from "../utils/csrf";
import { createLogger } from "../utils/logger";

const logger = createLogger('application-api');

export const applicationApiService = {
  // Fetch applications for a user
  fetchApplicationsByUser: async (
    created_by: string,
    correlationId?: string,
  ) => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      buildBackendUrl(`/api/applications?created_by=${created_by}`),
      { credentials: "include", headers },
    );
    return response.json();
  },

  // Create a new application
  createApplication: async (applicationData: any, correlationId?: string) => {
    await fetchCsrfToken();
    
    const csrfHeaders = getCsrfHeaders();
    logger.debug('Creating application', { hasToken: !!csrfHeaders['X-CSRF-Token'] });
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
      ...csrfHeaders,
    };
    
    const response = await fetch(buildBackendUrl("/api/applications"), {
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
    const response = await fetch(buildBackendUrl(`/api/applications/${id}`), {
      credentials: "include",
      headers,
    });
    return response.json();
  },

  saveNetworkOperator: async (data: any, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const response = await fetch(
      buildBackendUrl("/api/applications/network-operators"),
      {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(data),
      },
    );
    return response.json();
  },

  submitApplication: async (applicationId: string, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const res = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/submit`),
      {
        method: "POST",
        headers,
        credentials: "include",
      },
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
    additionalContacts: string,
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const response = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/applicant-info`),
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          desnz_ref: operatorRef,
          type,
          additional_contacts: additionalContacts,
        }),
      },
    );
    return response.json();
  },

  updateOrganisation: async (
    applicationId: string,
    organisationId: string,
    organisationName: string,
    line1?: string,
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const response = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/organisation`),
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          organisation_id: organisationId,
          organisation_name: organisationName,
          line1,
        }),
      },
    );
    return response.json();
  },

  confirmContactDetails: async (
    applicationId: string,
    isConfirmed: boolean,
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const response = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/contact-confirmation`),
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          contact_isconfirmed: isConfirmed,
        }),
      },
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
      ...getCsrfHeaders(),
    };
    const response = await fetch(
      buildBackendUrl(`/api/applications/${applicationId}/declaration`),
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          declaration_confirmed: isConfirmed,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update declaration");
    }

    return response.json();
  },

  // Get deletion preview for an application
  getApplicationDeletionPreview: async (applicationId: string, correlationId?: string) => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/deletion-preview`), {
      credentials: "include",
      headers,
    });
    if (!response.ok) {
      throw new Error("Failed to get deletion preview");
    }
    return response.json();
  },

  deleteApplication: async (applicationId: string, correlationId?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
      ...getCsrfHeaders(),
    };
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}`), {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete application" }));
      throw new Error(errorData.error || "Failed to delete application");
    }
    return response.json(); // Return the detailed deletion result
  },

/**
 * Fetch application details including DESNZ reference
 */
fetchApplicationDetails: async (applicationId: string, correlationId?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId || generateCorrelationId(),
  };
  
  const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}`), {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application details: ${response.statusText}`);
  }

  return response.json();
},

/**
 * Fetch application review data including all sections for review page
 */
getApplicationReview: async (applicationId: string, correlationId?: string) => {
  const headers: HeadersInit = {
    "X-Correlation-ID": correlationId || generateCorrelationId(),
  };

  const response = await fetch(
    buildBackendUrl(`/api/applications/${applicationId}/review`),
    {
      credentials: "include",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch application review: ${response.statusText}`,
    );
  }

  return response.json();
},

/**
 * Submit a withdrawal request for an application
 */
withdrawApplication: async (
  applicationId: string,
  voluntaryAgreement: boolean,
  withdrawalReason?: string,
  correlationId?: string
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId || generateCorrelationId(),
  };

  const response = await fetch(
    buildBackendUrl(`/api/applications/${applicationId}/withdraw`),
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        voluntary_agreement: voluntaryAgreement,
        withdrawal_reason: withdrawalReason || null,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to submit withdrawal request" }));
    throw new Error(errorData.error || errorData.message || "Failed to submit withdrawal request");
  }

  return response.json();
},

/**
 * Get withdrawal request details for an application
 */
getWithdrawalRequest: async (applicationId: string, correlationId?: string) => {
  const headers: HeadersInit = {
    "X-Correlation-ID": correlationId || generateCorrelationId(),
  };

  const response = await fetch(
    buildBackendUrl(`/api/applications/${applicationId}/withdrawal-request`),
    {
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No withdrawal request found
    }
    const errorData = await response.json().catch(() => ({ error: "Failed to fetch withdrawal request" }));
    throw new Error(errorData.error || errorData.message || "Failed to fetch withdrawal request");
  }

  return response.json();
},

};