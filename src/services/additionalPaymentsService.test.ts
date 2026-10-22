import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmAdditionalBankTransfer, downloadAdditionalInvoice, getAdditionalPayment, trustedCardUrl, validAdditionalAmount, verifyAdditionalPayment } from './additionalPaymentsService';

vi.mock('../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => `/backend${path}` }));
vi.mock('../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test' }) }));
afterEach(() => vi.unstubAllGlobals());

describe('additional payment API contract', () => {
  it('downloads invoice PDFs using the configured API base and session credentials', async () => {
    const pdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    const network = vi.fn().mockResolvedValue({ ok: true, blob: async () => pdf });
    vi.stubGlobal('fetch', network);
    expect(await downloadAdditionalInvoice('app', 'request')).toBe(pdf);
    expect(network).toHaveBeenCalledWith('/backend/api/applications/app/additional-payments/request/invoice/download', { credentials: 'include' });
  });
  it('reports invoice authentication failures rather than downloading an error document', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(downloadAdditionalInvoice('app', 'request')).rejects.toThrow('We could not download your invoice');
  });
  it('uses the backend base once and includes session credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ request_id: 'request' }) });
    vi.stubGlobal('fetch', fetchMock);
    await getAdditionalPayment('app', 'request');
    expect(fetchMock).toHaveBeenCalledWith('/backend/api/applications/app/additional-payments/request', expect.objectContaining({ credentials: 'include', method: 'GET' }));
  });
  it('accepts bank transfer without evidence or a transaction number', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'PROCESSING' }) });
    vi.stubGlobal('fetch', fetchMock);
    await confirmAdditionalBankTransfer('app', 'request', {});
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/request/bank-transfer'), expect.objectContaining({ method: 'POST', body: '{}', headers: expect.objectContaining({ 'X-CSRF-Token': 'test' }) }));
  });
  it('verifies the provider state on the request-specific endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'PAID' }) });
    vi.stubGlobal('fetch', fetchMock);
    await verifyAdditionalPayment('app', 'request', 'pay/id');
    expect(fetchMock.mock.calls[0][0]).toContain('/request/payment-status?payment_id=pay%2Fid');
  });
  it('preserves withdrawal errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ message: 'Request withdrawn' }) }));
    await expect(confirmAdditionalBankTransfer('app', 'request', {})).rejects.toMatchObject({ message: 'Request withdrawn', status: 409 });
  });
  it('blocks missing and invalid amounts and untrusted redirects', () => {
    for (const amount of [undefined, NaN, 0, -1, 1.5]) expect(validAdditionalAmount(amount as number)).toBe(false);
    expect(validAdditionalAmount(12345)).toBe(true);
    expect(trustedCardUrl('https://www.payments.service.gov.uk/secure/test')).toContain('/secure/test');
    for (const url of ['https://evil.example', 'javascript:alert(1)', 'https://payments.service.gov.uk.evil.example', 'http://www.payments.service.gov.uk']) expect(() => trustedCardUrl(url)).toThrow();
  });
});