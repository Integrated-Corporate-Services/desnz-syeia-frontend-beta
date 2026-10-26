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

function renderApplication(type: string, page: string) {
  const form = vi.fn(() => <div>Application page</div>);
  const Form = form;
  const summary = type.toLowerCase() === 'cpo' ? 'task-list' : 'application-summary';
  render(
    <MemoryRouter initialEntries={[`/${type}/app-1/${page}`]}>
      <Routes>
        <Route path="/:type/:applicationId/:page/*" element={
          <ApplicationAccessGuard><Form /></ApplicationAccessGuard>
        } />
        <Route path={`/:type/:applicationId/${summary}`} element={
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

  it.each(['s-37', 'nwl', 'cpo', 'S-37', 'NWL', 'CPO'])('blocks direct %s draft editing', async type => {
    const form = renderApplication(type, 'applicant-details');
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each(['task-list', 'delete-confirmation', 'pay-and-submit', 'withdraw', 'further-information-requests/request-1/respond'])('blocks mutation page %s', async page => {
    const form = renderApplication('nwl', page);
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each(['reassign', 'reassignment-history'])('preserves administrative %s access', async page => {
    renderApplication('nwl', page);
    expect(await screen.findByText('Application page')).toBeInTheDocument();
  });

  it.each(['s-37', 'nwl'])('preserves the %s information-request listing', async type => {
    renderApplication(type, 'further-information-requests');
    expect(await screen.findByText('Application page')).toBeInTheDocument();
  });

  it.each(['s-37', 'nwl'])('blocks %s information-request response subroutes', async type => {
    const form = renderApplication(type, 'further-information-requests/request-1/respond');
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it('keeps only CPO deletion success authenticated without an application existence check', async () => {
    const { cpoRoutes } = await import('../features/CPO/routes');
    const success = cpoRoutes.find(route => route.path.endsWith('/delete-success'));
    expect(success).toMatchObject({ auth: true, accessGuard: false });
    for (const route of cpoRoutes.filter(route => route !== success)) {
      expect(route.auth).toBe(true);
      expect(route.accessGuard).not.toBe(false);
    }
  }, 30000);

  it.each(['s-37', 'nwl', 'cpo'])('preserves the %s read-only view', async type => {
    renderApplication(type, type === 'cpo' ? 'task-list' : 'application-summary');
    expect(await screen.findByText('Read-only summary')).toBeInTheDocument();
  });

  it('preserves applicant editing', async () => {
    auth.mockReturnValue({ user: { role: 'APPLICANT_USER' } });
    renderApplication('nwl', 'applicant-details');
    expect(await screen.findByText('Application page')).toBeInTheDocument();
  });

  it.each(['/choose-application', '/s-37/who-is-applying', '/nwl/who-is-applying', '/cpo/who-is-applying'])('blocks Superuser creation at %s', async path => {
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