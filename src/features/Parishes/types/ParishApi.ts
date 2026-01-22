interface ParishApiResponse {
  parish_code: string;
  parish_name: string;
  country?: string;
}

interface ParishSearchResponse {
  query: string;
  count: number;
  data: ParishApiResponse[];
}

export type { ParishApiResponse, ParishSearchResponse };
