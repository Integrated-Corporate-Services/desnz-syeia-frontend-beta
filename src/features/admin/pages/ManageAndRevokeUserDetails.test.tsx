import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ManageUserPage from './ManageUserPage';
import RevokeUserAccessPage from './RevokeUserAccessPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import type { User } from '../../../types/user';

const lastLogin = new Date(2026, 1, 22, 10, 32).toISOString();
const employee: User = {
  id: 'u1', fullName: 'Jane Austen', email: 'jane@example.test', status: 'ACTIVE', lastLogin,
  organisation: 'Network A', role: 'APPLICANT_USER', isAgent: false, organisationIds: ['org-a'],
};
const agent: User = { ...employee, id: 'u2', fullName: 'Alex Agent', role: 'APPLICANT_AGENT', isAgent: true, agencyName: 'Agency Ltd' };
const coordinator: User = { ...employee, id: 'u3', fullName: 'Tom Coordinator', role: 'APPLICANT_TEAM_COORDINATOR' };

const mocks = vi.hoisted(() => ({ users: [] as unknown[] }));
vi.mock('../../../config/appConfig', () => ({ isManageUserRoleChangeEnabled: () => false }));
vi.mock('../../../hooks/useManageUsers', () => ({
  useManageUsers: () => ({ users: mocks.users, loading: false, error: '', userRole: 'SUPERUSER', confirmRevokeAccess: vi.fn() }),
}));
vi.mock('../../../hooks/useManageUsersNavigation', () => ({
  useManageUsersNavigation: () => ({ navigateToAccessRevoked: vi.fn(), navigateToDashboard: vi.fn() }),
}));

const mount = (path: string) =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/manage-user/:userId" element={<ManageUserPage />} />
          <Route path="/admin/revoke-user/:userId" element={<RevokeUserAccessPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

const shown = (label: string) =>
  screen.getByText(label, { selector: 'dt' }).parentElement?.querySelector('dd')?.textContent;

describe('Manage user access (SYEIA-2170)', () => {
  beforeEach(() => { mocks.users = [employee, agent, coordinator]; });

  it('shows "Agent or Employee" as Employee for an employee and Agent for an agent', () => {
    mount('/admin/manage-user/u1');
    expect(shown('Agent or Employee')).toBe('Employee');
  });

  it('shows Agent for an agent', () => {
    mount('/admin/manage-user/u2');
    expect(shown('Agent or Employee')).toBe('Agent');
  });

  it('shows last login as "22 February 2026 at 10:32am"', () => {
    mount('/admin/manage-user/u1');
    expect(shown('Last login')).toBe('22 February 2026 at 10:32am');
  });
});

describe('Revoke access (SYEIA-2171, 2182)', () => {
  beforeEach(() => { mocks.users = [employee, agent, coordinator]; });

  it('shows Applicant type and last login in the agreed format', () => {
    mount('/admin/revoke-user/u2');
    expect(shown('Applicant type')).toBe('Agent');
    expect(shown('Last login')).toBe('22 February 2026 at 10:32am');
  });

  it('tells an applicant the revocation can be reinstated, not that it cannot be undone', () => {
    mount('/admin/revoke-user/u1');
    expect(screen.getByText(/Their access can be reinstated within 180 days/)).toBeInTheDocument();
    expect(screen.queryByText(/cannot be undone/)).not.toBeInTheDocument();
    expect(screen.queryByText(/coordinate access requests/)).not.toBeInTheDocument();
  });

  it('mentions coordinating access requests only for a team coordinator', () => {
    mount('/admin/revoke-user/u3');
    expect(screen.getByText(/no longer be able to coordinate access requests/)).toBeInTheDocument();
  });
});
