import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { getInAppNotifications } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('NotificationsPage: application status change (SYEIA-2405)', () => {
  it.each([
    ['S37', 'S3700013', "The status of application S3700013 has changed to 'Under review'.", '/s-37/application-7/application-summary'],
    ['NWL', 'NWL00002', "The status of application NWL00002 has changed to 'In progress'.", '/nwl/application-7/application-summary'],
  ])("links only the %s reference to the application's summary", async (applicationType, desnzRef, message, href) => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-status',
          type: 'APPLICATION_STATUS_CHANGED',
          applicationId: 'application-7',
          applicationType,
          desnzRef,
          referenceId: 'status-change-1',
          message,
          createdAt: new Date(2026, 6, 4, 15, 0).toISOString(),
          read: false,
        },
      ],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <NotificationsPage />
      </MemoryRouter>
    );

    const link = await screen.findByRole('link', { name: desnzRef });
    expect(link).toHaveAttribute('href', href);
    expect(link.closest('dd')).toHaveTextContent(message);
  });
});
