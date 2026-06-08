export interface PaymentPageText {
  pageTitle: string;
  cardRedirect: string;
  cardBenefits: string;
  detailsSummary: string;
  detailsParagraphs: string[];
  detailsStatus: string;
  bankTransferButton: string;
  payByCardButton: string;
  backToTaskList: string;
}

export const PAYMENT_PAGE_TEXT: PaymentPageText = {
  pageTitle: 'Choose payment method',
  cardRedirect: 'You will be redirected to a secure page to pay by credit or debit card.',
  cardBenefits: 'This is the fastest way to pay and helps avoid any delays when processing your application.',
  detailsSummary: 'I cannot pay by card and need another way to pay',
  detailsParagraphs: [
    'If you cannot pay by credit or debit card, you can pay by bank transfer (BACS).',
  ],
  detailsStatus: 'Processing payment',
  bankTransferButton: 'Pay by bank transfer',
  payByCardButton: 'Pay by card',
  backToTaskList: 'Back to task list',
};

export default PAYMENT_PAGE_TEXT;
