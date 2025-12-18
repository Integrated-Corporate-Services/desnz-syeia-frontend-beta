// Common type definitions used across services

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface FieldError {
  fieldId: string;
  message: string;
}

export interface FormData {
  fullName: string;
  email: string;
  organisation: string;
  applicantType: string;
  sendWelcomeEmail: boolean;
  accessReason: string;
  phone: string;
  location: string;
}
