import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvoiceGenerationPage from './InvoiceGenerationPage';

const navigateMock = vi.fn();
const mockUseLocationState: { pathname: string; state: Record<string, unknown> } = {
  pathname: '/s-37/APP123/generate-invoice',
  state: {},
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => mockUseLocationState,
  };
});

vi.mock('../../../hooks/useGetApplicationId', () => ({
  useGetApplicationId: () => 'APP123',
}));

vi.mock('../../../hooks/useAuthUser', () => ({
  useAuthUser: () => ({
    user: {
      full_name: 'Test User',
      email: 'test@example.com',
    },
  }),
}));

describe('InvoiceGenerationPage regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocationState.pathname = '/s-37/APP123/generate-invoice';
    mockUseLocationState.state = {};

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });

    vi.stubGlobal('fetch', vi.fn());
  });

  it('uses fallback fee calculation and navigates with resolved non-zero total on refresh', async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith('/api/invoice/APP123/calculate-fees')) {
        return {
          ok: true,
          json: async () => ({
            consentFee: 100,
            screeningFee: 20,
            eiaFee: 3,
            totalAmount: 123,
            breakdown: { consent: 100, screening: 20, eia: 3 },
          }),
        } as Response;
      }

      if (url.endsWith('/api/invoice/APP123/generate') && init?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            invoiceNumber: 'INV-001',
            s3Key: 'invoices/INV-001.pdf',
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    render(<InvoiceGenerationPage />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/s-37/APP123/invoice-download', {
        state: {
          invoiceNumber: 'INV-001',
          s3Key: 'invoices/INV-001.pdf',
          consentFee: 100,
          screeningFee: 20,
          eiaFee: 3,
          totalAmount: 123,
        },
      });
    });

    const generateRequestCall = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith('/api/invoice/APP123/generate')
    );

    expect(generateRequestCall).toBeTruthy();
    const body = (generateRequestCall?.[1] as RequestInit).body as string;
    expect(JSON.parse(body)).toMatchObject({
      consentFee: 100,
      screeningFee: 20,
      eiaFee: 3,
      totalAmount: 123,
    });
  });

  it('when generation guard exists and invoice already exists, redirects to invoice download instead of error', async () => {
    const fetchMock = vi.mocked(fetch);

    mockUseLocationState.state = {
      consentFee: 90,
      screeningFee: 5,
      eiaFee: 5,
      totalAmount: 100,
    };

    sessionStorage.setItem('invoice_generation_in_progress_APP123', Date.now().toString());

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/api/invoice/APP123/status')) {
        return {
          ok: true,
          json: async () => ({
            invoiceExists: true,
            invoiceNumber: 'INV-EXISTING',
            s3Key: 'invoices/INV-EXISTING.pdf',
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    render(<InvoiceGenerationPage />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/s-37/APP123/invoice-download', {
        state: {
          invoiceNumber: 'INV-EXISTING',
          s3Key: 'invoices/INV-EXISTING.pdf',
          consentFee: 90,
          screeningFee: 5,
          eiaFee: 5,
          totalAmount: 100,
        },
        replace: true,
      });
    });

    expect(
      navigateMock.mock.calls.some(([path]) => String(path).includes('/generate-invoice-error'))
    ).toBe(false);

    expect(
      fetchMock.mock.calls.some(([url]) => String(url).endsWith('/api/invoice/APP123/generate'))
    ).toBe(false);
  });
});
