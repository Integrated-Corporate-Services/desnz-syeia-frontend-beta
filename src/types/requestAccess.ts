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
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
}
