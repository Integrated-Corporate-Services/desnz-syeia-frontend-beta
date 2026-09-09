import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserManagementDashboard from './UserManagementDashboard';

const dashboardState = vi.hoisted(() => ({
  isDesnzAdmin: true,
}));

vi.mock('../../../hooks', () => ({
  useUserManagementDashboard: () => ({
    isDesnzAdmin: dashboardState.isDesnzAdmin,
    activeTab: 'organisations',
    currentPage: 1,
    totalPages: 1,
    handleTabChange: vi.fn(),
    handlePageChange: vi.fn(),
    totalResults: 0,
    usersError: '',
    usersLoading: false,
    paginatedUsers: [],
    pendingRequests: [],
    requestsError: '',
    requestsLoading: false,
    paginatedRequests: [],
    navigateToReviewRequest: vi.fn(),
    navigateToRevokeUser: vi.fn(),
    organisations: [],
    organisationsLoading: false,
    organisationsError: '',
    organisationSearchInput: '',
    setOrganisationSearchInput: vi.fn(),
    handleOrganisationSearch: vi.fn(),
  }),
}));

describe('UserManagementDashboard', () => {
  beforeEach(() => {
    dashboardState.isDesnzAdmin = true;
  });

  it('shows organisation search for a DESNZ superuser', () => {
    render(<UserManagementDashboard />);

    expect(screen.getByRole('heading', { name: 'Search for an organisation' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('does not show organisation search for an organisation-scoped user', () => {
    dashboardState.isDesnzAdmin = false;
    render(<UserManagementDashboard />);

    expect(screen.queryByRole('heading', { name: 'Search for an organisation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });
});