import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccessDeniedPage from './AccessDeniedPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const navigateToDashboard = vi.fn();
const navigateToPendingRequests = vi.fn();

vi.mock('../../../hooks', () => ({
  useAccessConfirmationNavigation: () => ({ navigateToDashboard, navigateToPendingRequests }),
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
  });

  describe('all roles', () => {
    it('shows "What happens next" once and no grey "Rejected" box', () => {
      renderPage(STATE);
      expect(screen.getAllByRole('heading', { name: 'What happens next' })).toHaveLength(1);
      expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
      expect(screen.queryByText('Reason for rejection')).not.toBeInTheDocument();
      expect(screen.getAllByText(/submit a new request/)).toHaveLength(1);
    });

    it('shows who was notified', () => {
      renderPage(STATE);
      expect(screen.getByText(/Jane Austen has been notified/)).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('Back link returns to the Access requests tab', () => {
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

  describe('What happens next (same for every role)', () => {
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

});
