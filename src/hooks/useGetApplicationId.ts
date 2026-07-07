import { useParams, useLocation } from "react-router-dom";

/**
 * React hook to get the applicationId from params or query string.
 * Usage: const applicationId = useGetApplicationId();
 */
export function useGetApplicationId(): string {
  const params = useParams();
  const location = useLocation();

  if (params.applicationId) return params.applicationId as string;
  if (params.id) return params.id as string;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("id") || searchParams.get("applicationId");
    if (idFromQuery) return idFromQuery;
  }
  return "";
}
