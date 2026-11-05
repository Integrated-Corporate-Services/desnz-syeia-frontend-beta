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
  <Route path="/cpo/:applicationId/check-and-submit" element={<h1>Check your answers</h1>} />
</Routes></MemoryRouter>);

describe('CPO application submitted', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirms the submission with the DESNZ reference', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'SUBMITTED', desnz_ref: 'CPO000001' });
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Application submitted' })).toBeInTheDocument();
    expect(screen.getByText('CPO000001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View your application' })).toHaveAttribute('href', '/cpo/app/application-summary');
    expect(screen.getByRole('link', { name: 'Go to your applications' })).toHaveAttribute('href', '/application-dashboard');
  });

  it('sends a draft back to check your answers', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', status: 'DRAFT', desnz_ref: 'CPO000001' });
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Check your answers' })).toBeInTheDocument();
    expect(screen.queryByText('Application submitted')).not.toBeInTheDocument();
  });

  it('does not confirm the submission when the application cannot be loaded', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('offline'));
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Check your answers' })).toBeInTheDocument();
    expect(screen.queryByText('Application submitted')).not.toBeInTheDocument();
  });
});
