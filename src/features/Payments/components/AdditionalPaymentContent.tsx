import type { AdditionalPaymentFlow } from '../hooks/useAdditionalPayment';
import { ADDITIONAL_PAYMENT_LABELS as LABELS } from '../constants/additionalPayments';
import { additionalPaymentView } from '../utils/additionalPaymentView';
import { AdditionalPaymentActions } from './AdditionalPaymentActions';
import { AdditionalPaymentReceipt } from './AdditionalPaymentReceipt';
import { AdditionalPaymentBreakdown, AdditionalPaymentGeneratingInvoice, AdditionalPaymentInvoice } from './AdditionalPaymentInvoice';
import { AdditionalPaymentBankTransfer, AdditionalPaymentMethod } from './AdditionalPaymentMethod';
import { AdditionalPaymentProof } from './AdditionalPaymentProof';
import { AdditionalPaymentFailed, AdditionalPaymentStatus } from './AdditionalPaymentResult';

export function AdditionalPaymentContent({ flow, back }: { flow: AdditionalPaymentFlow; back: React.ReactNode }) {
  const { payment, amount, busy, actionable, goTo } = flow;
  const { view } = additionalPaymentView(flow);
  const actions = (label: string, onClick: () => void, disabled = !actionable) =>
    <AdditionalPaymentActions label={label} onClick={onClick} busy={busy} disabled={disabled} back={back} />;
  switch (view) {
    case 'loading': return null;
    case 'unavailable':
    case 'withdrawn':
    case 'pending':
    case 'unconfirmed': return <AdditionalPaymentStatus status={view} onRetry={flow.retry} />;
    case 'generating': return <AdditionalPaymentGeneratingInvoice />;
    case 'receipt': return payment && <AdditionalPaymentReceipt payment={payment} />;
    case 'invoice': return payment && <AdditionalPaymentInvoice payment={payment} actions={payment.invoice
      ? actions(LABELS.continuePayment, () => goTo('payment-method'))
      : actions(LABELS.generateInvoice, () => void flow.invoice())} />;
    case 'payment-method': return <AdditionalPaymentMethod amount={amount} disabled={busy || !actionable}
      onBankTransfer={() => goTo('bank-transfer')} actions={actions(busy ? LABELS.processing : LABELS.payByCard, () => void flow.card())} />;
    case 'result': return <AdditionalPaymentFailed actions={actions(busy ? LABELS.processing : LABELS.payByCard, () => void flow.card())} />;
    case 'bank-transfer': return <AdditionalPaymentBankTransfer amount={amount} invoiceNumber={payment?.invoice?.invoice_number}
      confirmed={flow.confirmed} onConfirm={flow.setConfirmed}
      actions={actions(LABELS.saveContinue, flow.continueBankTransfer, !actionable || !payment?.invoice)} />;
    case 'proof': return <AdditionalPaymentProof applicationId={flow.applicationId} requestId={flow.requestId}
      transaction={flow.transaction} onTransaction={flow.setTransaction} upload={flow.upload} files={flow.files}
      onErrors={flow.setFileErrors} onUploaded={flow.addFiles} onDelete={flow.removeFile}
      actions={actions(busy ? LABELS.confirming : LABELS.confirmPayment, () => void flow.bankTransfer())} />;
    case 'required': return payment && <AdditionalPaymentBreakdown payment={payment} amount={amount} actionable={actionable}
      actions={actions(LABELS.generateInvoice, () => void flow.invoice())} />;
  }
}