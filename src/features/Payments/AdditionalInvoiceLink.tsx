import { useState } from 'react';
import { AdditionalPaymentRequest, downloadAdditionalInvoice } from '../../services/additionalPaymentsService';

export function AdditionalInvoiceLink({ payment, className = 'govuk-link', children }: { payment: AdditionalPaymentRequest; className?: string; children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function download() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const blob = await downloadAdditionalInvoice(payment.application_id, payment.request_id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${payment.invoice?.invoice_number.replace(/[^a-z0-9_-]/gi, '-') || 'invoice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not download your invoice. Please try again.');
    } finally { setBusy(false); }
  }
  return <><a className={className} href={payment.invoice?.download_url} aria-disabled={busy} onClick={event => { event.preventDefault(); void download(); }}>{busy ? 'Downloading invoice...' : children}</a>{error && <span className="govuk-error-message" role="alert">{error}</span>}</>;
}