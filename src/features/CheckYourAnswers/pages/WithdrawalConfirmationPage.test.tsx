import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WithdrawalConfirmationPage from './WithdrawalConfirmationPage';

vi.mock('../../../components/PageTitle', () => ({ default: () => null }));

const renderPage = (path: string, route: string, state?: { formType: string }) => render(
  <MemoryRouter initialEntries={[{ pathname: path, state }]}><Routes>
    <Route path={route} element={<WithdrawalConfirmationPage />} />
  </Routes></MemoryRouter>,
);

describe('Withdrawal request submitted contact email', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  it('shows the CPO team email for a CPO application', () => {
    renderPage('/cpo/app/withdrawal-confirmation', '/cpo/:applicationId/withdrawal-confirmation');
    expect(screen.getByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' })).toHaveAttribute('href', 'mailto:compulsorypurchaseorders@energysecurity.gov.uk');
    expect(screen.queryByText('S37consents@energysecurity.gov.uk')).not.toBeInTheDocument();
  });

  it.each([
    ['S37', undefined],
    ['NWL', { formType: 'NWL' }],
  ])('keeps the S37 consents email for %s', (_type, state) => {
    renderPage('/s37/app/withdrawal-confirmation', '/s37/:applicationId/withdrawal-confirmation', state);
    expect(screen.getByRole('link', { name: 'S37consents@energysecurity.gov.uk' })).toHaveAttribute('href', 'mailto:S37consents@energysecurity.gov.uk');
  });
});