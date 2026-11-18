import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { NOTIFICATION_TYPES } from '../constants/inAppNotifications';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

const MESSAGE = "Olivia Demogzou's access to National Grid Electricity Distribution has been revoked by DESNZ Admin.";

describe('NotificationsPage: access revoked by an Ultra Superuser (SYEIA-2172)', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications).mockReset().mockResolvedValue({
      notifications: [
        {
          id: 'notification-revoked',
          type: NOTIFICATION_TYPES.USER_ACCESS_REVOKED,
          applicationId: null,
          applicationType: null,
          desnzRef: null,
          referenceId: 'revocation-1',
          message: MESSAGE,
          createdAt: new Date(2026, 10, 18, 15, 0).toISOString(),
          read: false,
        },
      ],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <NotificationsPage />
      </MemoryRouter>,
      { wrapper: BreadcrumbProvider }
    );

  it('shows the revocation as text, with nothing to open', async () => {
    renderPage();
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: MESSAGE })).not.toBeInTheDocument();
    expect(markInAppNotificationRead).not.toHaveBeenCalled();
  });

  it('is marked read with "Mark as read" and moves to Read', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /^Mark as read/ }));
    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-revoked'));
    const read = (await screen.findByRole('heading', { name: 'Read' })).closest('.govuk-summary-card') as HTMLElement;
    expect(within(read).getByText(MESSAGE)).toBeInTheDocument();
  });
});
