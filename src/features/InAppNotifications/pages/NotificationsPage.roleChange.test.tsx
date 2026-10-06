import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { NOTIFICATIONS_CHANGED_EVENT } from '../constants/inAppNotifications';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('NotificationsPage: role change (SYEIA-2401)', () => {
  it('shows the message as plain text and marks it read once shown, refreshing the navigation count', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-role',
          type: 'USER_ROLE_CHANGED',
          applicationId: null,
          applicationType: null,
          desnzRef: null,
          referenceId: 'role-change-1',
          message: 'Your role has been changed to Team coordinator.',
          createdAt: new Date(2026, 6, 2, 9, 0).toISOString(),
          read: false,
        },
      ],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    vi.mocked(markInAppNotificationRead).mockResolvedValue(true);
    const changed = vi.fn();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <NotificationsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Your role has been changed to Team coordinator.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Your role has been changed to Team coordinator.' })).not.toBeInTheDocument();
    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-role'));
    await waitFor(() => expect(changed).toHaveBeenCalled());
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
  });

  it('tries again on the next load when marking it read failed', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-role',
          type: 'USER_ROLE_CHANGED',
          applicationId: null,
          applicationType: null,
          desnzRef: null,
          referenceId: 'role-change-1',
          message: 'Your role has been changed to Applicant.',
          createdAt: new Date(2026, 6, 2, 9, 0).toISOString(),
          read: false,
        },
      ],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <NotificationsPage />
      </MemoryRouter>
    );
    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledTimes(1));

    window.dispatchEvent(new Event('focus')); // the list refreshes

    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledTimes(2));
  });
});
