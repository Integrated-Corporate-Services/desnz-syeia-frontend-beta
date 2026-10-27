import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../constants/roles';

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: auth }));

const creationPaths = [
  '/choose-application',
  '/s-37/who-is-applying',
  '/nwl/who-is-applying',
  '/cpo/who-is-applying',
];
const creationUrls = creationPaths.flatMap(path => [
  path,
  path.toUpperCase(),
  `${path}/?source=dashboard`,
  path.replace(/[^/]+$/, segment => `%${segment.charCodeAt(0).toString(16)}${segment.slice(1)}`),
  path.replace(/^\/(.)/, (_, character: string) => `/%${character.charCodeAt(0).toString(16)}`),
]);

function renderCreation(path: string) {
  const form = vi.fn(() => <div>Create application</div>);
  const Form = form;
  const view = () => (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/application-dashboard" element={<div>Dashboard</div>} />
        <Route path="/landingPage" element={<div>Sign in</div>} />
        <Route path="/access-revoked" element={<div>Access revoked</div>} />
        <Route path="*" element={
          <ProtectedRoute>
            <Routes>
              {creationPaths.map(route => <Route key={route} path={route} element={<Form />} />)}
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  );
  return { ...render(view()), form, view };
}

describe('ProtectedRoute creation permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockReturnValue({ authenticated: true, loading: false, user: { role: ROLES.SUPERUSER } });
  });

  it.each(creationUrls)('never mounts the Superuser creation form at %s', async path => {
    const { form } = renderCreation(path);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each([ROLES.APPLICANT_USER, ROLES.APPLICANT_TEAM_COORDINATOR])('preserves %s creation for every URL variant', role => {
    auth.mockReturnValue({ authenticated: true, loading: false, user: { role } });
    for (const path of creationUrls) {
      const { unmount } = renderCreation(path);
      expect(screen.getByText('Create application')).toBeInTheDocument();
      unmount();
    }
  });

  it.each(['/cpo/%E0%A4%A', '/nwl/who-is-applying%', '/s-37/%ZZ', '/choose-application%'])('handles malformed URL %s without mounting creation', path => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { form } = renderCreation(path);
      expect(screen.getByText('Not found')).toBeInTheDocument();
      expect(form).not.toHaveBeenCalled();
      expect(warning).toHaveBeenCalled();
    } finally {
      warning.mockRestore();
    }
  });

  it('keeps matching hooks stable when authentication finishes loading', async () => {
    auth.mockReturnValue({ loading: true, authenticated: false, user: null });
    const { form, rerender, view } = renderCreation('/cpo/%77ho-is-applying');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    auth.mockReturnValue({ loading: false, authenticated: true, user: { role: ROLES.SUPERUSER } });
    rerender(view());
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });

  it.each([
    { authenticated: false, user: null, destination: 'Sign in' },
    { authenticated: true, user: { role: ROLES.SUPERUSER, status: 'INACTIVE' }, destination: 'Access revoked' },
  ])('preserves authentication checks before creation restrictions: $destination', async ({ authenticated, user, destination }) => {
    auth.mockReturnValue({ loading: false, authenticated, user });
    const { form } = renderCreation('/cpo/%77ho-is-applying');
    expect(await screen.findByText(destination)).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
});