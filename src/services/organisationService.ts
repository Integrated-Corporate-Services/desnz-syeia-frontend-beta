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
  validationErrors?: Record<string, string>;
}

export interface OrganisationAddressPayload {
  line1: string;
  line2: string;
  townCity: string;
  county: string;
  postcode: string;
}

class OrganisationService {
  /**
   * Get all organisations (basic info for dropdowns)
   */
  async getOrganisations(): Promise<ServiceResponse<Organisation[]>> {
    try {
      const response = await axios.get("/api/organisations");
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
      const response = await axios.get("/api/admin/organisations");
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
      const response = await axios.get(
        `/api/admin/organisations/${id}`
      );
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

  async updateOrganisationName(
    id: string,
    organisationName: string
  ): Promise<ServiceResponse<Organisation>> {
    try {
      const response = await axios.put(`/api/admin/organisations/${id}/name`, {
        organisationName,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error('Failed to update organisation name:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update organisation name',
        validationErrors: error.response?.data?.validationErrors,
      };
    }
  }

  async updateOrganisationAddress(
    id: string,
    address: OrganisationAddressPayload
  ): Promise<ServiceResponse<Organisation>> {
    try {
      const response = await axios.put(`/api/admin/organisations/${id}/address`, address);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update organisation address',
        validationErrors: error.response?.data?.validationErrors,
      };
    }
  }

  /**
   * Get public organisations (no authentication required, excludes DESNZ)
   */
  async getPublicOrganisations(): Promise<ServiceResponse<Organisation[]>> {
    try {
      const response = await axios.get("/api/public/organisations");
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
