import axios from "axios";
import log from "../logger";

export interface Lpa {
  lpa_code: string;
  lpa_name: string;
  organisation_type: string | null;
  country: string;
  active_flag: boolean;
  effective_from: string | null;
  effective_to: string | null;
  last_refreshed_at?: string;
}

interface LpaApiResponse {
  data: Lpa[];
  success: boolean;
}

interface LpaSearchParams {
  q?: string;
  type?: string;
  activeOnly?: boolean;
}

class LpaService {
  private readonly baseUrl = "/backend/api/lpa";

  /**
   * Fetch all active LPAs
   */
  async getAllLpas(): Promise<Lpa[]> {
    try {
      const response = await axios.get<LpaApiResponse>(this.baseUrl);
      log.debug("Fetched LPAs:", response.data?.data?.length || 0);
      return response.data?.data || [];
    } catch (error) {
      log.error("Failed to fetch LPAs:", error);
      throw new Error("Failed to load local planning authorities");
    }
  }

  /**
   * Search LPAs by name
   */
  async searchLpas(params: LpaSearchParams): Promise<Lpa[]> {
    try {
      const response = await axios.get<LpaApiResponse>(
        `${this.baseUrl}/search`,
        {
          params,
        }
      );
      return response.data?.data || [];
    } catch (error) {
      log.error("Failed to search LPAs:", error);
      throw new Error("Failed to search local planning authorities");
    }
  }

  /**
   * Get LPA by code
   */
  async getLpaByCode(code: string): Promise<Lpa | null> {
    try {
      const response = await axios.get<{ data: Lpa; success: boolean }>(
        `${this.baseUrl}/${code}`
      );
      return response.data?.data || null;
    } catch (error) {
      log.error(`Failed to fetch LPA with code ${code}:`, error);
      throw new Error("Failed to load local planning authority");
    }
  }

  /**
   * Validate LPA code
   */
  async validateLpaCode(code: string): Promise<boolean> {
    try {
      const response = await axios.get<{ valid: boolean }>(
        `${this.baseUrl}/${code}/validation`
      );
      return response.data?.valid || false;
    } catch (error) {
      log.error(`Failed to validate LPA code ${code}:`, error);
      return false;
    }
  }
}

export const lpaService = new LpaService();
