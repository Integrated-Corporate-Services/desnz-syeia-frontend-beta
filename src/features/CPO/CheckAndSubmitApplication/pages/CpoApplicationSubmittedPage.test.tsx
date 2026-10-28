import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../../services/applicationApiService';
import CpoApplicationSubmittedPage from './CpoApplicationSubmittedPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: vi.fn() } }));

const renderPage = () => render(<MemoryRouter initialEntries={['/cpo/app/application-submitted']}><Routes>
  <Route path="/cpo/:applicationId/application-submitted" element={<CpoApplicationSubmittedPage />} />
</Routes></MemoryRouter>);

describe('CPO application submitted', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirms the submission with the DESNZ reference', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', desnz_ref: 'CPO000001' });
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Application submitted' })).toBeInTheDocument();
    expect(await screen.findByText('CPO000001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to your applications' })).toHaveAttribute('href', '/application-dashboard');
  });

  it('still confirms the submission when the reference cannot be loaded', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('offline'));
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Application submitted' })).toBeInTheDocument();
    expect(screen.queryByText('Your reference number')).not.toBeInTheDocument();
  });
});
