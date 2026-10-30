import { AdditionalPaymentRequest, additionalPaymentAmount } from '../../../services/additionalPaymentsService';
import { additionalPaymentStatusText } from '../constants/additionalPayments';

export function additionalPaymentReceiptRows(payment: AdditionalPaymentRequest) {
  const bankTransfer = payment.payment_method === 'BACS';
  return [
    { label: bankTransfer ? 'Transaction number' : 'Reference number', value: bankTransfer ? payment.transaction_reference || 'Not provided' : payment.payment_reference || 'Not available' },
    { label: 'Invoice number', value: payment.invoice?.invoice_number || 'Not available' },
    { label: 'Total amount', value: additionalPaymentAmount(payment.amount_pence) },
    { label: 'Payment status', value: additionalPaymentStatusText[payment.status] },
  ];
}

export function additionalPaymentDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}