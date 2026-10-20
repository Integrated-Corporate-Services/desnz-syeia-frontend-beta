import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

const MESSAGE = 'Your role has been changed to Team coordinator.';

describe('NotificationsPage: role change (SYEIA-2401)', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications).mockReset().mockResolvedValue({
      notifications: [
        {
          id: 'notification-role',
          type: 'USER_ROLE_CHANGED',
          applicationId: null,
          applicationType: null,
          desnzRef: null,
          referenceId: 'role-change-1',
          message: MESSAGE,
          createdAt: new Date(2026, 6, 4, 15, 0).toISOString(),
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

  it('shows a role change as text, with nothing to open', async () => {
    renderPage();
    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: MESSAGE })).not.toBeInTheDocument();
    // Showing it does not mark it read: the user does that.
    expect(markInAppNotificationRead).not.toHaveBeenCalled();
  });

  it('is marked read with "Mark as read" and moves to Read', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /^Mark as read/ }));
    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-role'));
    const read = (await screen.findByRole('heading', { name: 'Read' })).closest('.govuk-summary-card') as HTMLElement;
    expect(within(read).getByText(MESSAGE)).toBeInTheDocument();
  });
});
