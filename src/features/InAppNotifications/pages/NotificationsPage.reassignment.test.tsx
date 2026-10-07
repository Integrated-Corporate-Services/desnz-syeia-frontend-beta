import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { getInAppNotifications } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('NotificationsPage: application reassigned (SYEIA-2402)', () => {
  it.each([
    ['the new assignee', 'S37', 'S3700013', 'The application S3700013 has been reassigned to you.', '/s-37/application-7/application-summary'],
    ['the previous assignee', 'S37', 'S3700013', 'Your application S3700013 has been reassigned to Thomas User.', '/s-37/application-7/application-summary'],
    [
      'the person who reassigned',
      'NWL',
      'NWL00002',
      'You have successfully reassigned case NWL00002 from Amelia Jones to Thomas User',
      '/nwl/application-7/application-summary',
    ],
    [
      'another Team Coordinator',
      'NWL',
      'NWL00002',
      'The application NWL00002 has been reassigned from Amelia Jones to Thomas User.',
      '/nwl/application-7/application-summary',
    ],
  ])("shows %s their message, with only the %s reference linking to the application's summary", async (_who, applicationType, desnzRef, message, href) => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-reassigned',
          type: 'APPLICATION_REASSIGNED',
          applicationId: 'application-7',
          applicationType,
          desnzRef,
          referenceId: 'assignment-history-1',
          message,
          createdAt: new Date(2026, 9, 7, 10, 30).toISOString(),
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
    const entry = link.closest('dd') as HTMLElement;
    expect(entry).toHaveTextContent(message);
    // The names in the message are plain text, not links.
    expect(within(entry).getAllByRole('link')).toEqual([link]);
  });
});
