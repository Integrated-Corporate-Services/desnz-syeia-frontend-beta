import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { NOTIFICATIONS_CHANGED_EVENT } from '../constants/inAppNotifications';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';
import type { InAppNotification, InAppNotificationsResponse } from '../types/inAppNotifications';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

const local = (...parts: [number, number, number, number, number]) => new Date(...parts).toISOString();

const unreadNwl: InAppNotification = {
  id: 'notification-3',
  type: 'APPLICATION_REASSIGNED',
  applicationId: 'application-3',
  applicationType: 'NWL',
  desnzRef: 'NWL00003',
  message: 'The application NWL00003 has been reassigned to you.',
  createdAt: local(2026, 5, 30, 9, 0),
  read: false,
};

const readS37: InAppNotification = {
  id: 'notification-1',
  type: 'APPLICATION_REASSIGNED',
  applicationId: 'application-1',
  applicationType: 'S37',
  desnzRef: 'S3700004',
  message: 'You have successfully reassigned case S3700004 from Priya Nair to Sam Okoro',
  createdAt: local(2026, 5, 3, 11, 34),
  read: true,
};

const pageOf = (notifications: InAppNotification[], overrides: Partial<InAppNotificationsResponse> = {}): InAppNotificationsResponse => ({
  notifications,
  total: notifications.length,
  unread: notifications.filter((notification) => !notification.read).length,
  page: 1,
  limit: 10,
  ...overrides,
});

const CurrentUrl = () => {
  const location = useLocation();
  return <p data-testid="url">{location.pathname + location.search}</p>;
};

const renderPage = (entry = '/notifications') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/notifications" element={<><NotificationsPage /><CurrentUrl /></>} />
        <Route path="/nwl/:applicationId/application-summary" element={<p>NWL application summary</p>} />
        <Route path="/application-dashboard" element={<p>Your applications</p>} />
      </Routes>
    </MemoryRouter>
  );

const card = (title: string) => screen.getByRole('heading', { level: 2, name: title }).closest('.govuk-summary-card') as HTMLElement;

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications).mockReset();
    vi.mocked(markInAppNotificationRead).mockReset();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined); // jsdom has no scrolling
  });

  it('shows the summary line and groups the page into Unread and Read cards, newest first', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl, readS37], { total: 34, unread: 2 }));
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByText('34 notifications, newest first. 2 unread.')).toBeInTheDocument();
    expect(getInAppNotifications).toHaveBeenCalledWith(1, 10);

    const unread = card('Unread');
    expect(within(unread).getByText('30 June 2026 at 9:00am')).toBeInTheDocument();
    expect(within(unread).getByRole('link', { name: 'NWL00003' })).toHaveAttribute('href', '/nwl/application-3/application-summary');
    expect(within(unread).queryByText(/S3700004/)).not.toBeInTheDocument();

    const read = card('Read');
    expect(within(read).getByText('3 June 2026 at 11:34am')).toBeInTheDocument();
    expect(within(read).getByRole('link', { name: 'S3700004' })).toHaveAttribute('href', '/s-37/application-1/application-summary');
  });

  it('links only the application reference, keeping the rest of the message as text', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37]));
    renderPage();

    const value = (await screen.findByRole('link', { name: 'S3700004' })).closest('dd') as HTMLElement;
    expect(value).toHaveTextContent('You have successfully reassigned case S3700004 from Priya Nair to Sam Okoro');
    expect(within(value).getAllByRole('link')).toHaveLength(1);
  });

  it('marks a notification read when its application is opened, and tells the navigation to refresh', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl]));
    vi.mocked(markInAppNotificationRead).mockResolvedValue(true);
    const changed = vi.fn();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
    renderPage();

    fireEvent.click(await screen.findByRole('link', { name: 'NWL00003' }));

    expect(await screen.findByText('NWL application summary')).toBeInTheDocument();
    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-3');
    expect(changed).toHaveBeenCalledTimes(1);
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, changed);
  });

  it('does not mark an already read notification again', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37]));
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <Routes>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/s-37/:applicationId/application-summary" element={<p>S37 application summary</p>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('link', { name: 'S3700004' }));

    expect(await screen.findByText('S37 application summary')).toBeInTheDocument();
    expect(markInAppNotificationRead).not.toHaveBeenCalled();
  });

  it('pages through the notifications ten at a time', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37], { total: 34, unread: 0 }));
    renderPage();

    const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
    expect(within(pagination).getAllByRole('link', { name: /page \d of 4/ })).toHaveLength(5); // pages 1-4 and Next
    fireEvent.click(within(pagination).getByRole('link', { name: 'Go to page 2 of 4' }));

    await waitFor(() => expect(getInAppNotifications).toHaveBeenLastCalledWith(2, 10));
    expect(screen.getByTestId('url')).toHaveTextContent('/notifications?page=2');
  });

  it('opens the page asked for in the address', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37], { total: 34, unread: 0, page: 3 }));
    renderPage('/notifications?page=3');

    await screen.findByText('34 notifications, newest first. 0 unread.');
    expect(getInAppNotifications).toHaveBeenCalledWith(3, 10);
  });

  it('shows no pagination when everything fits on one page', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl, readS37]));
    renderPage();

    await screen.findByText('2 notifications, newest first. 1 unread.');
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('shows an empty state, and a link back to the applications', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([]));
    renderPage();

    expect(await screen.findByText('You have no notifications.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to your applications' })).toHaveAttribute('href', '/application-dashboard');
  });

  it('goes to the applications from Back when the page was opened directly', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([]));
    renderPage();

    fireEvent.click(await screen.findByRole('link', { name: 'Back' }));
    expect(await screen.findByText('Your applications')).toBeInTheDocument();
  });

  it('says so when the notifications cannot be loaded', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(null);
    renderPage();

    expect(await screen.findByText('Your notifications could not be loaded. Try again shortly.')).toBeInTheDocument();
    expect(screen.queryByText('You have no notifications.')).not.toBeInTheDocument();
  });
});
