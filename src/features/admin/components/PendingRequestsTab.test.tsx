import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PendingRequestsTab } from './PendingRequestsTab';
import { useManageUsersNavigation } from '../../../hooks/useManageUsersNavigation';

const requests = ['org-a', 'org-b'].map(organisation_id => ({
  access_request_id: 'shared-request', organisation_id, organisation_name: organisation_id,
  first_name: 'Test', last_name: 'Agent', email: 'agent@example.test', is_agent: true,
  requested_at: '2026-10-20',
}));
const props = {
  pendingRequests: requests, paginatedRequests: requests, requestsError: '', requestsLoading: false,
  currentPage: 1, totalPages: 1, handlePageChange: vi.fn(),
};

describe('pending access requests for the same agent', () => {
  it('passes the organisation for every desktop and mobile review action', () => {
    const review = vi.fn();
    render(<PendingRequestsTab {...props} navigateToReviewRequest={review} />);
    const links = screen.getAllByRole('link', { name: 'Review' });
    links.forEach(link => fireEvent.click(link));
    expect(review.mock.calls).toEqual([
      ['shared-request', 'org-a'], ['shared-request', 'org-b'],
      ['shared-request', 'org-a'], ['shared-request', 'org-b'],
    ]);
  });

  it('keeps the selected organisation in the review URL', () => {
    function Harness() {
      const { navigateToReviewRequest } = useManageUsersNavigation();
      const location = useLocation();
      return <>
        <PendingRequestsTab {...props} navigateToReviewRequest={navigateToReviewRequest} />
        <output>{location.pathname + location.search}</output>
      </>;
    }
    render(<MemoryRouter><Harness /></MemoryRouter>);
    fireEvent.click(screen.getAllByRole('link', { name: 'Review' })[1]);
    expect(screen.getByText('/admin/review-request/shared-request?organisationId=org-b')).toBeInTheDocument();
  });
});
