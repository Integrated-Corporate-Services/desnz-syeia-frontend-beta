import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewRequestPage from './ReviewRequestPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const navigateToPendingRequests = vi.fn();
const navigateToDashboard = vi.fn();
let isSuperUser = true;

vi.mock('../../../hooks', () => ({
  useReviewRequest: () => ({
    requestData: {
      access_request_id: 'r1', first_name: 'Jane', last_name: 'Austen', email: 'jane@example.com',
      organisation_name: 'SSE Networks', is_agent: true, requested_at: new Date(2026, 9, 19, 11, 55).toISOString(),
    },
    loading: false, processing: false, errors: [], showRejectReason: false, rejectReason: '',
    getFieldError: () => '', approveRequest: vi.fn(), rejectRequest: vi.fn(), cancelRejection: vi.fn(),
    updateRejectReason: vi.fn(), setShowRejectReason: vi.fn(),
  }),
  useReviewRequestNavigation: () => ({
    navigateToDashboard, navigateToPendingRequests, navigateToAccessApproved: vi.fn(), navigateToAccessDenied: vi.fn(),
  }),
}));
vi.mock('../../../hooks/useIsSuperUser', () => ({ useIsSuperUser: () => isSuperUser }));

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={['/admin/review-request/r1']}>
        <BreadcrumbOutlet />
        <Routes>
          <Route path="/admin/review-request/:requestId" element={<ReviewRequestPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('ReviewRequestPage (SYEIA-2720)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSuperUser = true;
  });

  it('Ultrasuperuser sees the design intro and "Agent or employee"', () => {
    renderPage();
    expect(screen.getByText("Review the applicant's details before approving or rejecting this request.")).toBeInTheDocument();
    expect(screen.getByText('Agent or employee')).toBeInTheDocument();
  });

  it('Team coordinator keeps the existing intro and "Applicant type"', () => {
    isSuperUser = false;
    renderPage();
    expect(
      screen.getByText("Review the applicant's details before deciding whether to approve or reject this request.")
    ).toBeInTheDocument();
    expect(screen.getByText('Applicant type')).toBeInTheDocument();
  });

  it.each([true, false])('uses the shared labels for all roles (superuser: %s)', (superUser) => {
    isSuperUser = superUser;
    renderPage();
    expect(screen.getByText('Requested on')).toBeInTheDocument();
    expect(screen.getByText('19 October 2026 at 11:55am')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject access' })).toBeInTheDocument();
  });

  it('Back link returns to the Access requests tab', () => {
    renderPage();
    screen.getByRole('link', { name: 'Back' }).click();
    expect(navigateToPendingRequests).toHaveBeenCalledTimes(1);
    expect(navigateToDashboard).not.toHaveBeenCalled();
  });
});