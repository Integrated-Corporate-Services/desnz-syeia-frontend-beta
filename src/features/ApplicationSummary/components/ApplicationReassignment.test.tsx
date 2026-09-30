import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../services/applicationApiService';
import { ApplicationReassignment, ApplicationReassignmentLinks, ReassignmentHistoryPage, ReassignmentSuccessBanner } from './ApplicationReassignment';

const { mockUseAuthUserContext } = vi.hoisted(() => ({ mockUseAuthUserContext: vi.fn() }));

vi.mock('../../../context/AuthUserContext', () => ({
  useAuthUserContext: mockUseAuthUserContext,
}));

vi.mock('../../../services/applicationApiService', () => ({
  applicationApiService: {
    getEligibleAssignees: vi.fn(),
    getAssignmentHistory: vi.fn(),
    reassignApplication: vi.fn(),
  },
}));

const applicationId = '11111111-1111-1111-1111-111111111111';
const assigneeId = '22222222-2222-2222-2222-222222222222';

function renderFlow(status: string) {
  render(<MemoryRouter initialEntries={[`/s37/${applicationId}/reassign`]}><Routes>
    <Route path="/s37/:applicationId/reassign" element={<ApplicationReassignment applicationId={applicationId} status={status} />} />
    <Route path="/s37/:applicationId/application-summary" element={<ReassignmentSuccessBanner />} />
  </Routes></MemoryRouter>);
}

describe('application reassignment confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUserContext.mockReturnValue({ user: { role: 'APPLICANT_TEAM_COORDINATOR' } });
    vi.mocked(applicationApiService.getEligibleAssignees).mockResolvedValue([{ user_id: assigneeId, first_name: 'Sam', last_name: 'Okoro', email: 'sam@example.com', is_agent: false }]);
    vi.mocked(applicationApiService.getAssignmentHistory).mockResolvedValue({ application_reference: 'S3700004', current_assignee_name: 'Priya Nair', history: [] });
    vi.mocked(applicationApiService.reassignApplication).mockResolvedValue({});
  });

  it.each([
    ['FURTHER_INFORMATION_REQUESTED', true],
    ['DECISION_ISSUED', false],
  ])('shows the outstanding request only for FIR (%s)', async (status, showRequest) => {
    renderFlow(status);
    fireEvent.change(await screen.findByLabelText('Choose a new applicant contact'), { target: { value: 'Sam' } });
    fireEvent.click(await screen.findByText('Sam Okoro - sam@example.com'));
    fireEvent.click(screen.getByText('Continue'));

    expect(screen.getByText('Check before you reassign')).toBeInTheDocument();
    expect(screen.getByText('S3700004')).toBeInTheDocument();
    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    if (showRequest) expect(screen.getByText(/A further information request is still outstanding/)).toBeInTheDocument();
    else expect(screen.queryByText(/A further information request is still outstanding/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Reassign now'));
    await waitFor(() => expect(applicationApiService.reassignApplication).toHaveBeenCalledWith(applicationId, assigneeId, 'Manual application reassignment'));
    expect(await screen.findByText('Application reassigned')).toBeInTheDocument();
    expect(screen.getByText('S3700004 is now assigned to Sam Okoro.')).toBeInTheDocument();
  });

  it('shows the public reassignment history with the required date and actor label', async () => {
    vi.mocked(applicationApiService.getAssignmentHistory).mockResolvedValue({
      application_reference: 'S3700004', current_assignee_name: 'Sam Okoro', history: [{
        previous_assignee_name: 'Priya Nair', new_assignee_name: 'Sam Okoro', assigned_by_name: 'DESNZ Coordinator',
        assigned_at: '2026-06-03T11:34:00', justification: 'Private internal note',
      }],
    });
    render(<MemoryRouter initialEntries={[`/s37/${applicationId}/reassignment-history`]}><Routes>
      <Route path="/s37/:applicationId/reassignment-history" element={<ReassignmentHistoryPage />} />
    </Routes></MemoryRouter>);

    expect(await screen.findByText('03.06.2026, 11:34')).toBeInTheDocument();
    expect(screen.getByText('Reassigned from Priya Nair to Sam Okoro by DESNZ Coordinator.')).toBeInTheDocument();
    expect(screen.queryByText('Private internal note')).not.toBeInTheDocument();
  });

  it('shows the CTA only after the backend authorizes this coordinator for the application', async () => {
    vi.mocked(applicationApiService.getEligibleAssignees).mockRejectedValueOnce(new Error('Forbidden'));
    const view = render(<MemoryRouter initialEntries={[`/s-37/${applicationId}/application-summary`]}>
      <ApplicationReassignmentLinks applicationId={applicationId} status="Draft" />
    </MemoryRouter>);
    await waitFor(() => expect(applicationApiService.getEligibleAssignees).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: 'Reassign application' })).not.toBeInTheDocument();

    view.unmount();
    vi.mocked(applicationApiService.getEligibleAssignees).mockResolvedValueOnce([]);
    render(<MemoryRouter initialEntries={[`/s-37/${applicationId}/application-summary`]}>
      <ApplicationReassignmentLinks applicationId={applicationId} status="Draft" />
    </MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'Reassign application' })).toBeInTheDocument();
  });

  it.each(['APPLICANT_USER', 'APPLICANT_AGENT'])('does not show reassignment CTA to %s', async (role) => {
    mockUseAuthUserContext.mockReturnValue({ user: { role } });
    render(<MemoryRouter initialEntries={[`/s-37/${applicationId}/application-summary`]}>
      <ApplicationReassignmentLinks applicationId={applicationId} status="Draft" />
    </MemoryRouter>);

    await waitFor(() => expect(applicationApiService.getAssignmentHistory).toHaveBeenCalled());
    expect(applicationApiService.getEligibleAssignees).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Reassign application' })).not.toBeInTheDocument();
  });

  it.each(['WITHDRAWN', 'INVALID', 'ARCHIVED', 'COMPLETED', 'CLOSED'])('does not request reassignment eligibility for %s applications', async (status) => {
    render(<MemoryRouter initialEntries={[`/s-37/${applicationId}/application-summary`]}>
      <ApplicationReassignmentLinks applicationId={applicationId} status={status} />
    </MemoryRouter>);

    await waitFor(() => expect(applicationApiService.getAssignmentHistory).toHaveBeenCalled());
    expect(applicationApiService.getEligibleAssignees).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Reassign application' })).not.toBeInTheDocument();
  });
});