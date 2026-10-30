export const additionalPaymentStatusText = {
  NOT_PAID: 'Not paid',
  PROCESSING: 'Processing additional payment',
  PAID: 'Paid',
  WITHDRAWN: 'Request withdrawn',
};

export const ADDITIONAL_PAYMENT_ERRORS = {
  summary: 'Additional payment requests could not be loaded. Please try again.',
  load: 'We could not load this additional payment. Please try again.',
  update: 'We could not update this additional payment. Please try again.',
  amount: 'Payment amount is not available. Return to the application summary and try again.',
  withdrawn: 'This additional payment request has been withdrawn. No payment can be made.',
  completed: 'This additional payment is already paid or being processed. Return to the application summary.',
  invoice: 'Generate an invoice for this additional payment before confirming your bank transfer.',
  transaction: 'Transaction number must contain only letters and numbers.',
  scanning: 'File scan is in progress. Wait for the scan to finish before continuing.',
  confirmation: 'You must confirm you want to pay by bank transfer.',
};

export const ADDITIONAL_PAYMENT_TITLES = {
  required: 'Payment required', loading: 'Loading additional payment...', checking: 'Checking your payment...',
  withdrawn: 'Request withdrawn', pending: 'We could not confirm your payment', paid: 'Payment received',
  processing: 'Processing additional payment', generating: 'Generating invoice...', invoice: 'Your invoice',
  'payment-method': 'Choose payment method', result: 'The payment was unsuccessful',
  'bank-transfer': 'Pay by bank transfer', proof: 'Provide proof of payment', unconfirmed: 'Payment not confirmed',
};

export const ADDITIONAL_PAYMENT_COPY = {
  amountUnavailable: 'Amount unavailable',
  breakdown: 'Here is the breakdown of your payment:',
  generateInvoice: 'You need to generate an invoice to move to the next step.',
  missingInvoice: 'Generate an invoice for this additional payment before continuing.',
  generating: 'Please do not close this window or navigate away from this page while we generate your invoice.',
  cardRedirect: 'You will be redirected to a secure page to pay by credit or debit card.',
  fastest: 'This is the fastest way to pay and helps avoid any delays when processing your application.',
  alternative: 'I cannot pay by card and need another way to pay',
  bankAlternative: 'If you cannot pay by credit or debit card, you can pay by bank transfer (BACS).',
  bankProcessing: "Your additional payment's status will show as 'Processing additional payment' until we have reconciled your payment.",
  bankOnly: 'You should only pay by bank transfer if you cannot pay by credit or debit card.',
  reference: 'You must use your invoice number as the payment reference to help us match your additional payment.',
  confirmTransfer: 'I confirm I want to pay by bank transfer',
  proof: 'If possible, please provide proof of payment to help us reconcile your payment more quickly.',
  proofExamples: 'Here are some examples of acceptable proof of payment:',
  transactionExample: ' - this is usually found within the details of the bank transfer',
  documentExample: ' - this could be a remittance advice note or transfer receipt showing all the details of the transaction',
  transactionLabel: 'Transaction number (optional)', transactionHint: 'Must contain only letters and numbers.',
  uploadHeading: 'Upload a document showing full details of the bank transfer (optional)', uploadTitle: 'Upload proof of payment (optional)',
  withdrawn: 'This additional payment request has been withdrawn. You do not need to make this payment.',
  pending: 'Your payment has not yet been confirmed. Check its status before trying to pay again.',
  unconfirmed: 'Your additional payment has not been confirmed. Return to the application summary to check its status.',
  noMoneyTaken: 'No money has been taken from your account.',
  failureReasons: ['your card details were incorrect', 'your card has expired', 'your card type is not accepted', 'your bank declined the payment', 'there was a temporary problem with the payment service'],
  retryPayment: 'You can try to pay by card again or return to your application summary. The additional payment request stays open until it is paid. Contact your bank if the payment fails again.',
};

export const ADDITIONAL_PAYMENT_STATUS_COLOURS = {
  NOT_PAID: 'red', PROCESSING: 'blue', PAID: 'green', WITHDRAWN: 'grey',
};

export const ADDITIONAL_PAYMENT_RECEIPT_COPY = {
  processingStatus: "Your application's payment status will show as 'Processing additional payment' until we have reconciled your payment.",
  invoice: 'You can find your invoice with all payment details in the application summary.',
  processingEmail: 'We will email you when we have received and reconciled your payment.',
  paidEmail: 'We will email you a receipt.',
  processingNext: 'The case officer will continue assessing your application while your payment is being processed.',
  paidNext: "Your application's payment status will show as 'Paid'. The case officer will continue assessing your application and will contact you with any follow-up actions.",
};

export const ADDITIONAL_PAYMENT_LABELS = {
  generateInvoice: 'Generate invoice', continuePayment: 'Continue to payment', processing: 'Processing...',
  payByCard: 'Pay by card', saveContinue: 'Save and continue', confirming: 'Confirming...', confirmPayment: 'Confirm payment',
  viewSummary: 'View application summary', returnSummary: 'Return to application summary', backSummary: 'Back to application summary',
  problem: 'There is a problem', applications: 'Applications', applicationSummary: 'Application summary',
};