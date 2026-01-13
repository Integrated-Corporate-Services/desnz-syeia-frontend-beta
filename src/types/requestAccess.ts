import { ACCESS_REQUEST_STATUS } from "../constants/accessRequestStatus";

export interface RequestAccessRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  workAddressLine1: string;
  workAddressLine2?: string;
  workTown: string;
  workCounty?: string;
  workPostcode: string;
  company: string;
  organisations: string[];
  applyingOnBehalf: boolean;
}

export interface RequestAccessResponse {
  success: boolean;
  referenceNumber?: string;
  message: string;
  alreadyExists?: boolean;
  existingRequests?: Array<{
    organisationName: string;
    status: string;
    createdAt: string;
  }>;
}

export interface VerifyEmailRequest {
  code: string;
  email: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export interface RequestAccessStatusResponse {
  status: (typeof ACCESS_REQUEST_STATUS)[keyof typeof ACCESS_REQUEST_STATUS];
  message?: string;
}
