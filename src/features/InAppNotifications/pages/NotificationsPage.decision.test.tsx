import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

const DECIDED = 'Hannah Martin approved the registration request for Jane Smith.';
const SUBMITTED = 'Review a new account registration request for Jane Smith.';
const notification = (overrides: Partial<InAppNotification>): InAppNotification => ({
  id: 'n-1',
  type: 'ACCESS_REQUEST_DECIDED',
  applicationId: null,
  applicationType: null,
  desnzRef: null,
  referenceId: 'review-record-1',
  message: DECIDED,
  createdAt: new Date(2026, 9, 9, 10, 0).toISOString(),
  read: false,
  ...overrides,
});
const decided = notification({ id: 'n-decided' });
const submitted = notification({ id: 'n-submitted', type: 'ACCESS_REQUEST_SUBMITTED', referenceId: 'access-request-1', message: SUBMITTED });
const readBefore = notification({ id: 'n-read', message: 'Tom Lee rejected the registration request for Sam Green.', read: true });

const pageOf = (items: InAppNotification[]) => ({
  notifications: items,
  total: items.length,
  unread: items.filter((item) => !item.read).length,
  page: 1,
  limit: 10,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin/review-request/:requestId" element={<p>Review registration</p>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: BreadcrumbProvider }
  );

const card = (title: string) => screen.getByRole('heading', { name: title }).closest('.govuk-summary-card') as HTMLElement;
// The card once it is on the page (a notification that moved there may still be on its way).
const shownCard = async (title: string) => (await screen.findByRole('heading', { name: title })).closest('.govuk-summary-card') as HTMLElement;
// A button's accessible name: its action, then (visually hidden) which notification it is about.
const named = (action: string, message: string) =>
  new RegExp(`^${action}\\W+${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

describe('NotificationsPage: decisions as text, links only to act, "Mark as read" (SYEIA-2400)', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications).mockReset().mockResolvedValue(pageOf([decided, submitted, readBefore]));
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
  });

  it('shows a decision as text, not a link', async () => {
    renderPage();

    expect(await screen.findByText(DECIDED)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DECIDED })).not.toBeInTheDocument();
  });

  it('keeps a registration to approve or reject as a link to its review page', async () => {
    renderPage();

    expect(await screen.findByRole('link', { name: SUBMITTED })).toHaveAttribute('href', '/admin/review-request/access-request-1');
  });

  it('offers "Mark as read" beside each unread notification only, never "Mark as unread"', async () => {
    renderPage();

    const unread = await shownCard('Unread');
    expect(within(unread).getAllByRole('button', { name: /^Mark as read/ })).toHaveLength(2);
    expect(within(unread).getByRole('button', { name: named('Mark as read', DECIDED) })).toBeInTheDocument();
    expect(within(card('Read')).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mark as unread/ })).not.toBeInTheDocument();
  });

  it('marks it read: it moves to Read, without a button there', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: named('Mark as read', DECIDED) }));

    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledWith('n-decided'));
    await waitFor(() => expect(within(card('Read')).getByText(DECIDED)).toBeInTheDocument());
    expect(within(card('Read')).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3 notifications: 1 unread and 2 read.');
  });

  it('moves keyboard focus to the next unread notification\'s "Mark as read"', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: named('Mark as read', DECIDED) }));

    const next = screen.getByRole('button', { name: named('Mark as read', SUBMITTED) });
    await waitFor(() => expect(next).toHaveFocus());
  });

  it('moves keyboard focus to the Read heading once nothing is left unread', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageOf([decided, readBefore]));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: named('Mark as read', DECIDED) }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Read' })).toHaveFocus());
    expect(screen.queryByRole('heading', { name: 'Unread' })).not.toBeInTheDocument();
  });

  it('says when it could not be marked read, and leaves it unread', async () => {
    vi.mocked(markInAppNotificationRead).mockResolvedValue(false);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: named('Mark as read', DECIDED) }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The notification could not be marked as read. Try again.');
    expect(within(card('Unread')).getByRole('button', { name: named('Mark as read', DECIDED) })).toBeInTheDocument();
  });

  it('still marks a registration read when it is opened', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('link', { name: SUBMITTED }));

    expect(await screen.findByText('Review registration')).toBeInTheDocument();
    expect(markInAppNotificationRead).toHaveBeenCalledWith('n-submitted');
  });
});
