import log from "../logger";
import { buildBackendUrl } from "../utils/apiConfig";

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
  private get baseUrl(): string {
    return buildBackendUrl("/api/lpa");
  }

  /**
   * Fetch all active LPAs
   */
  async getAllLpas(): Promise<Lpa[]> {
    try {
      const url = this.baseUrl;
      log.debug("Fetching all LPAs from:", url);
      log.debug("VITE_API_URL env var:", import.meta.env.VITE_API_URL);
      const response = await fetch(url, {
        credentials: "include"
      });
      log.debug("Response status:", response.status, "Content-Type:", response.headers.get('content-type'));
      if (!response.ok) {
        const text = await response.text();
        log.error("Bad response:", response.status, text.substring(0, 200));
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        log.error("Expected JSON but got:", contentType, "Body:", text.substring(0, 500));
        throw new Error("Server returned HTML instead of JSON. Check backend URL configuration.");
      }
      const data: LpaApiResponse = await response.json();
      log.debug("Fetched LPAs:", data?.data?.length || 0);
      return data?.data || [];
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
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q);
      if (params.type) queryParams.append('type', params.type);
      if (params.activeOnly !== undefined) queryParams.append('activeOnly', String(params.activeOnly));
      const url = `${this.baseUrl}/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        credentials: "include"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: LpaApiResponse = await response.json();
      return data?.data || [];
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
      const response = await fetch(`${this.baseUrl}/${code}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { data: Lpa; success: boolean } = await response.json();
      return data?.data || null;
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
      const response = await fetch(`${this.baseUrl}/${code}/validation`, {
        credentials: "include"
      });
      if (!response.ok) return false;
      const data: { valid: boolean } = await response.json();
      return data?.valid || false;
    } catch (error) {
      log.error(`Failed to validate LPA code ${code}:`, error);
      return false;
    }
  }
}

export const lpaService = new LpaService();
