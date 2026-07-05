import { Parish } from "../types/Parish";
import { ParishSearchResponse } from "../types/ParishApi";
import { PARISH_API_ENDPOINTS } from "../constants/parishConstants";
import {
  mapParishApiToParish,
  mapParishesToCodes,
} from "../utils/parishMappers";
import { buildBackendUrl } from "../../../utils/apiConfig";
import { getCsrfHeaders } from "../../../utils/csrf";

export const parishApiService = {
  searchParishes: async (searchTerm: string): Promise<Parish[]> => {
    const response = await fetch(
      buildBackendUrl(`${PARISH_API_ENDPOINTS.SEARCH}?q=${searchTerm}`),
      {
        credentials: "include"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search parishes");
    }

    const data: ParishSearchResponse = await response.json();
    return (data.data || []).map(mapParishApiToParish);
  },

  saveParishes: async (
    applicationId: string,
    parishes: Parish[]
  ): Promise<void> => {
    const parishCodes = mapParishesToCodes(parishes);

    const response = await fetch(buildBackendUrl(PARISH_API_ENDPOINTS.SAVE(applicationId)), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ parish_codes: parishCodes }),
    });

    if (!response.ok) {
      throw new Error("Failed to save parishes");
    }

    return response.json();
  },
};
