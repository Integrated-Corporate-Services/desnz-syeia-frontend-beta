import { useApplicationStore } from "../store/useApplicationStore";
import { useParams, useLocation } from "react-router-dom";

/**
 * React hook to get the applicationId from store, params, or query string.
 * Usage: const applicationId = useGetApplicationId();
 */
export function useGetApplicationId(): string {
  const application = useApplicationStore((state) => state.application);
  const params = useParams();
  const location = useLocation();

  if (application && application.application_id) return application.application_id;
  if (params.applicationId) return params.applicationId as string;
  if (params.id) return params.id as string;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get("id") || searchParams.get("applicationId");
    if (idFromQuery) return idFromQuery;
  }
  return "";
}
