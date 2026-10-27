import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdditionalPaymentReceipt } from './AdditionalPaymentReceipt';
import type { AdditionalPaymentRequest } from '../../services/additionalPaymentsService';

const payment: AdditionalPaymentRequest = {
  request_id: 'request', application_id: 'app', description: 'Assessment',
  requested_at: '2026-10-01', amount_pence: 12345, status: 'PAID', items: [],
  payment_reference: 'CARD123', transaction_reference: 'BANK123',
};

describe('additional payment receipt', () => {
  it.each(['PROCESSING', 'PAID'] as const)('retains the BACS transaction reference when %s', status => {
    render(<AdditionalPaymentReceipt payment={{ ...payment, payment_method: 'BACS', status }} />);
    expect(screen.getByText('Transaction number')).toBeInTheDocument();
    expect(screen.getByText('BANK123')).toBeInTheDocument();
    expect(screen.queryByText('CARD123')).not.toBeInTheDocument();
  });

  it('shows the card reference for card payments', () => {
    render(<AdditionalPaymentReceipt payment={{ ...payment, payment_method: 'CARD' }} />);
    expect(screen.getByText('Reference number')).toBeInTheDocument();
    expect(screen.getByText('CARD123')).toBeInTheDocument();
    expect(screen.queryByText('BANK123')).not.toBeInTheDocument();
  });

  it('shows the fallback for a BACS payment without a transaction reference', () => {
    render(<AdditionalPaymentReceipt payment={{ ...payment, payment_method: 'BACS', transaction_reference: null }} />);
    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(screen.queryByText('CARD123')).not.toBeInTheDocument();
  });
});