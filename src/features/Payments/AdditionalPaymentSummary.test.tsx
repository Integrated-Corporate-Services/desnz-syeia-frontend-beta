import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdditionalPaymentSummary } from './AdditionalPaymentSummary';

vi.mock('../../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => `/backend${path}` }));
afterEach(() => vi.unstubAllGlobals());
describe('additional payment summary', () => {
  it('renders independent requests, statuses and only unpaid payment links', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ requests: ['NOT_PAID', 'WITHDRAWN', 'PROCESSING', 'PAID'].map((status, index) => ({ request_id: String(index), application_id: 'app', description: `Request ${index}`, requested_at: '2026-10-01', amount_pence: 12345, status, items: [] })) }) }));
    render(<MemoryRouter><AdditionalPaymentSummary applicationId="app" baseUrl="/nwl" /></MemoryRouter>);
    expect(await screen.findByText('Request withdrawn')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Additional payment request' })).toHaveLength(4);
    expect(screen.getAllByRole('link', { name: 'Make additional payment' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Make additional payment' })).toHaveAttribute('href', '/nwl/app/additional-payments/0');
    expect(screen.getByText('Processing additional payment')).toBeInTheDocument();
  });
  it('does not hide non-404 API failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    render(<MemoryRouter><AdditionalPaymentSummary applicationId="app" baseUrl="/s-37" /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded'));
  });
});