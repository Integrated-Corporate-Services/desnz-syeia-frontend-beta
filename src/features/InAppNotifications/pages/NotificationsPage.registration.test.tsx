import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('NotificationsPage: completed registration (SYEIA-2400)', () => {
  it('links the whole message to the review page and marks the notification read', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [
        {
          id: 'notification-reg',
          type: 'ACCESS_REQUEST_SUBMITTED',
          applicationId: null,
          applicationType: null,
          desnzRef: null,
          referenceId: 'access-request-1',
          message: 'Review a new account registration request for Jane Smith.',
          createdAt: new Date(2026, 6, 1, 10, 0).toISOString(),
          read: false,
        },
      ],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    vi.mocked(markInAppNotificationRead).mockResolvedValue(true);
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <Routes>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/review-request/:requestId" element={<p>Review registration</p>} />
        </Routes>
      </MemoryRouter>
    );

    const link = await screen.findByRole('link', { name: 'Review a new account registration request for Jane Smith.' });
    expect(link).toHaveAttribute('href', '/admin/review-request/access-request-1');
    fireEvent.click(link);

    expect(await screen.findByText('Review registration')).toBeInTheDocument();
    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-reg');
  });
});
