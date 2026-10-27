import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ManageUserPage from './ManageUserPage';
import { Routes, Route } from 'react-router-dom';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

vi.mock('../../../hooks/useManageUsers', () => ({
  useManageUsers: () => ({
    loading: false,
    users: [
      {
        id: 'u1', fullName: 'Jane Austen', organisation: 'SSE Networks', email: 'jane@sse.com',
        phone: '', role: 'APPLICANT_TEAM_COORDINATOR', status: 'ACTIVE', lastLogin: null,
      },
    ],
  }),
}));

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};

const renderPage = (state?: { from: string }) =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: '/admin/manage-user/u1', state }]}>
        <BreadcrumbOutlet />
        <Routes>
          <Route path="/admin/manage-user/:userId" element={<ManageUserPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('ManageUserPage Back link (SYEIA-2745)', () => {
  it('returns to the Active users tab by default', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/admin/user-management?tab=active-users'
    );
  });

  it('returns to the page that sent the user here when `from` is passed in router state', () => {
    renderPage({ from: '/admin/organisations/org-1/team-coordinators' });
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/admin/organisations/org-1/team-coordinators'
    );
  });
});