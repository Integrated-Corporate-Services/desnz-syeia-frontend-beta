import axios from "axios";
import { createLogger } from "../utils/logger";
import { Organisation } from "../types/organisation";

const logger = createLogger("organisationService");

// Re-export for backward compatibility
export type { Organisation };

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class OrganisationService {
  /**
   * Get all organisations (basic info for dropdowns)
   */
  async getOrganisations(): Promise<ServiceResponse<Organisation[]>> {
    try {
      logger.debug("Fetching organisations");
      const response = await axios.get("/api/organisations");
      logger.debug("Organisations fetched successfully", {
        count: response.data.length,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error("Failed to fetch organisations:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch organisations",
      };
    }
  }

  /**
   * Get all organisations with detailed data (for admin dashboard)
   */
  async getOrganisationsDetailed(): Promise<ServiceResponse<Organisation[]>> {
    try {
      logger.debug("Fetching detailed organisations");
      const response = await axios.get("/api/admin/organisations");
      logger.debug("Detailed organisations fetched successfully", {
        count: response.data.length,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error("Failed to fetch detailed organisations:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        message:
          error.response?.data?.error ||
          "Failed to fetch detailed organisations",
      };
    }
  }

  /**
   * Get organisation by ID
   */
  async getOrganisationById(
    id: string
  ): Promise<ServiceResponse<Organisation>> {
    try {
      logger.debug("Fetching organisation by ID", { id });
      const response = await axios.get(
        `/api/admin/organisations/${id}`
      );
      logger.debug("Organisation fetched successfully");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error("Failed to fetch organisation:", {
        error: error.message,
        response: error.response?.data,
      });
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch organisation",
      };
    }
  }

  /**
   * Get public organisations (no authentication required, excludes DESNZ)
   */
  async getPublicOrganisations(): Promise<ServiceResponse<Organisation[]>> {
    try {
      logger.debug("Fetching public organisations");
      const response = await axios.get("/api/public/organisations");
      logger.debug("Public organisations fetched successfully", {
        count: response.data.length,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error("Failed to fetch public organisations:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to fetch public organisations",
      };
    }
  }
}

export default new OrganisationService();
