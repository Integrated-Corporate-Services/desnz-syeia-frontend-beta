import { ACCESS_REQUEST_STATUS } from '../constants/accessRequestStatus';

export interface RequestAccessRequest {
  fullName: string;
  email: string;
  /*line1?: string;
  line2?: string;
  town?: string;
  country?: string;
  postCode?: string;*/
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
  status: typeof ACCESS_REQUEST_STATUS[keyof typeof ACCESS_REQUEST_STATUS];
  message?: string;
}
