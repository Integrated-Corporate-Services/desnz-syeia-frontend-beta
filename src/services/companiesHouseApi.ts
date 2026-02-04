import { CompanySearchResponse, CompanyDetails } from "../types/companiesHouse";

/**
 * API service for communicating with the backend
 * All Companies House data is fetched through Node.js backend
 * No direct API calls to Companies House from the frontend
 */

// Updated to match the backend route change
const API_BASE_URL = "/backend/api/companies-house";

/**
 * Search for companies by name
 * @param {string} query - Company name to search for
 * @returns {Promise<CompanySearchResponse>} Search results
 */
export const searchCompanies = async (
  query: string,
): Promise<CompanySearchResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) {
      // Handle Rate Limiting specifically for user feedback
      if (response.status === 429) {
        throw new Error(
          "You have made too many requests. Please wait a moment and try again.",
        );
      }
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to search companies");
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};

/**
 * Get detailed information about a specific company
 * @param {string} companyNumber - Company registration number
 * @returns {Promise<CompanyDetails>} Company details
 */
export const getCompanyDetails = async (
  companyNumber: string,
): Promise<CompanyDetails> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${encodeURIComponent(companyNumber)}`,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Failed to fetch company details",
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
};
