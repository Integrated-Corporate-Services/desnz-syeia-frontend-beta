import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';
import type { InAppNotification } from '../types/inAppNotifications';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

const MESSAGE = 'Hannah Martin approved the registration request for Jane Smith.';
const decided: InAppNotification = {
  id: 'notification-decided',
  type: 'ACCESS_REQUEST_DECIDED',
  applicationId: null,
  applicationType: null,
  desnzRef: null,
  referenceId: 'review-record-1',
  message: MESSAGE,
  createdAt: new Date(2026, 9, 9, 10, 0).toISOString(),
  read: false,
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/:notificationId/decision" element={<p>Decision summary</p>} />
        <Route path="/admin/review-request/:requestId" element={<p>Review registration</p>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: BreadcrumbProvider }
  );

describe('NotificationsPage: a decision by another Team Coordinator (SYEIA-2400)', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications).mockResolvedValue({ notifications: [decided], total: 1, unread: 1, page: 1, limit: 10 });
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
  });

  it('links the whole message to the read-only decision summary, not the review page', async () => {
    renderPage();

    const link = await screen.findByRole('link', { name: MESSAGE });
    expect(link).toHaveAttribute('href', '/notifications/notification-decided/decision');
  });

  it('marks it read when opened, and opens the summary', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('link', { name: MESSAGE }));

    expect(await screen.findByText('Decision summary')).toBeInTheDocument();
    expect(screen.queryByText('Review registration')).not.toBeInTheDocument();
    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-decided');
  });

  it('marks it read when opened in a new tab with the middle button', async () => {
    renderPage();

    fireEvent(await screen.findByRole('link', { name: MESSAGE }), new MouseEvent('auxclick', { bubbles: true, button: 1 }));

    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-decided');
  });

  it('keeps linking a new registration to its review page', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [{ ...decided, id: 'notification-reg', type: 'ACCESS_REQUEST_SUBMITTED', referenceId: 'access-request-1', message: 'Review a new account registration request for Jane Smith.' }],
      total: 1,
      unread: 1,
      page: 1,
      limit: 10,
    });
    renderPage();

    expect(await screen.findByRole('link', { name: 'Review a new account registration request for Jane Smith.' }))
      .toHaveAttribute('href', '/admin/review-request/access-request-1');
  });
});
