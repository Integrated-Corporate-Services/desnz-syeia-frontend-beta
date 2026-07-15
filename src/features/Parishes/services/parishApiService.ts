import { Parish } from "../types/Parish";
import { ParishSearchResponse } from "../types/ParishApi";
import { PARISH_API_ENDPOINTS } from "../constants/parishConstants";
import {
  mapParishApiToParish,
  mapParishesToCodes,
} from "../utils/parishMappers";
import axios from "axios";

export const parishApiService = {
  searchParishes: async (searchTerm: string): Promise<Parish[]> => {
    const response = await axios.get<ParishSearchResponse>(
      `${PARISH_API_ENDPOINTS.SEARCH}?q=${searchTerm}`
    );
    return (response.data.data || []).map(mapParishApiToParish);
  },

  saveParishes: async (
    applicationId: string,
    parishes: Parish[]
  ): Promise<void> => {
    const parishCodes = mapParishesToCodes(parishes);
    await axios.post(PARISH_API_ENDPOINTS.SAVE(applicationId), { 
      parish_codes: parishCodes 
    });
  },
};
