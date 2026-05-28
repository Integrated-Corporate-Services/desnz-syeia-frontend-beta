/**
 * Payment-related constants for frontend
 * Centralized configuration for bank transfer and payment flows
 * 
 * @module constants/payment
 */

/**
 * Bank account details for BACS transfers
 * Single source of truth for all payment pages
 */
export const BANK_DETAILS = {
  ACCOUNT_NAME: 'Department for Energy Security and Net Zero',
  SORT_CODE: '60-70-80',
  ACCOUNT_NUMBER: '10033769',
} as const;

/**
 * Payment method types
 */
export const PAYMENT_METHOD = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  BACS: 'bacs',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Payment route paths (relative to S37_BASE_URL)
 */
export const PAYMENT_ROUTES = {
  PAYMENT_METHOD: 'payment-method',
  BANK_TRANSFER_PAYMENT: 'bank-transfer-payment',
  BANK_TRANSFER_CONFIRMATION: 'bank-transfer-confirmation',
  BANK_TRANSFER_SUCCESS: 'bank-transfer-success',
  PAYMENT_CALLBACK: '/frontend/payment/callback',
} as const;

/**
 * Payment error messages
 * Centralized for consistency and i18n readiness
 */
export const PAYMENT_ERROR_MESSAGES = {
  // Confirmation errors
  CONFIRM_BANK_TRANSFER_REQUIRED: 'You must confirm you want to pay by bank transfer',
  CONFIRM_CARD_PAYMENT_REQUIRED: 'You must confirm that you understand the application will be submitted when you pay by card',
  CONFIRM_PAYMENT_MADE_REQUIRED: 'You must confirm you have made the payment',
  
  // Input errors
  TRANSACTION_NUMBER_REQUIRED: 'You must provide the transaction number',
  TRANSACTION_NUMBER_INVALID: 'Transaction number must contain only letters, numbers, and hyphens',
  
  // API errors
  PAYMENT_CREATION_FAILED: 'Failed to initiate payment',
  SUBMISSION_FAILED: 'Failed to submit application',
  NO_REDIRECT_URL: 'No redirect URL received from payment service',
  
  // General errors
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

/**
 * Payment info messages
 */
export const PAYMENT_INFO_MESSAGES = {
  BANK_TRANSFER_INFO: 'You should only pay by bank transfer if you cannot pay by credit or debit card.',
  PAYMENT_REFERENCE_INFO: 'You must use your invoice number as the payment reference to help us match your payment to this application.',
  CARD_PAYMENT_INFO: 'This is the fastest way to pay and helps avoid any delays when processing your application.',
  BANK_TRANSFER_DELAY_INFO: 'We can only start processing your submitted application after we receive your payment.',
  PAYMENT_PENDING_INFO: 'Your payment has not been received yet',
} as const;

/**
 * Payment warning messages
 */
export const PAYMENT_WARNING_MESSAGES = {
  PAYMENT_NOT_RECEIVED: 'Please note that your application has been submitted but your payment has not been received yet.',
  SUBMISSION_DATE: 'If you choose this payment method, the date of payment will become your official submission date.',
  PENDING_STATUS: 'Your application\'s status will show as \'Payment pending\' until we have reconciled your payment.',
} as const;

/**
 * Payment success messages
 */
export const PAYMENT_SUCCESS_MESSAGES = {
  APPLICATION_SUBMITTED: 'Application submitted - Payment pending',
  PAYMENT_RECEIVED: 'Payment received successfully',
} as const;

/**
 * Payment page titles
 */
export const PAYMENT_PAGE_TITLES = {
  PAYMENT_METHOD: 'Choose payment method',
  BANK_TRANSFER_PAYMENT: 'Pay by bank transfer',
  BANK_TRANSFER_CONFIRMATION: 'Confirm your payment action',
  BANK_TRANSFER_SUCCESS: 'Application submitted - Payment pending',
} as const;

/**
 * Payment button labels
 */
export const PAYMENT_BUTTON_LABELS = {
  PAY_BY_CARD: 'Pay by card',
  PAY_BY_BANK_TRANSFER: 'Pay by bank transfer',
  CONTINUE: 'Continue',
  BACK_TO_TASK_LIST: 'Back to task list',
  BACK_TO_APPLICATIONS: 'Back to applications',
  GO_TO_SUMMARY: 'Go to Application summary',
  PROCESSING: 'Processing...',
  SUBMITTING: 'Submitting...',
} as const;

/**
 * Payment validation patterns
 */
export const PAYMENT_VALIDATION = {
  TRANSACTION_NUMBER_PATTERN: /^[A-Z0-9\-]+$/i,
  TRANSACTION_NUMBER_MIN_LENGTH: 1,
  TRANSACTION_NUMBER_MAX_LENGTH: 100,
} as const;

/**
 * Bank transfer instructions
 */
export const BANK_TRANSFER_INSTRUCTIONS = {
  HEADING: 'You must make your payment into this bank account:',
  WHAT_TO_DO_NEXT: 'What to do next',
  PAYMENT_CONFIRMATION: 'At this point, we expect you have completed the bank transfer.',
  PROVIDE_TRANSACTION_NUMBER: 'Please provide the transaction number provided via bank transfer that you have completed for the payment of this application.',
} as const;

/**
 * Format bank account details for display
 */
export function formatBankDetails() {
  return {
    accountName: BANK_DETAILS.ACCOUNT_NAME,
    sortCode: BANK_DETAILS.SORT_CODE,
    accountNumber: BANK_DETAILS.ACCOUNT_NUMBER,
  };
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

/**
 * Validate transaction number format
 */
export function isValidTransactionNumber(value: string): boolean {
  if (!value || value.length < PAYMENT_VALIDATION.TRANSACTION_NUMBER_MIN_LENGTH) {
    return false;
  }
  if (value.length > PAYMENT_VALIDATION.TRANSACTION_NUMBER_MAX_LENGTH) {
    return false;
  }
  return PAYMENT_VALIDATION.TRANSACTION_NUMBER_PATTERN.test(value);
}

/**
 * Bank Transfer Success Page Content
 * All text content for the bank transfer success/confirmation page
 */
export const BANK_TRANSFER_SUCCESS_PAGE = {
  // Page heading
  PAGE_HEADING: 'Application status',

  // Confirmation panel
  PANEL_TITLE: 'Application submitted',
  APPLICATION_NUMBER_TEXT: 'Your application number is',
  LOADING_TEXT: 'Loading...',
  NOT_AVAILABLE_TEXT: 'N/A',

  // Body content
  SUBMISSION_CONFIRMATION: 'This application has been submitted and can no longer be edited or deleted.',

  // Warning section
  WARNING_HEADING: 'Please note that',
  WARNING_ITEMS: {
    APPLICATION_SUBMITTED: 'Your application has been submitted',
    PAYMENT_NOT_RECEIVED: 'Your payment has not been received yet',
  },
  PAYMENT_REQUIRED: 'You still need to complete your payment by bank transfer.',
  PROCESSING_INFO: 'We will start processing your application but we cannot deliver a decision until we receive your payment.',

  // What to do next section
  WHAT_TO_DO_NEXT_HEADING: 'What to do next',
  PAYMENT_INSTRUCTION: 'If you haven\'t paid yet, you must make your payment into this bank account:',

  // Bank details labels
  BANK_DETAILS_LABELS: {
    ACCOUNT_NAME: 'Account name',
    SORT_CODE: 'Sort code',
    ACCOUNT_NUMBER: 'Account number',
    PAYMENT_REFERENCE: 'Payment reference',
    AMOUNT: 'Amount',
  },

  PAYMENT_REFERENCE_INSTRUCTION: 'You must use your invoice number as the payment reference',
  PAYMENT_REFERENCE_HELP: 'to help us match your payment to this application.',

  // What happens next section
  WHAT_HAPPENS_NEXT_HEADING: 'What happens next',
  EMAIL_CONFIRMATION: 'You will receive an email to confirm your application has been submitted.',
  FOLLOW_UP_INFO: 'Your Overhead Lines (Section 37) will contact you in due course with',
  FOLLOW_UP_ACTIONS: 'any follow up actions.',

  // Error messages
  ERROR_HEADING: 'Warning',
} as const;
