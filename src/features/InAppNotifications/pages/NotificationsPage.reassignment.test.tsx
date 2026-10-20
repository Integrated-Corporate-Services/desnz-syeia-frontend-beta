import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';
import { NOTIFICATION_TYPES } from '../constants/inAppNotifications';
import { getInAppNotifications, markInAppNotificationRead } from '../services/inAppNotificationsService';
import type { InAppNotification } from '../types/inAppNotifications';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

// The three messages the backend saves for one reassignment (SYEIA-2402).
const TO_NEW = 'The application NWL00007 has been reassigned to you.';
const TO_PREVIOUS = 'Your application NWL00007 has been reassigned to Jane Smith.';
const TO_REASSIGNER = 'You have successfully reassigned case NWL00007 from Tom Lee to Jane Smith';

const notification = (id: string, message: string, read = false): InAppNotification => ({
  id,
  type: NOTIFICATION_TYPES.APPLICATION_REASSIGNED,
  applicationId: 'application-7',
  applicationType: 'NWL',
  desnzRef: 'NWL00007',
  referenceId: 'reassignment-1',
  message,
  createdAt: new Date(2026, 9, 13, 10, 0).toISOString(),
  read,
});

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
        <Route path="/nwl/:applicationId/application-summary" element={<p>NWL application summary</p>} />
        <Route path="/admin/review-request/:requestId" element={<p>Review registration</p>} />
      </Routes>
    </MemoryRouter>,
    { wrapper: BreadcrumbProvider }
  );

const card = (title: string) => screen.getByRole('heading', { name: title }).closest('.govuk-summary-card') as HTMLElement;

describe('NotificationsPage: application reassigned (SYEIA-2402)', () => {
  beforeEach(() => {
    vi.mocked(getInAppNotifications)
      .mockReset()
      .mockResolvedValue(pageOf([notification('n-new', TO_NEW), notification('n-reassigner', TO_REASSIGNER), notification('n-previous', TO_PREVIOUS, true)]));
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
  });

  it('has its own notification type', () => {
    expect(NOTIFICATION_TYPES.APPLICATION_REASSIGNED).toBe('APPLICATION_REASSIGNED');
  });

  it('shows each message in full, with only the application reference as a link to the application', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Unread' });
    for (const message of [TO_NEW, TO_REASSIGNER, TO_PREVIOUS]) {
      const item = screen.getByText((_, element) => element?.tagName === 'DD' && element.textContent === message);
      expect(within(item).getByRole('link', { name: 'NWL00007' })).toHaveAttribute('href', '/nwl/application-7/application-summary');
    }
    expect(screen.getAllByRole('link', { name: 'NWL00007' })).toHaveLength(3);
    expect(screen.queryByRole('link', { name: /reassigned/ })).not.toBeInTheDocument();
  });

  it('lists the unread ones under Unread and the read one under Read', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Unread' });
    expect(within(card('Unread')).getAllByRole('link', { name: 'NWL00007' })).toHaveLength(2);
    expect(within(card('Read')).getAllByRole('link', { name: 'NWL00007' })).toHaveLength(1);
    expect(within(card('Read')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('never opens the registration review page for a reassignment', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Unread' });
    for (const link of screen.getAllByRole('link', { name: 'NWL00007' })) {
      expect(link.getAttribute('href')).not.toContain('review-request');
    }
  });

  it('marks it read with "Mark as read"', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Unread' });
    fireEvent.click(within(card('Unread')).getAllByRole('button', { name: /^Mark as read/ })[0]);

    await waitFor(() => expect(markInAppNotificationRead).toHaveBeenCalledWith('n-new'));
  });

  it('opens the application from the reference and marks it read', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Unread' });
    fireEvent.click(within(card('Unread')).getAllByRole('link', { name: 'NWL00007' })[0]);

    expect(await screen.findByText('NWL application summary')).toBeInTheDocument();
    expect(markInAppNotificationRead).toHaveBeenCalledWith('n-new');
  });
});
