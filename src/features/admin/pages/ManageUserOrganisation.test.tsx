import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ManageUserPage from './ManageUserPage';
import RevokeUserAccessPage from './RevokeUserAccessPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import type { User } from '../../../types/user';

const base = { id: 'u1', fullName: 'Jane Austen', email: 'jane@example.test', status: 'ACTIVE', lastLogin: null };
const rowA: User = {
  ...base, organisation: 'Network A', role: 'APPLICANT_USER', organisationIds: ['org-a'],
  organisationMemberships: [{ organisationId: 'org-a', organisationName: 'Network A', role: 'APPLICANT_USER' }],
};
const rowB: User = {
  ...base, organisation: 'Network B', role: 'APPLICANT_TEAM_COORDINATOR', organisationIds: ['org-b'],
  organisationMemberships: [{ organisationId: 'org-b', organisationName: 'Network B', role: 'APPLICANT_TEAM_COORDINATOR' }],
};
const aggregated: User = {
  ...base, organisation: 'Network A, Network B', role: 'APPLICANT_USER, APPLICANT_TEAM_COORDINATOR',
  organisationIds: ['org-a', 'org-b'],
  organisationMemberships: [...rowA.organisationMemberships!, ...rowB.organisationMemberships!],
};

const mocks = vi.hoisted(() => ({ users: [] as unknown[], revoke: vi.fn() }));
vi.mock('../../../config/appConfig', () => ({ isManageUserRoleChangeEnabled: () => true }));
vi.mock('../../../hooks/useManageUsers', () => ({
  useManageUsers: () => ({ users: mocks.users, loading: false, confirmRevokeAccess: mocks.revoke }),
}));
vi.mock('../../../hooks/useManageUsersNavigation', () => ({
  useManageUsersNavigation: () => ({ navigateToAccessRevoked: vi.fn(), navigateToDashboard: vi.fn() }),
}));

const LIST = '/admin/organisations/org-b/team-coordinators';

function mount(path: string, state?: Record<string, string>) {
  return render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="/admin/manage-user/:userId" element={<ManageUserPage />} />
          <Route path="/admin/revoke-user/:userId" element={<RevokeUserAccessPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );
}

const shown = (label: string) =>
  screen.getByText(label, { selector: 'dt' }).parentElement?.querySelector('dd')?.textContent;

describe.each([
  ['separate rows per organisation', () => [rowA, rowB]],
  ['one row with several memberships', () => [aggregated]],
])('Manage user and Revoke access with %s (PR #588 review)', (_name, makeUsers) => {
  beforeEach(() => {
    mocks.users = makeUsers();
    mocks.revoke.mockReset();
  });

  it('Manage user shows the organisation and role chosen on the coordinator list', () => {
    mount('/admin/manage-user/u1', { from: LIST, organisationId: 'org-b' });
    expect(shown('Organisation')).toBe('Network B');
    expect(shown('Role')).toBe('DNO Team Coordinator');
  });

  it('Revoke access shows, and revokes, the organisation chosen on the coordinator list', async () => {
    mount('/admin/revoke-user/u1', { from: LIST, organisationId: 'org-b' });
    expect(shown('Organisation')).toBe('Network B');
    expect(shown('Role')).toBe('DNO Team Coordinator');
    fireEvent.click(screen.getByRole('button', { name: 'Revoke access' }));
    expect(mocks.revoke).toHaveBeenCalledWith('u1', expect.any(Function), 'org-b');
  });

  it('shows the other organisation when that one is chosen', () => {
    mount('/admin/manage-user/u1', { from: LIST, organisationId: 'org-a' });
    expect(shown('Organisation')).toBe('Network A');
    expect(shown('Role')).toBe('Applicant');
  });
});

describe('Manage user without a chosen organisation', () => {
  it('falls back to the first row for the user, as before', () => {
    mocks.users = [rowA, rowB];
    mount('/admin/manage-user/u1');
    expect(shown('Organisation')).toBe('Network A');
    expect(shown('Role')).toBe('Applicant');
  });

  it('falls back to the first row when the chosen organisation matches nothing', () => {
    mocks.users = [rowA, rowB];
    mount('/admin/manage-user/u1', { from: LIST, organisationId: 'org-z' });
    expect(shown('Organisation')).toBe('Network A');
  });
});
