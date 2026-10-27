import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import Details from '../../../components/Details';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile } from '../../../types/fileUpload';
import { BANK_DETAILS } from '../../../constants/payment';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { AdditionalPaymentReceipt } from '../AdditionalPaymentReceipt';
import { AdditionalInvoiceLink } from '../AdditionalInvoiceLink';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import '../../../styles/loading-spinner.css';
import {
  AdditionalPaymentRequest, additionalPaymentAmount, validAdditionalAmount,
  getAdditionalPayment, generateAdditionalInvoice, createAdditionalCardPayment,
  verifyAdditionalPayment, confirmAdditionalBankTransfer, trustedCardUrl, additionalEvidenceEndpoints,
} from '../../../services/additionalPaymentsService';

export default function AdditionalPaymentPage() {
  const { applicationId = '', requestId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = location.pathname.startsWith('/nwl/') ? '/nwl' : '/s-37';
  const summary = `${baseUrl}/${applicationId}/application-summary`;
  const root = `${baseUrl}/${applicationId}/additional-payments/${requestId}`;
  const step = location.pathname.slice(root.length).replace(/^\//, '') || 'required';
  const [payment, setPayment] = useState<AdditionalPaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [transaction, setTransaction] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cardOutcome, setCardOutcome] = useState<'PENDING' | 'FAILED' | 'SUCCEEDED'>();
  const [retry, setRetry] = useState(0);
  const upload = useRef<FileUploadHandle>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const generating = busy && (step === 'required' || step === 'invoice');

  useBreadcrumb(generating ? null : <nav className="govuk-breadcrumbs" aria-label="Breadcrumb"><ol className="govuk-breadcrumbs__list"><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to="/application-dashboard">Applications</Link></li><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={summary}>Application summary</Link></li></ol></nav>);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setVerified(false);
    setCardOutcome(undefined);
    setError('');
    async function load() {
      try {
        let result = await getAdditionalPayment(applicationId, requestId);
        if (step === 'result' || result.status === 'NOT_PAID') {
          const key = `additional-payment:${applicationId}:${requestId}`;
          const paymentId = step === 'result' ? new URLSearchParams(location.search).get('payment_id') || sessionStorage.getItem(key) || undefined : undefined;
          const status = await verifyAdditionalPayment(applicationId, requestId, paymentId);
          result = { ...result, status: status.status, payment_reference: status.payment_reference || result.payment_reference };
          if (active) { setVerified(true); setCardOutcome(status.card_outcome); }
        }
        if (active) setPayment(result);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'We could not load this additional payment. Please try again.');
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [applicationId, requestId, step, location.search, retry]);

  useEffect(() => { if (error || fileErrors.length) errorSummary.current?.focus(); }, [error, fileErrors]);

  async function act(action: () => Promise<void>) {
    if (!payment || busy) return;
    if (!validAdditionalAmount(payment.amount_pence)) { setError('Payment amount is not available. Return to the application summary and try again.'); return; }
    setBusy(true);
    setError('');
    try {
      let latest = await getAdditionalPayment(applicationId, requestId);
      setPayment(latest);
      if (latest.status !== 'NOT_PAID') throw new Error(latest.status === 'WITHDRAWN' ? 'This additional payment request has been withdrawn. No payment can be made.' : 'This additional payment is already paid or being processed. Return to the application summary.');
      const status = await verifyAdditionalPayment(applicationId, requestId);
      latest = { ...latest, status: status.status, payment_reference: status.payment_reference || latest.payment_reference };
      setPayment(latest);
      setVerified(true);
      setCardOutcome(status.card_outcome);
      if (latest.status !== 'NOT_PAID' || status.card_outcome && status.card_outcome !== 'FAILED' || step === 'result' && status.card_outcome !== 'FAILED') return;
      if (!validAdditionalAmount(latest.amount_pence)) throw new Error('Payment amount is not available. Return to the application summary and try again.');
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not update this additional payment. Please try again.');
      try { setPayment(await getAdditionalPayment(applicationId, requestId)); } catch { return; }
    } finally { setBusy(false); }
  }

  async function invoice() {
    await act(async () => {
      const result = await generateAdditionalInvoice(applicationId, requestId);
      setPayment(current => current ? { ...current, invoice: result } : current);
      navigate(`${root}/invoice`);
    });
  }
  async function card() {
    await act(async () => {
      const result = await createAdditionalCardPayment(applicationId, requestId);
      const url = trustedCardUrl(result.next_url);
      sessionStorage.setItem(`additional-payment:${applicationId}:${requestId}`, result.payment_id);
      window.location.assign(url);
    });
  }
  async function bankTransfer() {
    if (fileErrors.length) { errorSummary.current?.focus(); return; }
    if (!payment?.invoice) { setError('Generate an invoice for this additional payment before confirming your bank transfer.'); return; }
    if (transaction.trim() && !/^[a-z0-9]+$/i.test(transaction.trim())) { setError('Transaction number must contain only letters and numbers.'); return; }
    if (upload.current?.isBusy()) { setError('File scan is in progress. Wait for the scan to finish before continuing.'); return; }
    await act(async () => {
      const result = await upload.current?.triggerUpload();
      if (result?.scanErrors.length) { setFileErrors(result.scanErrors); return; }
      if (result?.uploadedFiles.length) setFiles(current => [...current.filter(file => !result.uploadedFiles.some(next => next.id === file.id)), ...result.uploadedFiles]);
      const ids = [...new Set([...files, ...(result?.uploadedFiles || [])].map(file => file.id))];
      const updated = await confirmAdditionalBankTransfer(applicationId, requestId, {
        ...(transaction.trim() ? { transaction_reference: transaction.trim() } : {}),
        ...(ids.length ? { evidence_file_ids: ids } : {}),
      });
      setPayment(updated);
      navigate(`${root}/processing`);
    });
  }

  const amount = payment ? additionalPaymentAmount(payment.amount_pence) : 'Amount unavailable';
  const pending = payment?.status === 'NOT_PAID' && (cardOutcome !== undefined && cardOutcome !== 'FAILED' || step === 'result' && (!verified || cardOutcome !== 'FAILED'));
  const actionable = payment?.status === 'NOT_PAID' && verified && !pending && validAdditionalAmount(payment.amount_pence);
  const completed = payment?.status === 'PAID' || payment?.status === 'PROCESSING';
  const failed = !loading && verified && step === 'result' && payment?.status === 'NOT_PAID' && cardOutcome === 'FAILED';
  const back = <Link className="govuk-button govuk-button--secondary" to={summary}>{completed ? 'View application summary' : failed ? 'Return to application summary' : 'Back to application summary'}</Link>;
  const button = (label: string, onClick: () => void, disabled = !actionable) => <div className="govuk-button-group"><button type="button" className="govuk-button" disabled={busy || disabled} aria-busy={busy} onClick={onClick}>{label}</button>{back}</div>;
  const groupedActions = !loading && !pending && payment?.status === 'NOT_PAID' && (step !== 'result' && step !== 'processing' || failed);
  let title = 'Payment required';
  let content;
  if (loading) { title = step === 'result' ? 'Checking your payment...' : 'Loading additional payment...'; }
  else if (!payment) content = <button className="govuk-button" onClick={() => setRetry(value => value + 1)}>Try again</button>;
  else if (payment.status === 'WITHDRAWN') {
    title = 'Request withdrawn'; content = <p className="govuk-body">This additional payment request has been withdrawn. You do not need to make this payment.</p>;
  } else if (pending) {
    title = 'We could not confirm your payment'; content = <><p className="govuk-body">Your payment has not yet been confirmed. Check its status before trying to pay again.</p><button className="govuk-button" onClick={() => setRetry(value => value + 1)}>Check payment status</button></>;
  } else if (payment.status === 'PAID') {
    title = 'Payment received'; content = <AdditionalPaymentReceipt payment={payment} />;
  } else if (payment.status === 'PROCESSING') {
    title = 'Processing additional payment'; content = <AdditionalPaymentReceipt payment={payment} />;
  } else if (generating) {
    title = 'Generating invoice...'; content = <><div className="govuk-notification-banner"><div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Important</h2></div><div className="govuk-notification-banner__content"><p className="govuk-notification-banner__heading">Please do not close this window or navigate away from this page while we generate your invoice.</p></div></div><div className="hods-loading-spinner" role="status"><div className="hods-loading-spinner__spinner" aria-hidden="true" /><div className="hods-loading-spinner__content"><h1 className="govuk-heading-m">Generating invoice...</h1></div></div></>;
  } else if (step === 'invoice') {
    title = 'Your invoice'; content = payment.invoice ? <><p className="govuk-body">Your invoice number is:<br /><strong>{payment.invoice.invoice_number}</strong></p><p className="govuk-body"><AdditionalInvoiceLink payment={payment} className="govuk-button govuk-button--secondary">Download invoice (PDF)</AdditionalInvoiceLink></p><div className="govuk-button-group">{button('Continue to payment', () => navigate(`${root}/payment-method`))}</div></> : <><p className="govuk-body">Generate an invoice for this additional payment before continuing.</p>{button('Generate invoice', () => void invoice())}</>;
  } else if (step === 'payment-method') {
    title = 'Choose payment method';
    content = (
      <>
        <p className="govuk-body">You must pay <strong>{amount}</strong> to settle this additional payment invoice.</p>
        <p className="govuk-body">You will be redirected to a secure page to pay by credit or debit card.</p>
        <p className="govuk-body">This is the fastest way to pay and helps avoid any delays when processing your application.</p>
        <Details id="additional-bank-transfer" summary="I cannot pay by card and need another way to pay">
          <p className="govuk-body">If you cannot pay by credit or debit card, you can pay by bank transfer (BACS).</p>
          <p className="govuk-body">Your additional payment's status will show as 'Processing additional payment' until we have reconciled your payment.</p>
          <button className="govuk-button govuk-button--secondary" disabled={busy || !actionable} onClick={() => navigate(`${root}/bank-transfer`)}>Pay by bank transfer</button>
        </Details>
        {button(busy ? 'Processing...' : 'Pay by card', () => void card())}
      </>
    );
  } else if (step === 'result') {
    title = 'The payment was unsuccessful'; content = <><div className="govuk-notification-banner"><div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Important</h2></div><div className="govuk-notification-banner__content"><h1 className="govuk-notification-banner__heading">The payment was unsuccessful</h1></div></div><p className="govuk-body">No money has been taken from your account.</p><p className="govuk-body">Payments can fail if:</p><ul className="govuk-list govuk-list--bullet"><li>your card details were incorrect</li><li>your card has expired</li><li>your card type is not accepted</li><li>your bank declined the payment</li><li>there was a temporary problem with the payment service</li></ul><h2 className="govuk-heading-m">What happens next</h2><p className="govuk-body">You can try to pay by card again or return to your application summary. The additional payment request stays open until it is paid. Contact your bank if the payment fails again.</p>{button(busy ? 'Processing...' : 'Pay by card', () => void card())}</>;
  } else if (step === 'bank-transfer') {
    title = 'Pay by bank transfer'; content = <><p className="govuk-body">You should only pay by bank transfer if you cannot pay by credit or debit card.</p><p className="govuk-body">You must pay <strong>{amount}</strong> using these banking details:</p><ul className="govuk-list"><li><strong>Account name:</strong> {BANK_DETAILS.ACCOUNT_NAME}</li><li><strong>Sort code:</strong> {BANK_DETAILS.SORT_CODE}</li><li><strong>Account number:</strong> {BANK_DETAILS.ACCOUNT_NUMBER}</li><li><strong>Payment reference:</strong> {payment.invoice?.invoice_number || 'Invoice unavailable'}</li></ul><div className="govuk-inset-text">You must use your invoice number as the payment reference to help us match your additional payment.</div><div className="govuk-checkboxes govuk-!-margin-bottom-6"><div className="govuk-checkboxes__item"><input className="govuk-checkboxes__input" id="confirm-transfer" type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><label className="govuk-label govuk-checkboxes__label" htmlFor="confirm-transfer">I confirm I want to pay by bank transfer</label></div></div>{button('Save and continue', () => confirmed ? navigate(`${root}/proof`) : setError('You must confirm you want to pay by bank transfer.'), !actionable || !payment.invoice)}</>;
  } else if (step === 'proof') {
    title = 'Provide proof of payment'; content = <><p className="govuk-body">If possible, please provide proof of payment to help us reconcile your payment more quickly.</p><p className="govuk-body">Here are some examples of acceptable proof of payment:</p><ul className="govuk-list govuk-list--bullet"><li><strong>Transaction number</strong> - this is usually found within the details of the bank transfer</li><li><strong>Document showing the bank transfer</strong> - this could be a remittance advice note or transfer receipt showing all the details of the transaction</li></ul><div className="govuk-form-group"><label className="govuk-label govuk-!-font-weight-bold" htmlFor="transaction-number">Transaction number (optional)</label><div className="govuk-hint" id="transaction-hint">Must contain only letters and numbers.</div><input className="govuk-input govuk-input--width-20" id="transaction-number" aria-describedby="transaction-hint" maxLength={100} value={transaction} onChange={event => setTransaction(event.target.value)} /></div><h2 className="govuk-heading-s">Upload a document showing full details of the bank transfer (optional)</h2><FileUpload ref={upload} title="Upload proof of payment (optional)" showTitle={false} applicationId={applicationId} category={FILE_CATEGORIES.PAYMENT_PROOF} subCategory={requestId} prefix={`${applicationId}/ADDITIONAL_PAYMENTS/${requestId}`} uploadEndpoints={additionalEvidenceEndpoints(applicationId, requestId)} uploadedFiles={files} onValidationErrors={setFileErrors} onUploaded={newFiles => setFiles(current => [...current.filter(file => !newFiles.some(next => next.id === file.id)), ...newFiles])} onDeleteFile={id => setFiles(current => current.filter(file => file.id !== id))} /><div className="govuk-!-margin-top-6">{button(busy ? 'Confirming...' : 'Confirm payment', () => void bankTransfer())}</div></>;
  } else if (step === 'processing') {
    title = 'Payment not confirmed'; content = <p className="govuk-body">Your additional payment has not been confirmed. Return to the application summary to check its status.</p>;
  } else {
    content = <><p className="govuk-body">You must pay <strong>{amount}</strong> to settle this additional payment.</p><p className="govuk-body">Here is the breakdown of your payment:</p><table className="govuk-table"><thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header" scope="col">Item</th><th className="govuk-table__header govuk-table__header--numeric" scope="col">Amount</th></tr></thead><tbody className="govuk-table__body">{payment.items.map((item, index) => <tr className="govuk-table__row" key={`${index}-${item.description}`}><th scope="row" className="govuk-table__header">{item.description}</th><td className="govuk-table__cell govuk-table__cell--numeric">{additionalPaymentAmount(item.amount_pence)}</td></tr>)}<tr className="govuk-table__row"><th className="govuk-table__header" scope="row">TOTAL</th><td className="govuk-table__cell govuk-table__cell--numeric"><strong>{amount}</strong></td></tr></tbody></table><div className="govuk-inset-text">You need to generate an invoice to move to the next step.</div>{!actionable && <p className="govuk-error-message" role="alert">Payment amount is not available. Return to the application summary and try again.</p>}{button('Generate invoice', () => void invoice())}</>;
  }
  return <><PageTitle title={title} /><div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">{(error || fileErrors.length > 0) && <div ref={errorSummary} tabIndex={-1} className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><div className="govuk-error-summary__body">{error && <p className="govuk-body">{error}</p>}<ul className="govuk-list">{fileErrors.map(message => <li key={message}>{message}</li>)}</ul></div></div>}{!failed && !generating && payment?.status !== 'PAID' && payment?.status !== 'PROCESSING' && <h1 className="govuk-heading-xl">{title}</h1>}{content}{!groupedActions && !generating && <p className="govuk-body govuk-!-margin-top-6">{back}</p>}</div></div></div></>;
}