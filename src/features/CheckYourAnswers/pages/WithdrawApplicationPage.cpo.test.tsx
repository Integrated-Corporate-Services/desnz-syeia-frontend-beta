import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { applicationApiService } from '../../../services/applicationApiService';
import WithdrawApplicationPage from './WithdrawApplicationPage';

vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: vi.fn(), withdrawApplication: vi.fn() } }));

const renderPage = () => render(<BreadcrumbProvider><MemoryRouter initialEntries={['/cpo/app/withdraw']}><Routes>
  <Route path="/cpo/:applicationId/withdraw" element={<WithdrawApplicationPage />} />
  <Route path="/cpo/:applicationId/withdrawal-confirmation" element={<h1>CPO withdrawal confirmation</h1>} />
</Routes></MemoryRouter></BreadcrumbProvider>);

describe('Withdraw a CPO application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', desnz_ref: 'CPO000001' });
    vi.mocked(applicationApiService.withdrawApplication).mockResolvedValue({ success: true });
  });

  it('shows the CPO reference and case type without an S37 placeholder', async () => {
    renderPage();
    expect(await screen.findByText('CPO000001: Compulsory purchase order (CPO)')).toBeInTheDocument();
    expect(screen.queryByText(/S3700245/)).not.toBeInTheDocument();
  });

  it('sends the request without the NWL voluntary agreement question and stays under /cpo', async () => {
    renderPage();
    await screen.findByText('CPO000001: Compulsory purchase order (CPO)');
    expect(screen.queryByRole('group', { name: /voluntary/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));
    expect(await screen.findByRole('heading', { name: 'CPO withdrawal confirmation' })).toBeInTheDocument();
    expect(applicationApiService.withdrawApplication).toHaveBeenCalledWith('app', false, undefined);
  });
});
