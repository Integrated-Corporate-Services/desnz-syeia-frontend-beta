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
    const refresh = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (active && count !== null) setUnreadCount(count);
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

/** One page of the signed-in user's notifications, newest first, with the totals across all pages. */
export function useNotifications(page: number) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    getInAppNotifications(page, NOTIFICATIONS_PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        if (result === null) {
          setFailed(true);
          return;
        }
        setNotifications(result.notifications);
        setTotal(result.total);
        setUnread(result.unread);
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page]);

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
