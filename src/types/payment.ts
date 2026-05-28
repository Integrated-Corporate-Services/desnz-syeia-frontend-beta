/**
 * Payment-related TypeScript interfaces and types
 * Type definitions for payment flow data structures
 * 
 * @module types/payment
 */

/**
 * Bank account details structure
 */
export interface BankDetails {
  accountName: string;
  sortCode: string;
  accountNumber: string;
}

/**
 * Base payment state passed between pages
 */
export interface BankTransferState {
  invoiceNumber: string;
  totalAmount: number;
  consentFee?: number;
  eiaScreeningFee?: number;
}

/**
 * State for bank transfer confirmation page
 */
export interface BankTransferConfirmationState extends BankTransferState {
  transactionNumber?: string;
}

/**
 * State for bank transfer success page
 */
export interface BankTransferSuccessState extends BankTransferState {
  desnz_ref: string;
  transactionNumber?: string;
  referenceNumber?: string | number;
  paymentId?: string | null;
}

/**
 * Payment submission request data
 */
export interface BankTransferSubmissionRequest {
  applicationId: string;
  invoiceNumber: string;
  transactionNumber: string;
  amount: number;
  userId?: string;
}

/**
 * Payment submission response data
 */
export interface BankTransferSubmissionResponse {
  success: boolean;
  message: string;
  desnz_ref: string;
  desnzReference?: string;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Payment method options
 */
export type PaymentMethodType = 'card' | 'bank_transfer' | 'bacs';

/**
 * Payment status types
 */
export type PaymentStatusType = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Form error state
 */
export interface PaymentFormError {
  field?: string;
  message: string;
}

/**
 * Payment loading state
 */
export interface PaymentLoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Bank transfer form data
 */
export interface BankTransferFormData {
  transactionNumber: string;
  isConfirmed: boolean;
}

/**
 * Payment method form data
 */
export interface PaymentMethodFormData {
  isCardConfirmed: boolean;
}
