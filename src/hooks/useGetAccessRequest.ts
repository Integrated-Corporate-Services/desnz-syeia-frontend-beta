import { useState, useEffect } from "react";import { createLogger } from '../utils/logger';

const logger = createLogger('useGetAccessRequest');import axios from "axios";

export interface AccessRequestData {
  access_request_id: string;
  email: string;
  first_name: string;
  last_name: string;
  title?: string;
  agency_name?: string;
  phone_number?: string;
  is_agent: boolean;
  line1?: string;
  line2?: string;
  town_city?: string;
  county?: string;
  postcode?: string;
  organisations?: Array<{
    organisation_id: string;
    organisation_name: string;
    status: string;
  }>;
}

export const useGetAccessRequest = (email: string | undefined) => {
  const [data, setData] = useState<AccessRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccessRequest = async () => {
      if (!email) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<AccessRequestData>(
          `/api/access-requests/by-email`,
          {
            params: { email },
          }
        );

        setData(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          // No existing request found - this is normal for new users
          setData(null);
        } else {
          const errorMessage = axios.isAxiosError(err) 
            ? err.response?.data?.error || "Failed to fetch access request"
            : "Failed to fetch access request";
          setError(errorMessage);
          logger.error("Error fetching access request:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessRequest();
  }, [email]);

  return { data, isLoading, error };
};
