import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotifications, useUnreadNotificationCount } from './useInAppNotifications';
import { NOTIFICATIONS_CHANGED_EVENT } from '../constants/inAppNotifications';
import { getInAppNotifications, getUnreadNotificationCount } from '../services/inAppNotificationsService';

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
