import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAdditionalPayment } from './useAdditionalPayment';
import type { ApplicationDocument, UploadedFile } from '../../../types/fileUpload';
import { additionalPaymentView } from '../utils/additionalPaymentView';
import { getAdditionalEvidence } from '../../../services/additionalPaymentsService';
vi.mock('../../../services/additionalPaymentsService', async importOriginal => ({
  ...await importOriginal<typeof import('../../../services/additionalPaymentsService')>(),
  getAdditionalEvidence: vi.fn().mockResolvedValue({ uploadedFiles: [], applicationDocuments: [] }),
}));

vi.mock('../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => `/backend${path}` }));
vi.mock('../../../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test' }) }));

const payment = {
  request_id: 'request', application_id: 'app', description: 'Assessment', requested_at: '2026-10-01',
  amount_pence: 12345, status: 'NOT_PAID', items: [],
  invoice: { invoice_id: 'invoice', invoice_number: 'INV-1', download_url: '/invoice.pdf' },
};
const uploaded: UploadedFile = { id: 'proof', storageProvider: 'S3', s3Key: 'key', bucketName: 'bucket',
  virtualFolder: 'folder', filename: 'proof.pdf', fileContentType: 'application/pdf', fileSizeBytes: 3,
  uploadedAtTimestamp: '2026-10-01', scanStatus: 'COMPLETED', scanResult: 'CLEAN' };
const document: ApplicationDocument = { documentId: 'document', applicationId: 'app', fileId: uploaded.id,
  category: 'PAYMENT_PROOF', subCategory: 'request', addedBy: 'user', addedAt: '2026-10-01' };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => { resolve = complete; });
  return { promise, resolve };
}

function mount(path = '/s-37/app/additional-payments/request/proof') {
  return renderHook(() => ({ flow: useAdditionalPayment(), navigate: useNavigate() }), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/:formType/:applicationId/additional-payments/:requestId/*" element={children} />
    </Routes></MemoryRouter>,
  });
}

afterEach(() => {
  vi.unstubAllGlobals(); sessionStorage.clear();
  vi.mocked(getAdditionalEvidence).mockResolvedValue({ uploadedFiles: [], applicationDocuments: [] });
});

describe('additional payment orchestration', () => {
  it.each(['/s-37/app/additional-payments/request-2/proof', '/nwl/app-2/additional-payments/request/proof'])('resets request-local state and card verification when navigating to %s', async path => {
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () =>
      url.includes('payment-status')
        ? { status: 'NOT_PAID', ...(url.includes('/app/additional-payments/request/') ? { card_outcome: 'PENDING' } : {}) }
        : payment,
    }));
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.pending).toBe(true));
    act(() => {
      result.current.flow.setTransaction('OLD123');
      result.current.flow.setConfirmed(true);
      result.current.flow.setFileErrors(['Old evidence error']);
      result.current.flow.addFiles([{ id: 'old-evidence' } as UploadedFile]);
    });
    expect(result.current.flow.files).toHaveLength(1);
    act(() => { void result.current.navigate(path); });
    await waitFor(() => expect(result.current.flow.loading).toBe(false));
    expect(result.current.flow.pending).toBe(false);
    expect(result.current.flow.actionable).toBe(true);
    expect(result.current.flow.transaction).toBe('');
    expect(result.current.flow.confirmed).toBe(false);
    expect(result.current.flow.fileErrors).toEqual([]);
    expect(result.current.flow.files).toEqual([]);
    expect(result.current.flow.error).toBe('');
    expect(result.current.flow.summary).toBe(path.startsWith('/nwl/') ? '/nwl/app-2/application-summary' : '/s-37/app/application-summary');
  });

  it.each([false, true])('recovers card verification from the request session key, with query ID taking precedence: %s', async query => {
    sessionStorage.setItem('additional-payment:app:request', 'stored-payment');
    sessionStorage.setItem('additional-payment:app:other-request', 'wrong-payment');
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status')
      ? { status: 'PAID', payment_reference: 'PAY-1', card_outcome: 'SUCCEEDED' } : payment }));
    vi.stubGlobal('fetch', network);
    const { result } = mount(`/s-37/app/additional-payments/request/result${query ? '?payment_id=query-payment' : ''}`);
    await waitFor(() => expect(result.current.flow.completed).toBe(true));
    expect(result.current.flow.payment?.payment_reference).toBe('PAY-1');
    expect(network.mock.calls.some(([url]) => url.endsWith(`payment-status?payment_id=${query ? 'query-payment' : 'stored-payment'}`))).toBe(true);
    expect(network.mock.calls.some(([url]) => url.includes('wrong-payment'))).toBe(false);
  });

  it.each([true, false])('does not confirm BACS when evidence scanning is busy or upload fails (busy: %s)', async scanning => {
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID' } : payment }));
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    const triggerUpload = vi.fn().mockResolvedValue({ uploadedFiles: [], applicationDocuments: [], scanErrors: ['Evidence upload failed'] });
    result.current.flow.upload.current = { isBusy: () => scanning, getPendingFiles: () => [], triggerUpload };
    await act(async () => { await result.current.flow.bankTransfer(); });
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
    if (scanning) {
      expect(triggerUpload).not.toHaveBeenCalled();
      expect(result.current.flow.error).toContain('File scan is in progress');
    } else {
      expect(triggerUpload).toHaveBeenCalledOnce();
      expect(result.current.flow.fileErrors).toEqual(['Evidence upload failed']);
    }
    expect(result.current.flow.busy).toBe(false);
  });

  it('recovers authoritative request state and releases busy state after a failed mutation', async () => {
    let failed = false;
    const network = vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
      if (options.method === 'POST') { failed = true; throw new Error('Invoice service unavailable'); }
      return { ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID' } : { ...payment, status: failed ? 'WITHDRAWN' : 'NOT_PAID' } };
    });
    vi.stubGlobal('fetch', network);
    const { result } = mount('/s-37/app/additional-payments/request');
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    await act(async () => { await result.current.flow.invoice(); });
    expect(result.current.flow.payment?.status).toBe('WITHDRAWN');
    expect(result.current.flow.error).toBe('Invoice service unavailable');
    expect(result.current.flow.actionable).toBe(false);
    expect(result.current.flow.busy).toBe(false);
    expect(result.current.flow.generating).toBe(false);
  });

  it.each(['PAID', 'PROCESSING', 'WITHDRAWN'])('keeps authoritative %s state when the provider is unavailable', async status => {
    const network = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('payment-status')) throw new Error('Provider unavailable');
      return { ok: true, json: async () => ({ ...payment, status, payment_reference: 'receipt' }) };
    });
    vi.stubGlobal('fetch', network);
    const { result } = mount('/s-37/app/additional-payments/request/result?payment_id=card');
    await waitFor(() => expect(result.current.flow.loading).toBe(false));
    expect(result.current.flow.payment?.status).toBe(status);
    expect(result.current.flow.payment?.payment_reference).toBe('receipt');
    expect(result.current.flow.error).toBe('');
    expect(network.mock.calls.some(([url]) => url.includes('payment-status'))).toBe(false);
  });

  it.each(['payment-method', 'bank-transfer', 'proof'])('requires an invoice on a directly loaded %s route', async step => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...payment, invoice: undefined }) }));
    const { result } = mount(`/s-37/app/additional-payments/request/${step}`);
    await waitFor(() => expect(result.current.flow.loading).toBe(false));
    expect(additionalPaymentView(result.current.flow).view).toBe('invoice');
  });

  it('checks the freshly fetched invoice before starting a card payment', async () => {
    let reads = 0;
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () =>
      url.includes('payment-status') ? { status: 'NOT_PAID' } : { ...payment, invoice: ++reads > 1 ? undefined : payment.invoice } }));
    vi.stubGlobal('fetch', network);
    const { result } = mount('/s-37/app/additional-payments/request/payment-method');
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    await act(async () => { await result.current.flow.card(); });
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
    expect(result.current.flow.error).toBe('Generate an invoice for this additional payment before continuing.');
  });

  it('reports an unavailable upload component instead of confirming without selected evidence', async () => {
    const network = vi.fn().mockResolvedValue({ ok: true, json: async () => payment });
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    await act(async () => { await result.current.flow.bankTransfer(); });
    expect(result.current.flow.error).toContain('Evidence selection is unavailable');
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
  });

  it.each(['fetch', 'upload'])('does not continue BACS after route changes during %s', async stage => {
    const read = deferred<typeof payment>();
    const uploadResult = deferred<{ uploadedFiles: UploadedFile[]; applicationDocuments: ApplicationDocument[]; scanErrors: string[] }>();
    let holdFetch = false;
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true,
      json: async () => holdFetch && !url.includes('payment-status') && url.includes('/request/') ? read.promise : payment }));
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    const staleAddFiles = result.current.flow.addFiles;
    const triggerUpload = vi.fn().mockReturnValue(uploadResult.promise);
    result.current.flow.upload.current = { triggerUpload, isBusy: () => false, getPendingFiles: () => [] };
    holdFetch = stage === 'fetch';
    let operation!: Promise<void>;
    act(() => { operation = result.current.flow.bankTransfer(); });
    if (stage === 'upload') await waitFor(() => expect(triggerUpload).toHaveBeenCalledOnce());
    act(() => { void result.current.navigate('/s-37/app/additional-payments/other/proof'); });
    await waitFor(() => expect(result.current.flow.loading).toBe(false));
    await act(async () => {
      staleAddFiles([uploaded], [document]);
      read.resolve(payment);
      uploadResult.resolve({ uploadedFiles: [uploaded], applicationDocuments: [document], scanErrors: [] });
      await operation;
    });
    expect(result.current.flow.files).toEqual([]);
    expect(result.current.flow.root).toContain('/other');
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
    if (stage === 'fetch') expect(triggerUpload).not.toHaveBeenCalled();
  });

  it('restores persisted evidence and retains clean files plus associations after partial upload failure', async () => {
    vi.mocked(getAdditionalEvidence).mockResolvedValue({ uploadedFiles: [uploaded], applicationDocuments: [document] });
    const network = vi.fn().mockResolvedValue({ ok: true, json: async () => payment });
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.files).toEqual([uploaded]));
    expect(result.current.flow.documents).toEqual([document]);
    const second = { ...uploaded, id: 'second', filename: 'second.pdf' };
    const association = { ...document, fileId: second.id, documentId: 'doc-2' };
    result.current.flow.upload.current = { isBusy: () => false, getPendingFiles: () => [], triggerUpload: vi.fn().mockResolvedValue({
      uploadedFiles: [second], applicationDocuments: [association], scanErrors: ['One file failed'],
    }) };
    await act(async () => { await result.current.flow.bankTransfer(); });
    expect(result.current.flow.files).toEqual([uploaded, second]);
    expect(result.current.flow.documents).toEqual([document, association]);
    expect(result.current.flow.fileErrors).toEqual(['One file failed']);
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
  });

  it('retains clean evidence after confirmation failure, prevents double-submit and sends it on retry', async () => {
    const posted = deferred<Response>();
    const network = vi.fn().mockImplementation(async (_url: string, options: RequestInit) =>
      options.method === 'POST' ? posted.promise : { ok: true, json: async () => payment });
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    const triggerUpload = vi.fn().mockResolvedValue({ uploadedFiles: [uploaded], applicationDocuments: [document], scanErrors: [] });
    result.current.flow.upload.current = { isBusy: () => false, getPendingFiles: () => [], triggerUpload };
    let operation!: Promise<void>;
    act(() => { operation = result.current.flow.bankTransfer(); void result.current.flow.bankTransfer(); });
    await waitFor(() => expect(network.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1));
    await act(async () => {
      posted.resolve(new Response(JSON.stringify({ message: 'Temporary outage' }), { status: 503 }));
      await operation;
    });
    expect(triggerUpload).toHaveBeenCalledOnce();
    expect(result.current.flow.files).toEqual([uploaded]);
    expect(result.current.flow.documents).toEqual([document]);
    triggerUpload.mockResolvedValue({ uploadedFiles: [], applicationDocuments: [], scanErrors: [] });
    await act(async () => { await result.current.flow.bankTransfer(); });
    const posts = network.mock.calls.filter(([, options]) => options.method === 'POST');
    expect(JSON.parse(posts[1][1].body as string)).toEqual({ evidence_file_ids: ['proof'] });
  });

  it('locks bank-transfer confirmation while evidence removal is in progress', async () => {
    const deletion = deferred<Response>();
    const network = vi.fn().mockImplementation(async (_url: string, options: RequestInit) =>
      options.method === 'DELETE' ? deletion.promise : { ok: true, json: async () => payment });
    vi.stubGlobal('fetch', network);
    const { result } = mount();
    await waitFor(() => expect(result.current.flow.actionable).toBe(true));
    act(() => result.current.flow.addFiles([uploaded], [document]));
    let removing!: Promise<void>;
    act(() => { removing = result.current.flow.removeFile(uploaded.id); });
    await waitFor(() => expect(network.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(true));
    expect(result.current.flow.busy).toBe(true);

    await act(async () => { await result.current.flow.bankTransfer(); });
    expect(network.mock.calls.some(([, options]) => options.method === 'POST')).toBe(false);
    expect(result.current.flow.files).toEqual([uploaded]);

    await act(async () => {
      deletion.resolve(new Response(JSON.stringify({ removed: true }), { status: 200 }));
      await removing;
    });
    expect(result.current.flow.files).toEqual([]);
    expect(result.current.flow.busy).toBe(false);
  });
});