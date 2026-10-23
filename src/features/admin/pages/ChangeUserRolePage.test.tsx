import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ChangeUserRolePage from './ChangeUserRolePage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

vi.mock('../../../config/appConfig', () => ({
  isManageUserRoleChangeEnabled: () => true,
}));
vi.mock('../../../hooks/useManageUsers', () => ({
  useManageUsers: () => ({
    loading: false,
    users: [{ id: 'u1', fullName: 'Jane Austen', role: 'APPLICANT_USER' }],
  }),
}));

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={['/admin/manage-user/u1/change-role']}>
        <Routes>
          <Route path="/admin/manage-user/:userId/change-role" element={<ChangeUserRolePage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('ChangeUserRolePage (SYEIA-2731)', () => {
  it('uses the design heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Choose a role for this user' })).toBeInTheDocument();
    expect(screen.queryByText('Which role applies to this user?')).not.toBeInTheDocument();
  });

  it('shows the design descriptions for both roles', () => {
    renderPage();
    expect(
      screen.getByText("Can create, edit and submit their own applications, and view their organisation's applications.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Can manage access for all users and create, edit and submit all applications for their organisation.')
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Team coordinator' })).toBeInTheDocument();
  });
});