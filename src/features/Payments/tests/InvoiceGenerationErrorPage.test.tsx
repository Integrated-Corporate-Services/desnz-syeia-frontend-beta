import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvoiceGenerationErrorPage from '../pages/InvoiceGenerationErrorPage';

const navigateMock = vi.fn();
const mockUseLocationState: { pathname: string; state: Record<string, unknown> } = {
  pathname: '/s-37/APP123/generate-invoice-error',
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

describe('InvoiceGenerationErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocationState.pathname = '/s-37/APP123/generate-invoice-error';
    mockUseLocationState.state = {};
  });

  it('always renders the design copy and only one return button', () => {
    mockUseLocationState.state = {
      errorCode: 'NETWORK_LOST',
      errorMessage:
        'Your network connection was lost while we were generating your invoice. Reconnect and try again.',
      consentFee: 100,
      screeningFee: 20,
      eiaFee: 3,
      totalAmount: 123,
      breakdown: { consent: 100, screening: 20, eia: 3 },
    };

    render(<InvoiceGenerationErrorPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Sorry, there is a problem with the service',
      })
    ).toBeInTheDocument();

    expect(screen.getByText('You can return to the application and try again later.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry invoice generation' })).not.toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Return to application');
  });

  it('returns to the correct task list and preserves location state', () => {
    const preservedState = {
      errorCode: 'INVOICE_GENERATION_TIMEOUT',
      errorMessage: 'Invoice generation took longer than expected. Return to your application and try again.',
      consentFee: 90,
      screeningFee: 5,
      eiaFee: 5,
      totalAmount: 100,
      breakdown: { consent: 90, screening: 5, eia: 5 },
    };

    mockUseLocationState.state = preservedState;

    render(<InvoiceGenerationErrorPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Return to application' }));

    expect(navigateMock).toHaveBeenCalledWith('/s-37/APP123/task-list', {
      state: preservedState,
      replace: true,
    });
  });

  it('uses NWL task list route when on NWL path', () => {
    mockUseLocationState.pathname = '/nwl/APP123/generate-invoice-error';

    render(<InvoiceGenerationErrorPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Return to application' }));

    expect(navigateMock).toHaveBeenCalledWith('/nwl/APP123/task-list', {
      state: {},
      replace: true,
    });
  });
});