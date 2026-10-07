import { useEffect, useRef, useState } from 'react';
import {
  NOTIFICATION_POLL_INTERVAL_MS,
  NOTIFICATIONS_CHANGED_EVENT,
  NOTIFICATIONS_PAGE_SIZE,
} from '../constants/inAppNotifications';
import {
  getInAppNotifications,
  getUnreadNotificationCount,
  markInAppNotificationRead,
} from '../services/inAppNotificationsService';
import type { InAppNotification } from '../types/inAppNotifications';

/**
 * The signed-in user's unread count, for the navigation link. Refreshed every minute, when the
 * window regains focus, and whenever a notification is marked read. `userId` is whose count it is.
 */
export function useUnreadNotificationCount(enabled: boolean, userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Signed out, or someone else signed in: forget the last count, so the next user never sees the
    // previous user's count, not even until their own first refresh comes back.
    setUnreadCount(0);
    if (!enabled) return undefined;
    let active = true;
    // Refreshes can overlap and finish out of order: only the latest one may set the count.
    let latest = 0;
    const refresh = async () => {
      const request = ++latest;
      try {
        const count = await getUnreadNotificationCount();
        if (active && request === latest && count !== null) setUnreadCount(count);
      } catch {
        // A transient refresh failure must not interfere with the page being used.
      }
    };
    const handleChange = () => void refresh();

    void refresh();
    const intervalId = window.setInterval(handleChange, NOTIFICATION_POLL_INTERVAL_MS);
    window.addEventListener('focus', handleChange);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChange);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleChange);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleChange);
    };
  }, [enabled, userId]);

  return enabled ? unreadCount : 0;
}

/**
 * One page of the signed-in user's notifications (unread first, then read, newest first within
 * each), with the totals across all pages. Loads again when the page or `visitKey` changes (e.g.
 * Notifications is selected again), and refreshes in the background every minute and on focus.
 */
export function useNotifications(page: number, visitKey?: string) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // Notifications this page has marked read, and those it is marking read right now. A list
  // response requested before a read finished still shows that notification unread.
  const confirmedRead = useRef(new Set<string>());
  const marking = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    // Loads can overlap and finish out of order: only the latest one may update the page.
    let latest = 0;
    // Until this page has loaded once, a background refresh counts as the first load.
    let loaded = false;
    const load = async (background: boolean) => {
      const request = ++latest;
      const quiet = background && loaded;
      if (!quiet) {
        setLoading(true);
        setFailed(false);
      }
      try {
        const result = await getInAppNotifications(page, NOTIFICATIONS_PAGE_SIZE);
        if (!active || request !== latest) return;
        if (result === null) {
          // A failed background refresh keeps the list already shown.
          if (!quiet) setFailed(true);
          return;
        }
        loaded = true;
        const items = result.notifications.map((item) =>
          !item.read && confirmedRead.current.has(item.id) ? { ...item, read: true } : item
        );
        const readMeanwhile = items.filter((item, index) => item.read !== result.notifications[index].read).length;
        setNotifications(items);
        setTotal(result.total);
        setUnread(Math.max(result.unread - readMeanwhile, 0));
        setFailed(false);
      } catch {
        if (active && request === latest && !quiet) setFailed(true);
      } finally {
        if (active && request === latest) setLoading(false);
      }
    };
    const refresh = () => void load(true);

    void load(false);
    const intervalId = window.setInterval(refresh, NOTIFICATION_POLL_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    // After a notification is marked read (e.g. opened in a new tab), load the page again: the next
    // unread notification moves up into its place, keeping every unread one before any read one. This
    // new request is also the latest, so a response requested before the read finished, for this or
    // another page, can no longer bring back the old unread total.
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [page, visitKey]);

  async function markRead(notification: InAppNotification) {
    const { id } = notification;
    // Already read, or already being marked read (e.g. opened twice in new tabs): count it once.
    if (notification.read || confirmedRead.current.has(id) || marking.current.has(id)) return;
    marking.current.add(id);
    let updated = false;
    try {
      updated = await markInAppNotificationRead(id);
    } finally {
      marking.current.delete(id); // a failed update can be tried again
    }
    if (!updated) return;
    confirmedRead.current.add(id);
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
    setUnread((count) => Math.max(count - 1, 0));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  }

  return { notifications, total, unread, loading, failed, markRead };
}
