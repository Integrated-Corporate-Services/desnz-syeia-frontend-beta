export const PARISH_VALIDATION = {
  MIN_REQUIRED: 1,
  MIN_SEARCH_LENGTH: 3,
  ERROR_MESSAGE: "Add at least one parish",
} as const;

export const PARISH_API_ENDPOINTS = {
  SEARCH: "/backend/api/parish/search",
  SAVE: (applicationId: string) =>
    `/backend/api/applications/${applicationId}/parishes`,
} as const;
