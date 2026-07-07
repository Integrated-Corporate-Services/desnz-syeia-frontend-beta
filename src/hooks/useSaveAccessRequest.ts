import { useState } from "react";
import axios from "axios";

export interface SaveAccessRequestPayload {
  email: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  line1?: string;
  line2?: string;
  town?: string;
  county?: string;
  postCode?: string;
  isAgent?: boolean;
  organisationIds?: string[];
  agencyName?: string;
}

export interface SaveAccessRequestResponse {
  success: boolean;
  id: string;
  status: string;
  referenceNumber?: string;
  message: string;
  record: any;
  isNewRecord: boolean;
}

export const useSaveAccessRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAccessRequest = async (
    payload: SaveAccessRequestPayload
  ): Promise<SaveAccessRequestResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<SaveAccessRequestResponse>(
        "/backend/api/access-requests/save",
        payload
      );

      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Failed to save access request";
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    saveAccessRequest,
    isLoading,
    error,
  };
};
