import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdditionalPaymentPage from './AdditionalPaymentPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import MainLayout from '../../../layouts/MainLayout';
import type { FileUploadHandle, FileUploadProps } from '../../../components/FileUpload';

vi.mock('../../../layouts/component/Header', () => ({ default: () => null }));
vi.mock('../../../layouts/component/ServiceNavigation', () => ({ default: () => null }));
vi.mock('../../../layouts/component/PhaseBanner', () => ({ default: () => null }));
vi.mock('../../../layouts/component/Footer', () => ({ default: () => null }));
vi.mock('../../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => `/backend${path}` }));
vi.mock('../../../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test' }) }));
vi.mock('../../../components/FileUpload', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return { default: forwardRef<FileUploadHandle, FileUploadProps>(function MockUpload(_props, ref) {
    useImperativeHandle(ref, () => ({ isBusy: () => false, getPendingFiles: () => [], triggerUpload: async () => ({ uploadedFiles: [], applicationDocuments: [], scanErrors: [] }) }));
    return <div data-testid="evidence-upload" data-prefix={_props.prefix} data-endpoints={JSON.stringify(_props.uploadEndpoints)}>Evidence upload</div>;
  }) };
});
const request = { request_id: 'request', application_id: 'app', description: 'Additional assessment', requested_at: '2026-10-01', amount_pence: 12345, status: 'NOT_PAID', items: [{ description: 'Assessment', amount_pence: 12345 }], invoice: { invoice_id: 'inv', invoice_number: 'INV-002', download_url: '/invoice.pdf' } };
function mount(step = '', form = 's-37', withLayout = false) {
  const page = withLayout ? <MainLayout><AdditionalPaymentPage /></MainLayout> : <AdditionalPaymentPage />;
  return render(<HelmetProvider><MemoryRouter initialEntries={[`/${form}/app/additional-payments/request${step}`]}><BreadcrumbProvider><Routes><Route path="/:formType/:applicationId/additional-payments/:requestId/*" element={page} /></Routes></BreadcrumbProvider></MemoryRouter></HelmetProvider>);
}
afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); });

describe('additional payment pages', () => {
  it('does not retry a successful card attempt while the request is still unpaid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID', card_outcome: 'SUCCEEDED' } : request })));
    mount('/payment-method');
    expect(await screen.findByRole('button', { name: 'Check payment status' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay by card' })).not.toBeInTheDocument();
  });
  it('allows a BACS confirmation after a pending attempt is confirmed failed', async () => {
    let outcome = 'PENDING';
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID', card_outcome: outcome } : url.endsWith('/bank-transfer') ? { ...request, status: 'PROCESSING', payment_method: 'BACS' } : request }));
    vi.stubGlobal('fetch', network);
    mount('/proof');
    const check = await screen.findByRole('button', { name: 'Check payment status' });
    outcome = 'FAILED';
    fireEvent.click(check);
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm payment' }));
    await waitFor(() => expect(network.mock.calls.some(([url, options]) => url.endsWith('/bank-transfer') && options.method === 'POST')).toBe(true));
    expect(network.mock.calls.filter(([url]) => url.includes('payment-status'))).toHaveLength(3);
  });
  it.each(['/payment-method', '/proof', '/invoice', ''])('checks pending attempts on reentry at %s until failure is confirmed', async step => {
    let outcome = 'PENDING';
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID', card_outcome: outcome } : request }));
    vi.stubGlobal('fetch', network);
    mount(step);
    expect(await screen.findByRole('button', { name: 'Check payment status' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pay by card|Confirm payment|Generate invoice|Continue to payment/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay by bank transfer' })).not.toBeInTheDocument();
    outcome = 'FAILED';
    fireEvent.click(screen.getByRole('button', { name: 'Check payment status' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Check payment status' })).not.toBeInTheDocument());
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
  });
  it.each([['/payment-method', 'Pay by card'], ['/proof', 'Confirm payment'], ['', 'Generate invoice']])('rechecks the current attempt before %s mutations', async (step, action) => {
    let pending = false;
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID', ...(pending ? { card_outcome: 'PENDING' } : {}) } : request }));
    vi.stubGlobal('fetch', network);
    mount(step);
    const button = await screen.findByRole('button', { name: action });
    pending = true;
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'Check payment status' })).toBeInTheDocument();
    expect(network.mock.calls.filter(([url]) => url.includes('payment-status'))).toHaveLength(2);
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
  });
  it('offers a fresh card attempt only after the provider confirms terminal failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'NOT_PAID', card_outcome: 'FAILED' } : request })));
    mount('/result?payment_id=declined-payment');
    expect(await screen.findByRole('heading', { name: 'The payment was unsuccessful' })).toBeInTheDocument();
    expect(screen.getByText('No money has been taken from your account.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pay by card' })).toBeEnabled();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /application summary/i })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'The payment was unsuccessful' }).closest('.govuk-notification-banner')).not.toBeNull();
  });
  it.each(['', '/invoice'])('hides breadcrumb context in MainLayout while generating an invoice at %s', async step => {
    let finishInvoice!: (response: unknown) => void;
    const pendingInvoice = new Promise(resolve => { finishInvoice = resolve; });
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (_url: string, options: RequestInit) => options.method === 'POST' ? pendingInvoice : { ok: true, json: async () => ({ ...request, ...(step === '/invoice' ? { invoice: undefined } : {}) }) }));
    mount(step, 's-37', true);
    const generate = await screen.findByRole('button', { name: 'Generate invoice' });
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Applications' })).toBeInTheDocument();
    fireEvent.click(generate);
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Generating invoice...');
    expect(status.querySelector('.hods-loading-spinner__spinner')).not.toBeNull();
    expect(screen.queryByRole('link', { name: /application summary/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Applications' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    finishInvoice({ ok: true, json: async () => request.invoice });
    expect(await screen.findByRole('heading', { name: 'Your invoice' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to application summary' })).toBeInTheDocument();
  });
  it('does not describe an ambiguous unpaid provider result as a failed payment', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => request }));
    mount('/result?payment_id=pending-payment');
    expect(await screen.findByRole('button', { name: 'Check payment status' })).toBeInTheDocument();
    expect(screen.queryByText('No money has been taken from your account.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay by card' })).not.toBeInTheDocument();
  });
  it('scopes evidence uploads to the request-specific backend endpoints and prefix', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => request }));
    mount('/proof');
    const uploader = await screen.findByTestId('evidence-upload');
    expect(uploader).toHaveAttribute('data-prefix', 'app/ADDITIONAL_PAYMENTS/request');
    expect(JSON.parse(uploader.getAttribute('data-endpoints') || '{}')).toEqual({
      presignedUrl: '/api/applications/app/additional-payments/request/evidence/presigned-url',
      confirm: '/api/applications/app/additional-payments/request/evidence/confirm',
    });
  });
  it('loads the requested amount and items directly from the backend', async () => {
    const network = vi.fn().mockResolvedValue({ ok: true, json: async () => request });
    vi.stubGlobal('fetch', network);
    mount();
    expect(await screen.findByText('Assessment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate invoice' })).toBeEnabled();
    expect(screen.getAllByRole('link', { name: 'Back to application summary' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Generate invoice' }).parentElement).toBe(screen.getByRole('link', { name: 'Back to application summary' }).parentElement);
    expect(network).toHaveBeenCalledTimes(2);
    expect(network.mock.calls[0][0]).not.toContain('/fees');
  });
  it('blocks an unavailable amount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...request, amount_pence: null }) }));
    mount();
    expect(await screen.findByRole('button', { name: 'Generate invoice' })).toBeDisabled();
  });
  it('rehydrates an existing invoice after refresh for NWL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => request }));
    mount('/invoice', 'nwl');
    expect(await screen.findByText('INV-002')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to application summary' })).toHaveAttribute('href', '/nwl/app/application-summary');
  });
  it('verifies card results with the server instead of trusting query status', async () => {
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('payment-status') ? { status: 'PAID', payment_reference: 'PAY-123' } : request }));
    vi.stubGlobal('fetch', network);
    mount('/result?payment_id=payment-1&status=failed');
    expect(await screen.findByRole('heading', { name: 'Payment received' })).toBeInTheDocument();
    expect(screen.getByText('PAY-123')).toBeInTheDocument();
    expect(network.mock.calls.some(([url]) => url.endsWith('/request/payment-status?payment_id=payment-1'))).toBe(true);
  });
  it('does not show a retry payment button when verification fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => url.includes('payment-status') ? { ok: false, status: 503, json: async () => ({ message: 'Payment provider unavailable' }) } : { ok: true, json: async () => request }));
    mount('/result');
    expect(await screen.findByText('Payment provider unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay by card' })).not.toBeInTheDocument();
  });
  it('accepts bank transfer with no transaction or evidence and never submits the application', async () => {
    const network = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.endsWith('/bank-transfer') ? { ...request, status: 'PROCESSING' } : request }));
    vi.stubGlobal('fetch', network);
    mount('/proof');
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm payment' }));
    await waitFor(() => expect(network.mock.calls.find(([url]) => url.endsWith('/bank-transfer'))).toBeDefined());
    const post = network.mock.calls.find(([url]) => url.endsWith('/bank-transfer'));
    expect(post?.[1].body).toBe('{}');
    expect(network.mock.calls.every(([url]) => url.includes('/additional-payments/'))).toBe(true);
  });
  it('refetches stale withdrawals before creating an invoice and removes payment actions', async () => {
    const network = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => request }).mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'NOT_PAID' }) }).mockResolvedValue({ ok: true, json: async () => ({ ...request, status: 'WITHDRAWN' }) });
    vi.stubGlobal('fetch', network);
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Generate invoice' }));
    expect(await screen.findByRole('heading', { name: 'Request withdrawn' })).toBeInTheDocument();
    expect(network.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Generate invoice' })).not.toBeInTheDocument();
  });
});