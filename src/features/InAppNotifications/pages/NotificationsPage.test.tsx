import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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
  type: 'EXAMPLE_NOTIFICATION',
  applicationId: 'application-3',
  applicationType: 'NWL',
  desnzRef: 'NWL00003',
  referenceId: 'reference-3',
  message: 'Application NWL00003 has an update for you.',
  createdAt: local(2026, 5, 30, 9, 0),
  read: false,
};

const readS37: InAppNotification = {
  id: 'notification-1',
  type: 'EXAMPLE_NOTIFICATION',
  applicationId: 'application-1',
  applicationType: 'S37',
  desnzRef: 'S3700004',
  referenceId: 'reference-1',
  message: 'Application S3700004 was updated by Priya Nair for Sam Okoro',
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

  it('shows the summary line and groups the page into Unread and Read cards', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl, readS37], { total: 34, unread: 2 }));
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByText('34 notifications: 2 unread and 32 read.')).toBeInTheDocument();
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
    expect(value).toHaveTextContent('Application S3700004 was updated by Priya Nair for Sam Okoro');
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
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
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

    await screen.findByText('34 notifications: 0 unread and 34 read.');
    expect(getInAppNotifications).toHaveBeenCalledWith(3, 10);
  });

  it('shows no pagination when everything fits on one page', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl, readS37]));
    renderPage();

    await screen.findByText('2 notifications: 1 unread and 1 read.');
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

  it('says so when the notifications cannot be loaded, as an alert screen readers announce', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(null);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Your notifications could not be loaded. Try again shortly.');
    expect(screen.queryByText('You have no notifications.')).not.toBeInTheDocument();
  });

  it('announces "Loading notifications" and then the result, in the same status region (WCAG 4.1.3)', async () => {
    let respond!: (page: InAppNotificationsResponse) => void;
    vi.mocked(getInAppNotifications).mockReturnValue(new Promise((resolve) => { respond = resolve; }));
    renderPage();

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading notifications');
    respond(pageOf([unreadNwl, readS37]));

    await waitFor(() => expect(status).toHaveTextContent('2 notifications: 1 unread and 1 read.'));
    // The same element changes, so screen readers announce the new text.
    expect(screen.getByRole('status')).toBe(status);
  });

  it('announces an empty list in the status region too', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([]));
    renderPage();

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('You have no notifications.'));
  });

  it('makes each page link a real link to its page, and leaves a Ctrl/Cmd-click to the browser', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37], { total: 34, unread: 0 }));
    renderPage();

    const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
    expect(within(pagination).getByRole('link', { name: 'Go to page 2 of 4' })).toHaveAttribute('href', '?page=2');
    expect(within(pagination).getByRole('link', { name: 'Go to next page, page 2 of 4' })).toHaveAttribute('href', '?page=2');
    expect(within(pagination).getByRole('link', { name: 'Current page, page 1 of 4' })).toHaveAttribute('href', '?page=1');

    let cancelledByPage: boolean | undefined;
    const afterPage = (event: Event) => {
      cancelledByPage = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', afterPage);
    fireEvent.click(within(pagination).getByRole('link', { name: 'Go to page 3 of 4' }), { ctrlKey: true });
    document.removeEventListener('click', afterPage);

    expect(cancelledByPage).toBe(false);
    expect(screen.getByTestId('url')).toHaveTextContent('/notifications');
    expect(getInAppNotifications).not.toHaveBeenCalledWith(3, 10);
  });

  it.each(['Infinity', 'abc', '-2', '1.5', '0'])('treats a malformed page number (%s) as the first page', async (value) => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37]));
    renderPage(`/notifications?page=${value}`);

    await screen.findByText('1 notification: 0 unread and 1 read.');
    expect(getInAppNotifications).toHaveBeenCalledWith(1, 10);
  });

  it('shows the last page when the address asks for a page past the end', async () => {
    vi.mocked(getInAppNotifications).mockImplementation(async (page: number) => pageOf(page === 4 ? [readS37] : [], { total: 34, unread: 0, page }));
    renderPage('/notifications?page=99');

    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('/notifications?page=4'));
    expect(getInAppNotifications).toHaveBeenLastCalledWith(4, 10);
    expect(await screen.findByRole('link', { name: 'S3700004' })).toBeInTheDocument();
  });

  it('leaves a Ctrl/Cmd-click to the browser (e.g. a new tab) and still records the notification as read', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl]));
    vi.mocked(markInAppNotificationRead).mockResolvedValue(true);
    renderPage();

    const link = await screen.findByRole('link', { name: 'NWL00003' });
    // Record whether the page cancelled the click, then stop jsdom (which cannot open tabs) following the link.
    let cancelledByPage: boolean | undefined;
    const afterPage = (event: Event) => {
      cancelledByPage = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', afterPage);
    fireEvent.click(link, { ctrlKey: true });
    document.removeEventListener('click', afterPage);

    expect(cancelledByPage).toBe(false);
    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-3');
    expect(screen.getByTestId('url')).toHaveTextContent('/notifications');
  });

  it('records a middle-click (new tab) as read, but not a right-click that only opens the menu', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl]));
    vi.mocked(markInAppNotificationRead).mockResolvedValue(true);
    renderPage();
    const link = await screen.findByRole('link', { name: 'NWL00003' });

    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(markInAppNotificationRead).not.toHaveBeenCalled();

    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(markInAppNotificationRead).toHaveBeenCalledWith('notification-3');
  });

  it('opens the application without waiting for the read update to finish', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([unreadNwl]));
    vi.mocked(markInAppNotificationRead).mockReturnValue(new Promise(() => undefined)); // never settles
    renderPage();

    fireEvent.click(await screen.findByRole('link', { name: 'NWL00003' }));

    expect(await screen.findByText('NWL application summary')).toBeInTheDocument();
  });

  it('keeps keyboard focus in the page content when changing page', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37], { total: 34, unread: 0 }));
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <main id="main-content" tabIndex={-1}>
          <NotificationsPage />
        </main>
      </MemoryRouter>
    );

    const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
    fireEvent.click(within(pagination).getByRole('link', { name: 'Go to page 2 of 4' }));

    expect(document.activeElement).toBe(document.getElementById('main-content'));
  });

  it('loads the list again when Notifications is selected again', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([readS37]));
    render(
      <MemoryRouter initialEntries={['/notifications']}>
        <Routes>
          <Route path="/notifications" element={<><NotificationsPage /><Link to="/notifications">Open Notifications again</Link></>} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByRole('link', { name: 'S3700004' });

    fireEvent.click(screen.getByRole('link', { name: 'Open Notifications again' }));

    await waitFor(() => expect(getInAppNotifications).toHaveBeenCalledTimes(2));
  });
});
