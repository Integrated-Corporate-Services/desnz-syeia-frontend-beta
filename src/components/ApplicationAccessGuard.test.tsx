import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApplicationAccessGuard from './ApplicationAccessGuard';
import ProtectedRoute from './ProtectedRoute';
import { applicationApiService } from '../services/applicationApiService';
import type { Application } from '../types/application';

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: auth }));
vi.mock('../services/applicationApiService', () => ({
  applicationApiService: { getApplicationById: vi.fn() },
}));

function renderApplication(path: string) {
  const form = vi.fn(() => <div>Application page</div>);
  const Form = form;
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:type/:applicationId/:page/*" element={
          <ApplicationAccessGuard><Form /></ApplicationAccessGuard>
        } />
        <Route path="/:type/:applicationId/application-summary" element={
          <ApplicationAccessGuard><div>Read-only summary</div></ApplicationAccessGuard>
        } />
      </Routes>
    </MemoryRouter>,
  );
  return form;
}

describe('Superuser applicant route permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockReturnValue({ user: { role: 'SUPERUSER' }, authenticated: true, loading: false });
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ status: 'DRAFT' } as Application);
  });

  it.each(['s-37', 'nwl', 'S-37', 'NWL'])('prevents direct %s draft edit URLs from mounting forms', async (type) => {
    const form = renderApplication(`/${type}/app-1/applicant-details`);
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each(['delete-confirmation', 'check-your-answers', 'pay-and-submit', 'withdraw', 'further-information-requests/request-1/respond'])('blocks submitted applicant mutation page %s', async (page) => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ status: 'SUBMITTED' } as Application);
    const form = renderApplication(`/s-37/app-1/${page}`);
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each(['s-37', 'nwl'])('allows a Superuser to view the %s summary', async (type) => {
    renderApplication(`/${type}/app-1/application-summary`);
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
  });

  it.each(['task-list', 'reassign', 'reassignment-history', 'further-information-requests'])('preserves Superuser access to %s', async (page) => {
    renderApplication(`/nwl/app-1/${page}`);
    expect(await screen.findByText('Application page')).toBeInTheDocument();
  });

  it('preserves ordinary applicant draft editing', async () => {
    auth.mockReturnValue({ user: { role: 'APPLICANT_USER' } });
    renderApplication('/s-37/app-1/project-overview');
    expect(await screen.findByText('Application page')).toBeInTheDocument();
  });

  it.each([
    ['SUPERUSER', '/your-details/change-full-name'],
    ['SUPERUSER', '/admin/user-management'],
    ['SUPERUSER', '/admin/organisation/org-1/settings'],
    ['APPLICANT_USER', '/choose-application'],
    ['APPLICANT_USER', '/nwl/who-is-applying'],
    ['APPLICANT_USER', '/s-37/who-is-applying'],
  ])('preserves %s access to %s', async (role, path) => {
    auth.mockReturnValue({ user: { role }, authenticated: true, loading: false });
    render(
      <MemoryRouter initialEntries={[path]}>
        <ProtectedRoute><div>Allowed page</div></ProtectedRoute>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Allowed page')).toBeInTheDocument();
  });

  it.each(['/choose-application', '/s-37/who-is-applying', '/nwl/who-is-applying', '/CHOOSE-APPLICATION', '/S-37/WHO-IS-APPLYING', '/nwl/who-is-applying//'])('prevents Superuser creation through %s', async (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={<ProtectedRoute><div>Create application</div></ProtectedRoute>} />
          <Route path="/application-dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Create application')).not.toBeInTheDocument();
  });
});