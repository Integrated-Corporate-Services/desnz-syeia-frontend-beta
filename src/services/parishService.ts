/// <reference types="vite/client" />

import { generateCorrelationId } from "../utils/correlationId";
import { Lpa } from "../components/LpaSelector";

export const parishService = {
  /**
   * Fetch LPAs derived from application parishes
   * Uses the ONS Parish->LAD->LPA mapping to determine which LPAs
   * are relevant based on the parishes selected in the application
   */
  fetchDerivedLpas: async (
    applicationId: string,
    correlationId?: string
  ): Promise<Lpa[]> => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/parishes/lpas`,
      {
        credentials: "include",
        headers,
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch derived LPAs");
    }
    const data = await response.json();
    return data.lpas || [];
  },

  /**
   * Save selected parishes for an application
   */
  saveParishes: async (
    applicationId: string,
    parishCodes: string[],
    correlationId?: string
  ): Promise<any> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/parishes`,
      {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ parish_codes: parishCodes }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to save parishes");
    }
    return response.json();
  },

  /**
   * Fetch parishes for an application
   */
  fetchParishes: async (
    applicationId: string,
    correlationId?: string
  ): Promise<any> => {
    const headers: HeadersInit = {
      "X-Correlation-ID": correlationId || generateCorrelationId(),
    };
    const response = await fetch(
      `/backend/api/applications/${applicationId}/parishes`,
      {
        credentials: "include",
        headers,
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch parishes");
    }
    return response.json();
  },
};
