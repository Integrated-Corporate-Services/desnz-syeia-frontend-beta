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
    'We can only start processing your submitted application after we receive your payment.',
    'If you choose this payment method, the date of payment will become your official submission date.',
    'You should pay by credit or debit card if you would like us to start processing your application more quickly.',
  ],
  detailsStatus: 'Processing payment',
  bankTransferButton: 'Pay by bank transfer',
  payByCardButton: 'Pay by card',
  backToTaskList: 'Back to task list',
};

export default PAYMENT_PAGE_TEXT;
