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

  it("forgets the count when the user signs out, so the next user never sees the previous user's count", async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValueOnce(4);
    const { result, rerender } = renderHook(
      ({ enabled, userId }: { enabled: boolean; userId?: string }) => useUnreadNotificationCount(enabled, userId),
      { initialProps: { enabled: true, userId: 'user-a' } as { enabled: boolean; userId?: string } }
    );
    await waitFor(() => expect(result.current).toBe(4));

    rerender({ enabled: false, userId: undefined }); // user A signs out
    const userBCount = deferred<number | null>();
    vi.mocked(getUnreadNotificationCount).mockReturnValueOnce(userBCount.promise);
    rerender({ enabled: true, userId: 'user-b' }); // user B signs in
    expect(result.current).toBe(0); // not A's 4 while B's own count is on its way

    await act(async () => userBCount.resolve(1));
    expect(result.current).toBe(1);
  });

  it('starts from zero when a different user is signed in without signing out first', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValueOnce(4);
    const { result, rerender } = renderHook(({ userId }: { userId: string }) => useUnreadNotificationCount(true, userId), {
      initialProps: { userId: 'user-a' },
    });
    await waitFor(() => expect(result.current).toBe(4));

    const userBCount = deferred<number | null>();
    vi.mocked(getUnreadNotificationCount).mockReturnValueOnce(userBCount.promise);
    rerender({ userId: 'user-b' });
    expect(result.current).toBe(0);

    await act(async () => userBCount.resolve(2));
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

  it('counts a read once when a refresh that already includes it arrives before the update finishes', async () => {
    const other = { ...unreadItem, id: 'n-2', desnzRef: 'S3700005', message: 'Application S3700005 has an update for you.' };
    const both = { notifications: [unreadItem, other], total: 5, unread: 2, page: 1, limit: 10 };
    const afterRead = { notifications: [{ ...unreadItem, read: true }, other], total: 5, unread: 1, page: 1, limit: 10 };
    const reload = deferred<typeof afterRead>(); // the reload after the read, held back until checked
    vi.mocked(getInAppNotifications).mockResolvedValueOnce(both).mockResolvedValueOnce(afterRead).mockReturnValueOnce(reload.promise);
    const update = deferred<boolean>();
    vi.mocked(markInAppNotificationRead).mockReset().mockReturnValueOnce(update.promise);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(2));

    let marking!: Promise<boolean>;
    act(() => {
      marking = result.current.markRead(unreadItem); // e.g. opened in a new tab
      window.dispatchEvent(new Event('focus')); // a refresh that sees the read already saved...
    });
    await waitFor(() => expect(result.current.unread).toBe(1));
    await act(async () => {
      update.resolve(true); // ...arrives before the update's own response
      await marking;
    });

    expect(result.current.unread).toBe(1); // not 0: the same read is not counted twice
    expect(getInAppNotifications).toHaveBeenCalledTimes(3); // and the page is reloaded after the read
    await act(async () => reload.resolve(afterRead));
    expect(result.current.unread).toBe(1);
  });

  it('counts a notification as read once when it is opened twice before the first update finishes', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageWith(unreadItem, 2));
    const update = deferred<boolean>();
    vi.mocked(markInAppNotificationRead).mockReset().mockReturnValue(update.promise);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(2));

    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
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

  it('loads the page again once a notification is marked read, so the next unread one moves up into its place', async () => {
    const next = { ...unreadItem, id: 'n-2', desnzRef: 'S3700005', message: 'Application S3700005 has an update for you.' };
    vi.mocked(getInAppNotifications).mockResolvedValueOnce(pageWith(unreadItem, 11)).mockResolvedValueOnce(pageWith(next, 10));
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValue(true);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(11));

    await act(async () => result.current.markRead(unreadItem)); // e.g. opened in a new tab

    await waitFor(() => expect(result.current.notifications.map((item) => item.id)).toEqual(['n-2']));
    expect(getInAppNotifications).toHaveBeenCalledTimes(2);
    expect(result.current.unread).toBe(10);
  });

  it('cannot bring back the old unread total from a page requested before the read finished', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValueOnce(pageWith(unreadItem, 5));
    const update = deferred<boolean>();
    vi.mocked(markInAppNotificationRead).mockReset().mockReturnValueOnce(update.promise);
    const { result, rerender } = renderHook(({ page }: { page: number }) => useNotifications(page), { initialProps: { page: 1 } });
    await waitFor(() => expect(result.current.unread).toBe(5));

    let marking!: Promise<boolean>;
    act(() => {
      marking = result.current.markRead(unreadItem); // e.g. opened in a new tab...
    });
    const stalePage2 = deferred<ReturnType<typeof pageOf>>();
    vi.mocked(getInAppNotifications).mockReturnValueOnce(stalePage2.promise).mockResolvedValueOnce(pageOf(4));
    rerender({ page: 2 }); // ...then page 2 is opened while the update is still on its way

    await act(async () => {
      update.resolve(true);
      await marking;
    });
    await waitFor(() => expect(result.current.unread).toBe(4));

    await act(async () => stalePage2.resolve(pageOf(5))); // page 2, asked for before the read finished, arrives last
    expect(result.current.unread).toBe(4);
  });

  it('says when it could not be marked read, and keeps it unread so it can be tried again', async () => {
    vi.mocked(getInAppNotifications).mockResolvedValue(pageWith(unreadItem, 1));
    vi.mocked(markInAppNotificationRead).mockReset().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const { result } = renderHook(() => useNotifications(1));
    await waitFor(() => expect(result.current.unread).toBe(1));

    let done!: boolean;
    await act(async () => {
      done = await result.current.markRead(unreadItem);
    });
    expect(done).toBe(false);
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.unread).toBe(1);

    await act(async () => {
      done = await result.current.markRead(unreadItem);
    });
    expect(done).toBe(true);
    expect(result.current.unread).toBe(0);
  });
});
