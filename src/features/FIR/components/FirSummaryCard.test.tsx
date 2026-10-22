import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FirSummaryCard } from './FirSummaryCard';
import { FurtherInformationRequestsPage } from '../pages/FurtherInformationRequestsPage';

const { auth, getRequests } = vi.hoisted(() => ({ auth: vi.fn(), getRequests: vi.fn() }));
vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: auth }));
vi.mock('../../../context/BreadcrumbContext', () => ({ useBreadcrumb: vi.fn() }));
vi.mock('../services', () => ({ getFurtherInformationRequests: getRequests, getFurtherInformationRequest: vi.fn() }));
vi.mock('../hooks', () => ({ useFirRoute: () => ({ applicationId: 'app-1', requestPath: '/nwl/app-1/further-information-requests' }) }));

describe.each(['summary', 'history'])('FIR %s permissions', (view) => {
  it.each(['SUPERUSER', 'APPLICANT_USER'])('keeps requests visible for %s with the correct response permission', async (role) => {
    auth.mockReturnValue({ user: { role } });
    getRequests.mockResolvedValue([{
      furtherInformationRequestId: 'request-1', status: 'OPEN', requestText: 'Please provide a plan',
      createdAt: '2026-10-01T12:00:00Z', deadlineAt: '2026-11-01T12:00:00Z',
    }]);
    render(
      <MemoryRouter>
        {view === 'summary'
          ? <FirSummaryCard applicationId="app-1" basePath="/nwl/app-1/further-information-requests" />
          : <FurtherInformationRequestsPage />}
      </MemoryRouter>,
    );
    expect(await screen.findByText('Please provide a plan')).toBeInTheDocument();
    if (role === 'SUPERUSER') {
      expect(screen.queryByRole('link', { name: 'Provide information' })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('link', { name: 'Provide information' })).toHaveAttribute('href', '/nwl/app-1/further-information-requests/request-1/respond');
    }
  });
});