import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccessDeniedPage from './AccessDeniedPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const navigateToDashboard = vi.fn();
const navigateToPendingRequests = vi.fn();
let isSuperUser = true;

vi.mock('../../../hooks', () => ({
  useAccessConfirmationNavigation: () => ({ navigateToDashboard, navigateToPendingRequests }),
}));
vi.mock('../../../hooks/useIsSuperUser', () => ({
  useIsSuperUser: () => isSuperUser,
}));

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};

const renderPage = (state?: Record<string, string>) =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: '/admin/access-denied', state }]}>
        <BreadcrumbOutlet />
        <AccessDeniedPage />
      </MemoryRouter>
    </BreadcrumbProvider>
  );

const STATE = { userName: 'Jane Austen', userEmail: 'jane@example.com', rejectionReason: 'Not a Team Coordinator' };
const NO_REASON_STATE = { userName: 'Jane Austen', userEmail: 'jane@example.com' };

describe('AccessDeniedPage (SYEIA-2723)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSuperUser = true;
  });

  describe('all roles', () => {
    it.each([true, false])('shows "What happens next" once and no grey "Rejected" box (superuser: %s)', (superUser) => {
      isSuperUser = superUser;
      renderPage(STATE);
      expect(screen.getAllByRole('heading', { name: 'What happens next' })).toHaveLength(1);
      expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
      expect(screen.queryByText('Reason for rejection')).not.toBeInTheDocument();
      expect(screen.getAllByText(/submit a new request/)).toHaveLength(1);
    });

    it.each([true, false])('shows who was notified (superuser: %s)', (superUser) => {
      isSuperUser = superUser;
      renderPage(STATE);
      expect(screen.getByText(/Jane Austen has been notified/)).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it.each([true, false])('Back link returns to the Access requests tab (superuser: %s)', (superUser) => {
      isSuperUser = superUser;
      renderPage(STATE);
      screen.getByRole('link', { name: 'Back' }).click();
      expect(navigateToPendingRequests).toHaveBeenCalledTimes(1);
      expect(navigateToDashboard).not.toHaveBeenCalled();
    });

    it('Return to dashboard button goes to the dashboard', () => {
      renderPage(STATE);
      screen.getByRole('button', { name: 'Return to dashboard' }).click();
      expect(navigateToDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ultrasuperuser', () => {
    it('follows the design: the email sentence, then the reason entered, then what the user can do', () => {
      renderPage(STATE);
      expect(
        screen.getByText(/We have sent an email to the user to let them know their access request has been rejected for this reason:/)
      ).toBeInTheDocument();
      expect(screen.getByText('Not a Team Coordinator')).toBeInTheDocument();
      expect(
        screen.getByText('If they believe the decision is incorrect, they can contact you directly or submit a new request.')
      ).toBeInTheDocument();
      expect(screen.queryByText(/This reason has been included/)).not.toBeInTheDocument();
    });

    it('keeps line breaks in the reason', () => {
      renderPage({ ...STATE, rejectionReason: 'Line one\nLine two' });
      expect(screen.getByText(/Line one/)).toHaveStyle({ whiteSpace: 'pre-line' });
    });

    it('ends the sentence with a full stop and shows no reason after a page refresh', () => {
      renderPage(NO_REASON_STATE);
      expect(screen.getByText(/has been rejected\.$/)).toBeInTheDocument();
      expect(screen.queryByText(/for this reason:/)).not.toBeInTheDocument();
    });
  });

  describe('Team coordinator', () => {
    beforeEach(() => {
      isSuperUser = false;
    });

    it('keeps the SYEIA-959 wording with the reason as plain text', () => {
      renderPage(STATE);
      expect(screen.getByText('Not a Team Coordinator')).toBeInTheDocument();
      expect(screen.getByText('This reason has been included in the email sent to the applicant.')).toBeInTheDocument();
      expect(
        screen.getByText('If Jane Austen believes the decision is incorrect, they can contact you directly or submit a new request.')
      ).toBeInTheDocument();
      expect(screen.queryByText(/for this reason:/)).not.toBeInTheDocument();
    });

    it('omits the reason sentences after a page refresh', () => {
      renderPage(NO_REASON_STATE);
      expect(screen.queryByText(/This reason has been included/)).not.toBeInTheDocument();
      expect(screen.getByText(/believes the decision is incorrect/)).toBeInTheDocument();
    });
  });
});