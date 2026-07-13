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
  PAYMENT_CALLBACK: '/payment/callback',
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
  VIEW_APPLICATION_SUMMARY: 'View application summary',
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
  // Confirmation panel
  PANEL_TITLE: 'Application submitted - processing payment',
  APPLICATION_NUMBER_TEXT: 'Your application number is',
  LOADING_TEXT: 'Loading...',
  NOT_AVAILABLE_TEXT: 'N/A',
  NOT_PROVIDED_TEXT: 'Not provided',

  // Payment summary
  PAYMENT_SUMMARY_HEADING: 'Payment Summary',
  SUMMARY_LABELS: {
    TRANSACTION_NUMBER: 'Transaction number',
    INVOICE_NUMBER: 'Invoice number',
    TOTAL_AMOUNT: 'Total amount',
    APPLICATION_STATUS: 'Application status',
  },
  APPLICATION_STATUS_PROCESSING: 'Processing payment',
  PROCESSING_STATUS_INFO:
    "Your application's status will show as 'Processing payment' until we have reconciled your payment.",
  INVOICE_INFO: 'You can find your invoice with all payment details in the application summary.',

  // What happens next section
  WHAT_HAPPENS_NEXT_HEADING: 'What happens next',
  EMAIL_CONFIRMATION: 'You will receive an email to confirm your application has been submitted.',
  FOLLOW_UP_INFO_S37:
    'The Overhead Lines (Section 37) team will contact you in due course with any follow up actions.',
  FOLLOW_UP_INFO_NWL:
    'The Necessary Wayleaves team will contact you in due course with any follow up actions.',

  // Error messages
  ERROR_HEADING: 'Warning',
} as const;
