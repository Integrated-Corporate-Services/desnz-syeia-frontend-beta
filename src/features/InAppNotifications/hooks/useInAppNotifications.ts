import { useEffect, useState } from 'react';
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
 * window regains focus, and whenever a notification is marked read.
 */
export function useUnreadNotificationCount(enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
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
  }, [enabled]);

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

  useEffect(() => {
    let active = true;
    // Loads can overlap and finish out of order: only the latest one may update the page.
    let latest = 0;
    const load = async (background: boolean) => {
      const request = ++latest;
      if (!background) {
        setLoading(true);
        setFailed(false);
      }
      try {
        const result = await getInAppNotifications(page, NOTIFICATIONS_PAGE_SIZE);
        if (!active || request !== latest) return;
        if (result === null) {
          // A failed background refresh keeps the list already shown.
          if (!background) setFailed(true);
          return;
        }
        setNotifications(result.notifications);
        setTotal(result.total);
        setUnread(result.unread);
        setFailed(false);
      } catch {
        if (active && request === latest && !background) setFailed(true);
      } finally {
        if (active && request === latest) setLoading(false);
      }
    };
    const refresh = () => void load(true);

    void load(false);
    const intervalId = window.setInterval(refresh, NOTIFICATION_POLL_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, [page, visitKey]);

  async function markRead(notification: InAppNotification) {
    if (notification.read) return;
    const updated = await markInAppNotificationRead(notification.id);
    if (!updated) return;
    setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    setUnread((count) => Math.max(count - 1, 0));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  }

  return { notifications, total, unread, loading, failed, markRead };
}
