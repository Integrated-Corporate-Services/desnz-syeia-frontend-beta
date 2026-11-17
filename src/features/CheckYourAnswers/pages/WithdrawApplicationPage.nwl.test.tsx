import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { applicationApiService } from '../../../services/applicationApiService';
import WithdrawApplicationPage from './WithdrawApplicationPage';

vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: vi.fn(), withdrawApplication: vi.fn() } }));

const renderPage = (state?: { desnzRef: string; formType: string }) => render(<BreadcrumbProvider><MemoryRouter initialEntries={[{ pathname: '/nwl/app/withdraw', state }]}><Routes>
  <Route path="/nwl/:applicationId/withdraw" element={<WithdrawApplicationPage />} />
  <Route path="/nwl/:applicationId/withdrawal-confirmation" element={<h1>NWL withdrawal confirmation</h1>} />
  <Route path="/s-37/:applicationId/withdrawal-confirmation" element={<h1>S37 withdrawal confirmation</h1>} />
</Routes></MemoryRouter></BreadcrumbProvider>);

const withdrawAsNwl = async () => {
  expect(await screen.findByText('Have you reached a voluntary agreement with the landowner or occupier?')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Yes'));
  fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));
  expect(await screen.findByRole('heading', { name: 'NWL withdrawal confirmation' })).toBeInTheDocument();
  expect(applicationApiService.withdrawApplication).toHaveBeenCalledWith('app', true, undefined);
};

describe('Withdraw an NWL application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    vi.mocked(applicationApiService.withdrawApplication).mockResolvedValue({ success: true });
  });

  it('asks the voluntary agreement question and stays under /nwl once the application loads', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'NWL', desnz_ref: 'NWL00001' });
    renderPage();
    await withdrawAsNwl();
  });

  it('treats the application as NWL from the URL when there is no state and the lookup fails', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('Failed'));
    renderPage();
    await withdrawAsNwl();
  });

  it('uses the state from the summary page when the lookup fails', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('Failed'));
    renderPage({ desnzRef: 'NWL00001', formType: 'NWL' });
    expect(await screen.findByText(/^NWL00001:/)).toBeInTheDocument();
    await withdrawAsNwl();
  });
});
