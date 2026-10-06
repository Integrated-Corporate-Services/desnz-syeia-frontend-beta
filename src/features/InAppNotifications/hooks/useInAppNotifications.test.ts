import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotifications, useUnreadNotificationCount } from './useInAppNotifications';
import { NOTIFICATIONS_CHANGED_EVENT } from '../constants/inAppNotifications';
import { getInAppNotifications, getUnreadNotificationCount, markInAppNotificationRead } from '../services/inAppNotificationsService';

vi.mock('../services/inAppNotificationsService', () => ({
  getInAppNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markInAppNotificationRead: vi.fn(),
}));

// A request that finishes only when the test says so.
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
};

const pageOf = (unread: number) => ({ notifications: [], total: 5, unread, page: 1, limit: 10 });

const unreadItem = {
  id: 'n-1',
  type: 'EXAMPLE_NOTIFICATION',
  applicationId: 'application-1',
  applicationType: 'S37',
  desnzRef: 'S3700004',
  referenceId: 'reference-1',
  message: 'Application S3700004 has an update for you.',
  createdAt: new Date(2026, 6, 1, 10, 0).toISOString(),
  read: false,
};
const pageWith = (item: typeof unreadItem, unread: number) => ({ notifications: [item], total: 5, unread, page: 1, limit: 10 });

describe('useUnreadNotificationCount', () => {
  beforeEach(() => vi.mocked(getUnreadNotificationCount).mockReset());

  it('keeps the newest count when an older request finishes last', async () => {
    const slow = deferred<number | null>();
    vi.mocked(getUnreadNotificationCount).mockReturnValueOnce(slow.promise).mockResolvedValueOnce(2);
    const { result } = renderHook(() => useUnreadNotificationCount(true));

    act(() => {
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT)); // e.g. a notification was just read
    });
    await waitFor(() => expect(result.current).toBe(2));

    await act(async () => slow.resolve(5)); // the first request comes back late
    expect(result.current).toBe(2);
  });
});

describe('useNotifications', () => {
  beforeEach(() => vi.mocked(getInAppNotifications).mockReset());

  it('refreshes the list in the background when the window regains focus, without showing loading again', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValueOnce(pageOf(1)).mockResolvedValueOnce(pageOf(3));
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(1));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current.loading).toBe(false);
    await waitFor(() => expect(result.current.unread).toBe(3));
  });

  it('shows the failure when a refresh replaces a first load that has not finished, and then fails', async () => {
    vi.mocked(getInAppNotifications).mockReturnValueOnce(new Promise(() => undefined)).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useNotifications(1));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(result.current.failed).toBe(true));
    expect(result.current.loading).toBe(false);
  });

  it('counts a notification as read once when it is opened twice before the first update finishes', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageWith(unreadItem, 2));
    const update = deferred<boolean>();
    vi.mocked(markInAppNotificationRead).mockReset().mockReturnValue(update.promise);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(2));

    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.markRead(unreadItem);
      second = result.current.markRead(unreadItem);
    });
    await act(async () => {
      update.resolve(true);
      await Promise.all([first, second]);
    });

    expect(markInAppNotificationRead).toHaveBeenCalledTimes(1);
    expect(result.current.unread).toBe(1);
  });

  it('keeps a notification read when a list response requested before the update arrives afterwards', async () => {
    const stale = deferred<ReturnType<typeof pageWith>>();
    vi.mocked(getInAppNotifications).mockResolvedValueOnce(pageWith(unreadItem, 2)).mockReturnValueOnce(stale.promise);
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(2));

    act(() => {
      window.dispatchEvent(new Event('focus')); // a refresh starts...
    });
    await act(async () => result.current.markRead(unreadItem)); // ...the notification is read...
    await act(async () => stale.resolve(pageWith(unreadItem, 2))); // ...then the older response arrives

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unread).toBe(1);
  });

  it('lets a failed update be tried again', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageWith(unreadItem, 1));
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(1));

    await act(async () => result.current.markRead(unreadItem));
    await act(async () => result.current.markRead(unreadItem));

    expect(markInAppNotificationRead).toHaveBeenCalledTimes(2);
    expect(result.current.unread).toBe(0);
  });

  it('ignores an older page response that finishes after a newer one', async () => {
    const slow = deferred<ReturnType<typeof pageOf>>();
    vi.mocked(getInAppNotifications).mockReturnValueOnce(slow.promise).mockResolvedValueOnce(pageOf(4));
    const { result } = renderHook(() => useNotifications(1));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await waitFor(() => expect(result.current.unread).toBe(4));

    await act(async () => slow.resolve(pageOf(9)));
    expect(result.current.unread).toBe(4);
  });
});
