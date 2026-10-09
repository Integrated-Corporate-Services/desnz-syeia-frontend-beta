import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationDecisionPage from './NotificationDecisionPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';
import { getNotificationDecision } from '../services/inAppNotificationsService';
import type { NotificationDecisionSummary } from '../types/inAppNotifications';

vi.mock('../services/inAppNotificationsService', () => ({
  getNotificationDecision: vi.fn(),
}));

const summary: NotificationDecisionSummary = {
  id: 'n-9',
  message: 'Hannah Martin approved the registration request for Jane Smith.',
  notifiedAt: new Date(2026, 9, 9, 10, 1).toISOString(),
  organisationName: 'National Grid Electricity Distribution',
  decision: {
    outcome: 'APPROVED',
    applicantName: 'Jane Smith',
    decidedBy: 'Hannah Martin',
    decidedAt: new Date(2026, 9, 9, 10, 0).toISOString(),
    rejectionReason: null,
  },
};

// The layout shows the page's back link before <main>; this stands in for it.
const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <nav aria-label="Breadcrumb">{breadcrumb}</nav>;
};

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={['/notifications/n-9/decision']}>
        <BreadcrumbOutlet />
        <Routes>
          <Route path="/notifications/:notificationId/decision" element={<NotificationDecisionPage />} />
        </Routes>
      </MemoryRouter>
    </BreadcrumbProvider>
  );

const row = (key: string) => screen.getByText(key, { selector: 'dt' }).closest('div')!;

describe('NotificationDecisionPage (SYEIA-2400)', () => {
  beforeEach(() => vi.mocked(getNotificationDecision).mockReset());

  it('shows who decided the registration, how and when, read-only', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({ status: 'found', summary });
    renderPage();

    expect(await screen.findByText(summary.message)).toBeInTheDocument();
    expect(getNotificationDecision).toHaveBeenCalledWith('n-9');
    expect(within(row('Applicant')).getByText('Jane Smith')).toBeInTheDocument();
    expect(within(row('Organisation')).getByText('National Grid Electricity Distribution')).toBeInTheDocument();
    expect(within(row('Decision')).getByText('Approved')).toBeInTheDocument();
    expect(within(row('Decided by')).getByText('Hannah Martin')).toBeInTheDocument();
    expect(within(row('Date decided')).getByText('9 October 2026 at 10:00am')).toBeInTheDocument();
    // An approval has no reason; nothing on the page acts on the request.
    expect(screen.queryByText('Reason for rejection')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the reason for a rejection', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({
      status: 'found',
      summary: { ...summary, decision: { ...summary.decision!, outcome: 'REJECTED', rejectionReason: 'Not known to our organisation' } },
    });
    renderPage();

    expect(within(await screen.findByText('Rejected')).getByText('Rejected')).toBeInTheDocument();
    expect(within(row('Reason for rejection')).getByText('Not known to our organisation')).toBeInTheDocument();
  });

  it('says the details are no longer shown once the applicant has sent the request again', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({ status: 'found', summary: { ...summary, decision: null } });
    renderPage();

    expect(await screen.findByText(/has sent this registration request again since this decision/)).toBeInTheDocument();
    expect(screen.queryByText('Decided by')).not.toBeInTheDocument();
  });

  it('says when the notification is not found', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({ status: 'not-found' });
    renderPage();

    expect(await screen.findByText('This notification could not be found.')).toBeInTheDocument();
  });

  it('announces a failure to load', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({ status: 'failed' });
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('The decision could not be loaded. Try again shortly.');
  });

  it('announces that it is loading, then the result', async () => {
    let finish: (value: { status: 'found'; summary: NotificationDecisionSummary }) => void = () => undefined;
    vi.mocked(getNotificationDecision).mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading the decision');
    finish({ status: 'found', summary });
    expect(await screen.findByText(summary.message)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('goes back to the Notifications page', async () => {
    vi.mocked(getNotificationDecision).mockResolvedValue({ status: 'found', summary });
    renderPage();

    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute('href', '/notifications');
  });
});
