/**
 * Assignment API Service
 * Client-side API calls for application assignment and reassignment
 * Created: 2026-06-09
 * ✅ PRODUCTION-READY with error handling
 */

import { generateCorrelationId } from "../utils/correlationId";
import { buildBackendUrl } from "../utils/apiConfig";

export interface AssignedEditor {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: string;
  since: string;
}

export interface ReassignmentRequest {
  newEditorId: string;
  reason?: string;
  version?: number;
}

export interface ReassignmentResult {
  success: boolean;
  applicationId: string;
  newEditorId: string;
}

export interface AssignmentHistoryEntry {
  id: string;
  prevEditor: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  } | null;
  newEditor: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  };
  changedBy: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  } | null;
  changedAt: string;
  reason: string | null;
  reassignmentType: string;
}

export interface OrgUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: string;
}

export const assignmentApiService = {
  /**
   * Get the currently assigned editor for an application
   */
  getAssignedEditor: async (
    applicationId: string,
    correlationId?: string
  ): Promise<{ assignedEditor: AssignedEditor | null }> => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      buildBackendUrl(`/backend/api/applications/${applicationId}/assigned-editor`),
      { credentials: "include", headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assigned editor: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Reassign an application to a new editor
   */
  reassignEditor: async (
    applicationId: string,
    request: ReassignmentRequest,
    correlationId?: string
  ): Promise<ReassignmentResult> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      buildBackendUrl(`/backend/api/applications/${applicationId}/assigned-editor`),
      {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(request),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.message || "Failed to reassign application");
      error.status = response.status;
      error.code = errorData.error;
      error.data = errorData;
      throw error;
    }
    
    return response.json();
  },

  /**
   * Get assignment history for an application
   */
  getAssignmentHistory: async (
    applicationId: string,
    limit: number = 50,
    offset: number = 0,
    correlationId?: string
  ): Promise<{ history: AssignmentHistoryEntry[]; pagination: { limit: number; offset: number } }> => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const response = await fetch(
      buildBackendUrl(
        `/backend/api/applications/${applicationId}/assignment-history?${params}`
      ),
      { credentials: "include", headers }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assignment history: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get all users in the current user's organisation
   */
  getOrgUsers: async (correlationId?: string): Promise<{ users: OrgUser[] }> => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(buildBackendUrl("/backend/api/applications/org/users"), {
      credentials: "include",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch organisation users: ${response.statusText}`);
    }
    
    return response.json();
  },
};
