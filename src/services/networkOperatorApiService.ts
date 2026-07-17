/// <reference types="vite/client" />

import { buildBackendUrl } from '../utils/apiConfig';

/**
 * Network Operator API Service
 * Handles all API calls related to network operators/organizations
 */
export const networkOperatorApiService = {
  /**
   * Get network operators/organizations for the authenticated user
   * - Employees: Returns their single organization
   * - Agents: Returns all approved organizations
   * @returns {Promise<Array>} Array of organization objects with contact details
   * @throws {Error} If API call fails or user is not authenticated
   */
  getNetworkOperators: async () => {
    const response = await fetch(buildBackendUrl("/api/network-operators"), {
      method: "GET",
      credentials: "include", // Include session cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch organizations" }));
      throw new Error(
        error.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * @deprecated Use getNetworkOperators instead
   * Legacy method - Get network operator by email domain
   * @param {string} emailId - Email address to search by domain
   */
  getNetworkOperatorByEmail: async (emailId: string) => {
    const response = await fetch(buildBackendUrl(`/api/network-operators/${emailId}`), {
      credentials: 'include'
    });
    if (!response.ok)
      throw new Error("Failed to fetch network operator details");
    return response.json();
  },
};
