import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('reassignment page breadcrumb accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthUserContext.mockReturnValue({ user: { role: 'SUPERUSER' } });
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ status: 'DRAFT' });
    vi.mocked(applicationApiService.getEligibleAssignees).mockResolvedValue([]);
    vi.mocked(applicationApiService.getAssignmentHistory).mockResolvedValue({
      application_reference: 'S3700004', current_assignee_name: null, history: [],
    });
  });

  it('provides an accessible history breadcrumb with an application-summary link', async () => {
    renderRoute(`/s-37/${applicationId}/reassignment-history`, <ReassignmentHistoryPage />);
    const breadcrumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Application summary' })).toHaveAttribute(
      'href', `/s-37/${applicationId}/application-summary`,
    );
    expect(within(breadcrumb).getByText('Reassignment history')).toHaveAttribute('aria-current', 'page');
  });

  it('provides an accessible reassignment breadcrumb after loading the application', async () => {
    renderRoute(`/s-37/${applicationId}/reassign`, <ReassignmentPage />);
    const breadcrumb = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    expect(within(breadcrumb).getByRole('link', { name: 'Application summary' })).toHaveAttribute(
      'href', `/s-37/${applicationId}/application-summary`,
    );
    expect(within(breadcrumb).getByText('Reassign application')).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(applicationApiService.getApplicationById).toHaveBeenCalledWith(applicationId));
  });
});