import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserManagementDashboard from './UserManagementDashboard';

let isSuperUser = true;

vi.mock('../../../hooks', () => ({
  useUserManagementDashboard: () => ({
    isSuperUser,
    dnoTeamCoordinatorsOrganisationsEnabled: true,
    activeTab: 'pending-requests',
    currentPage: 1,
    totalPages: 0,
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
  }),
}));

const renderPage = () => render(<MemoryRouter><UserManagementDashboard /></MemoryRouter>);

describe('UserManagementDashboard wording (SYEIA-2703)', () => {
  beforeEach(() => {
    isSuperUser = true;
  });

  it('Ultrasuperusers see the all-organisations description and the Access requests tab', () => {
    renderPage();
    expect(screen.getByText('Manage all applicant organisations, access requests and users.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Access requests (0)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Access requests' })).toBeInTheDocument();
  });

  it('team coordinators see their own organisation description and the same Access requests tab', () => {
    isSuperUser = false;
    renderPage();
    expect(screen.getByText('Manage access request and users for your Organisation')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Access requests (0)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Access requests' })).toBeInTheDocument();
  });
});