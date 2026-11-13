import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { getInAppNotifications } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

describe('NotificationsPage: additional payment withdrawal (SYEIA-2682)', () => {
  it.each(['S37', 'NWL'])('displays the required %s withdrawal header and message', async applicationType => {
    const title = `Additional payment request withdrawn: ${applicationType}00001`;
    const message = 'An additional payment request for your application has been withdrawn. View your Application Summary for details.';
    vi.mocked(getInAppNotifications).mockResolvedValue({
      notifications: [{
        id: 'payment-withdrawal', type: 'ADDITIONAL_PAYMENT_WITHDRAWN',
        applicationId: 'application-7', applicationType, desnzRef: `${applicationType}00001`,
        referenceId: 'payment-request', title, message,
        createdAt: '2026-11-02T10:00:00Z', read: false,
      }, {
        id: 'ordinary-notification', type: 'USER_ROLE_CHANGED',
        applicationId: null, applicationType: null, desnzRef: null, referenceId: 'role-change',
        title: 'Unrelated title', message: 'Your role has changed.',
        createdAt: '2026-11-02T09:00:00Z', read: true,
      }],
      total: 2, unread: 1, page: 1, limit: 10,
    });

    render(<MemoryRouter initialEntries={['/notifications']}><NotificationsPage /></MemoryRouter>, {
      wrapper: BreadcrumbProvider,
    });

    expect(await screen.findByRole('heading', { name: title, level: 3 })).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Mark as read/ })).toBeInTheDocument();
    expect(screen.queryByText('Unrelated title')).not.toBeInTheDocument();
  });
});
