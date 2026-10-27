import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile } from '../../../types/fileUpload';
import {
  AdditionalPaymentRequest, additionalPaymentAmount, validAdditionalAmount,
  getAdditionalPayment, generateAdditionalInvoice, createAdditionalCardPayment,
  verifyAdditionalPayment, confirmAdditionalBankTransfer, trustedCardUrl,
} from '../../../services/additionalPaymentsService';
import { ADDITIONAL_PAYMENT_COPY, ADDITIONAL_PAYMENT_ERRORS } from '../constants/additionalPayments';

export function useAdditionalPayment() {
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

  useEffect(() => {
    setFileErrors([]);
    setFiles([]);
    setTransaction('');
    setConfirmed(false);
  }, [applicationId, requestId]);

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
        if (active) {
          setPayment(null);
          setError(reason instanceof Error ? reason.message : ADDITIONAL_PAYMENT_ERRORS.load);
        }
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [applicationId, requestId, step, location.search, retry]);

  useEffect(() => { if (error || fileErrors.length) errorSummary.current?.focus(); }, [error, fileErrors]);

  async function act(action: () => Promise<void>) {
    if (!payment || busy) return;
    if (!validAdditionalAmount(payment.amount_pence)) { setError(ADDITIONAL_PAYMENT_ERRORS.amount); return; }
    setBusy(true);
    setError('');
    try {
      let latest = await getAdditionalPayment(applicationId, requestId);
      setPayment(latest);
      if (latest.status !== 'NOT_PAID') throw new Error(latest.status === 'WITHDRAWN' ? ADDITIONAL_PAYMENT_ERRORS.withdrawn : ADDITIONAL_PAYMENT_ERRORS.completed);
      const status = await verifyAdditionalPayment(applicationId, requestId);
      latest = { ...latest, status: status.status, payment_reference: status.payment_reference || latest.payment_reference };
      setPayment(latest);
      setVerified(true);
      setCardOutcome(status.card_outcome);
      if (latest.status !== 'NOT_PAID' || status.card_outcome && status.card_outcome !== 'FAILED' || step === 'result' && status.card_outcome !== 'FAILED') return;
      if (!validAdditionalAmount(latest.amount_pence)) throw new Error(ADDITIONAL_PAYMENT_ERRORS.amount);
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : ADDITIONAL_PAYMENT_ERRORS.update);
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

  function addFiles(newFiles: UploadedFile[]) {
    setFiles(current => [...current.filter(file => !newFiles.some(next => next.id === file.id)), ...newFiles]);
  }

  async function bankTransfer() {
    if (fileErrors.length) { errorSummary.current?.focus(); return; }
    if (!payment?.invoice) { setError(ADDITIONAL_PAYMENT_ERRORS.invoice); return; }
    if (transaction.trim() && !/^[a-z0-9]+$/i.test(transaction.trim())) { setError(ADDITIONAL_PAYMENT_ERRORS.transaction); return; }
    if (upload.current?.isBusy()) { setError(ADDITIONAL_PAYMENT_ERRORS.scanning); return; }
    await act(async () => {
      const result = await upload.current?.triggerUpload();
      if (result?.scanErrors.length) { setFileErrors(result.scanErrors); return; }
      if (result?.uploadedFiles.length) addFiles(result.uploadedFiles);
      const ids = [...new Set([...files, ...(result?.uploadedFiles || [])].map(file => file.id))];
      const updated = await confirmAdditionalBankTransfer(applicationId, requestId, {
        ...(transaction.trim() ? { transaction_reference: transaction.trim() } : {}),
        ...(ids.length ? { evidence_file_ids: ids } : {}),
      });
      setPayment(updated);
      navigate(`${root}/processing`);
    });
  }

  const generating = busy && (step === 'required' || step === 'invoice');
  const amount = payment ? additionalPaymentAmount(payment.amount_pence) : ADDITIONAL_PAYMENT_COPY.amountUnavailable;
  const pending = payment?.status === 'NOT_PAID' && (cardOutcome !== undefined && cardOutcome !== 'FAILED' || step === 'result' && (!verified || cardOutcome !== 'FAILED'));
  const actionable = payment?.status === 'NOT_PAID' && verified && !pending && validAdditionalAmount(payment.amount_pence);
  const completed = payment?.status === 'PAID' || payment?.status === 'PROCESSING';
  const failed = !loading && verified && step === 'result' && payment?.status === 'NOT_PAID' && cardOutcome === 'FAILED';
  const groupedActions = !loading && !pending && payment?.status === 'NOT_PAID' && (step !== 'result' && step !== 'processing' || failed);

  return {
    applicationId, requestId, summary, root, step, payment, loading, busy, error,
    fileErrors, files, transaction, confirmed, upload, errorSummary,
    generating, amount, pending, actionable, completed, failed, groupedActions,
    setFileErrors, setTransaction, setConfirmed, addFiles,
    removeFile: (id: string) => setFiles(current => current.filter(file => file.id !== id)),
    retry: () => setRetry(value => value + 1),
    goTo: (nextStep: string) => navigate(`${root}/${nextStep}`),
    continueBankTransfer: () => confirmed ? navigate(`${root}/proof`) : setError(ADDITIONAL_PAYMENT_ERRORS.confirmation),
    invoice, card, bankTransfer,
  };
}

export type AdditionalPaymentFlow = ReturnType<typeof useAdditionalPayment>;