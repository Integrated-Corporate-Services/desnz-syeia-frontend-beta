import { Parish } from "../types/Parish";
import { ParishApiResponse } from "../types/ParishApi";

export const mapParishApiToParish = (apiParish: ParishApiResponse): Parish => ({
  id: apiParish.parish_code,
  name: apiParish.parish_name,
  county: apiParish.country,
});

export const mapParishesToCodes = (parishes: Parish[]): string[] =>
  parishes.map((p) => p.id);
