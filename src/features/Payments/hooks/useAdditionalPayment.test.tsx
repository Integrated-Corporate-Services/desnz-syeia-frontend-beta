import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAdditionalPayment } from './useAdditionalPayment';
import type { UploadedFile } from '../../../types/fileUpload';

vi.mock('../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => `/backend${path}` }));
vi.mock('../../../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test' }) }));

const payment = {
  request_id: 'request', application_id: 'app', description: 'Assessment', requested_at: '2026-10-01',
  amount_pence: 12345, status: 'NOT_PAID', items: [],
  invoice: { invoice_id: 'invoice', invoice_number: 'INV-1', download_url: '/invoice.pdf' },
};

function mount(path = '/s-37/app/additional-payments/request/proof') {
  return renderHook(() => ({ flow: useAdditionalPayment(), navigate: useNavigate() }), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/:formType/:applicationId/additional-payments/:requestId/*" element={children} />
    </Routes></MemoryRouter>,
  });
}

afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

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
});