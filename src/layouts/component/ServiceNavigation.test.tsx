import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ServiceNavigation from './ServiceNavigation';
import { useAuthUserContext } from '../../context/AuthUserContext';
import { NOTIFICATIONS_CHANGED_EVENT } from '../../features/InAppNotifications/constants/inAppNotifications';
import { getUnreadNotificationCount } from '../../features/InAppNotifications/services/inAppNotificationsService';

vi.mock('../../context/AuthUserContext', () => ({
  useAuthUserContext: vi.fn(),
}));

vi.mock('../../features/InAppNotifications/services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

const signInAs = (role: string | null) =>
  vi.mocked(useAuthUserContext).mockReturnValue({
    user: role ? ({ id: 'user-1', email: 'thomas.wood@example.com', role } as never) : null,
    loading: false,
    error: null,
    authenticated: !!role,
  });

const renderNavigation = (path = '/application-dashboard') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ServiceNavigation />
    </MemoryRouter>
  );

describe('ServiceNavigation notifications link', () => {
  beforeEach(() => {
    vi.mocked(getUnreadNotificationCount).mockReset();
  });

  it('shows the signed-in user their unread notification count', async () => {
    signInAs('APPLICANT_USER');
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(2);
    renderNavigation();

    const link = await screen.findByRole('link', { name: 'Notifications (2) unread' });
    expect(link).toHaveAttribute('href', '/notifications');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('keeps the count out of a live region, so it is not announced again after every page change', async () => {
    signInAs('APPLICANT_USER');
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(2);
    renderNavigation();

    const link = await screen.findByRole('link', { name: 'Notifications (2) unread' });
    expect(link.closest('[aria-live], [role=status], [role=alert]')).toBeNull();
    expect(link.querySelector('[aria-live], [role=status], [role=alert]')).toBeNull();
  });

  it('shows the link without a count when nothing is unread, and marks it current on the page', async () => {
    signInAs('APPLICANT_TEAM_COORDINATOR');
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0);
    renderNavigation('/notifications');

    const link = await screen.findByRole('link', { name: 'Notifications' });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('marks the link current when the address has a trailing slash', async () => {
    signInAs('APPLICANT_TEAM_COORDINATOR');
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0);
    renderNavigation('/notifications/');

    expect(await screen.findByRole('link', { name: 'Notifications' })).toHaveAttribute('aria-current', 'page');
  });

  it('refreshes the count when a notification is marked read', async () => {
    signInAs('SUPERUSER');
    vi.mocked(getUnreadNotificationCount).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    renderNavigation();
    await screen.findByRole('link', { name: 'Notifications (1) unread' });

    await act(async () => {
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
    });

    expect(await screen.findByRole('link', { name: 'Notifications' })).toBeInTheDocument();
    expect(getUnreadNotificationCount).toHaveBeenCalledTimes(2);
  });

  it('does not show notifications or ask for a count when nobody is signed in', () => {
    signInAs(null);
    renderNavigation();

    expect(screen.queryByRole('link', { name: /Notifications/ })).not.toBeInTheDocument();
    expect(getUnreadNotificationCount).not.toHaveBeenCalled();
  });

  it('does not ask for a count for a user still requesting access', () => {
    signInAs('pending');
    renderNavigation('/request-access/check-answers');

    expect(screen.queryByRole('link', { name: /Notifications/ })).not.toBeInTheDocument();
    expect(getUnreadNotificationCount).not.toHaveBeenCalled();
  });
});
