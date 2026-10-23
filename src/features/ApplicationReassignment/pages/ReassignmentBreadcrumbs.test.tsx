import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';
import { applicationApiService } from '../../../services/applicationApiService';
import { ReassignmentHistoryPage } from './ReassignmentHistoryPage';
import { ReassignmentPage } from './ReassignmentPage';

const { mockUseAuthUserContext } = vi.hoisted(() => ({ mockUseAuthUserContext: vi.fn() }));

vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: mockUseAuthUserContext }));
vi.mock('../../../services/applicationApiService', () => ({
  applicationApiService: {
    getApplicationById: vi.fn(),
    getAssignmentHistory: vi.fn(),
    getEligibleAssignees: vi.fn(),
  },
}));

const applicationId = '11111111-1111-1111-1111-111111111111';

function BreadcrumbOutlet() {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
}

function renderRoute(path: string, element: React.ReactNode) {
  return render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[path]}>
        <BreadcrumbOutlet />
        <Routes><Route path="/s-37/:applicationId/*" element={element} /></Routes>
      </MemoryRouter>
    </BreadcrumbProvider>,
  );
}

describe('reassignment page back links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUserContext.mockReturnValue({ user: { role: 'SUPERUSER' } });
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ status: 'DRAFT' });
    vi.mocked(applicationApiService.getEligibleAssignees).mockResolvedValue([]);
    vi.mocked(applicationApiService.getAssignmentHistory).mockResolvedValue({
      application_reference: 'S3700004', current_assignee_name: null, history: [],
    });
  });

  it('shows a Back link to the application summary on the history page', async () => {
    renderRoute(`/s-37/${applicationId}/reassignment-history`, <ReassignmentHistoryPage />);
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href', `/s-37/${applicationId}/application-summary`,
    );
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });

  it('shows a Back link to the application summary on the reassign page', async () => {
    renderRoute(`/s-37/${applicationId}/reassign`, <ReassignmentPage />);
    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute(
      'href', `/s-37/${applicationId}/application-summary`,
    );
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
    await waitFor(() => expect(applicationApiService.getApplicationById).toHaveBeenCalledWith(applicationId));
    const heading = await screen.findByRole('heading', { name: 'Who do you want to reassign this application to?' });
    expect(heading.closest('.govuk-grid-column-three-quarters')).not.toBeNull();
    expect(heading.closest('.govuk-grid-column-three-quarters')?.parentElement).toHaveClass('govuk-grid-row');
  });

  it('returns from the check page to the choose step via Back', async () => {
    vi.mocked(applicationApiService.getEligibleAssignees).mockResolvedValue([
      { user_id: 'u-1', first_name: 'Sam', last_name: 'Okoro', email: 'sam@example.com', is_agent: false },
    ]);
    renderRoute(`/s-37/${applicationId}/reassign`, <ReassignmentPage />);
    fireEvent.change(await screen.findByLabelText('Choose a new applicant contact'), { target: { value: 'Sam' } });
    fireEvent.click(await screen.findByText('Sam Okoro - sam@example.com'));
    fireEvent.click(screen.getByText('Continue'));
    expect(await screen.findByRole('heading', { name: 'Check before you reassign' })).toBeInTheDocument();

    const back = screen.getByRole('link', { name: 'Back' });
    expect(back).toHaveAttribute('href', `/s-37/${applicationId}/reassign`);
    fireEvent.click(back);

    expect(await screen.findByRole('heading', { name: 'Who do you want to reassign this application to?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href', `/s-37/${applicationId}/application-summary`,
    );
  });
});