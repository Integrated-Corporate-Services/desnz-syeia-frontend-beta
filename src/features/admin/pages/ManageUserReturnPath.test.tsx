import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ManageUserPage from './ManageUserPage';
import ChangeUserRolePage from './ChangeUserRolePage';
import RevokeUserAccessPage from './RevokeUserAccessPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const user = {
  id: 'u1', fullName: 'Jane Austen', email: 'jane@example.test', status: 'ACTIVE', organisation: 'Network A',
  role: 'APPLICANT_USER', lastLogin: null, organisationIds: ['org-a'],
  organisationMemberships: [{ organisationId: 'org-a', organisationName: 'Network A', role: 'APPLICANT_USER' }],
};
const revoke = vi.hoisted(() => vi.fn());
vi.mock('../../../config/appConfig', () => ({ isManageUserRoleChangeEnabled: () => true }));
vi.mock('../../../hooks/useManageUsers', () => ({
  useManageUsers: () => ({ users: [user], loading: false, confirmRevokeAccess: revoke }),
}));
vi.mock('../../../hooks/useManageUsersNavigation', () => ({
  useManageUsersNavigation: () => ({ navigateToAccessRevoked: vi.fn(), navigateToDashboard: vi.fn() }),
}));
vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: () => ({ user: { role: 'APPLICANT_TEAM_COORDINATOR', organisation_id: 'org-a' } }),
}));

const LIST = '/admin/organisations/org-a/team-coordinators';
function List() { return <div>Coordinator list:{useLocation().pathname}</div>; }

function mount(state: Record<string, string> = { from: LIST }) {
  return render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: '/admin/manage-user/u1', state }]}>
        <Breadcrumb />
        <Routes>
          <Route path="/admin/manage-user/:userId" element={<ManageUserPage />} />
          <Route path="/admin/manage-user/:userId/change-role" element={<ChangeUserRolePage />} />
          <Route path="/admin/revoke-user/:userId" element={<RevokeUserAccessPage />} />
          <Route path={LIST} element={<List />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );
}
function Breadcrumb() { return <>{useBreadcrumbContext().breadcrumb}</>; }
const back = () => fireEvent.click(screen.getAllByText('Back')[0]);

describe('Manage user keeps the coordinator list return path (PR #588 review)', () => {
  it('Change role, then Back, then Back returns to the coordinator list', async () => {
    mount();
    fireEvent.click(screen.getByRole('link', { name: /Change/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Choose a role for this user' })).toBeInTheDocument();
    back();
    expect(await screen.findByText('Revoke access')).toBeInTheDocument();
    back();
    expect(await screen.findByText(`Coordinator list:${LIST}`)).toBeInTheDocument();
  });

  it('Change role, then Return to manage user, then Back returns to the coordinator list', async () => {
    mount();
    fireEvent.click(screen.getByRole('link', { name: /Change/ }));
    fireEvent.click(await screen.findByRole('link', { name: 'Return to manage user' }));
    expect(await screen.findByRole('link', { name: 'Revoke access' })).toBeInTheDocument();
    back();
    expect(await screen.findByText(`Coordinator list:${LIST}`)).toBeInTheDocument();
  });

  it('Revoke access targets the organisation from the coordinator list', async () => {
    mount({ from: LIST, organisationId: 'org-b' });
    fireEvent.click(screen.getByRole('link', { name: 'Revoke access' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Revoke access' }));
    expect(revoke).toHaveBeenCalledWith('u1', expect.any(Function), 'org-b');
  });

  it('Revoke access, then Back, then Back returns to the coordinator list', async () => {
    mount();
    fireEvent.click(screen.getByRole('link', { name: 'Revoke access' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Revoke access' })).toBeInTheDocument();
    back();
    expect(await screen.findByRole('link', { name: 'Revoke access' })).toBeInTheDocument();
    back();
    expect(await screen.findByText(`Coordinator list:${LIST}`)).toBeInTheDocument();
  });
});
