import { useEffect, useEffectEvent, useState } from 'react';
import { NOTIFICATION_POLL_INTERVAL_MS } from '../constants/inAppNotifications';
import {
  getInAppNotifications,
  getUnreadNotificationCount,
  markInAppNotificationRead,
} from '../services/inAppNotificationsService';
import type { InAppNotification } from '../types/inAppNotifications';

export function useInAppNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const refreshUnreadCount = useEffectEvent(async () => {
    try {
      const count = await getUnreadNotificationCount();
      if (count !== null) setUnreadCount(count);
    } catch {
      // A transient refresh failure must not interfere with the active page.
    }
  });

  const loadNotifications = useEffectEvent(async () => {
    try {
      const items = await getInAppNotifications();
      if (items !== null) setNotifications(items);
    } catch {
      setNotifications([]);
    }
  });

  useEffect(() => {
    void refreshUnreadCount();
    const intervalId = window.setInterval(() => void refreshUnreadCount(), NOTIFICATION_POLL_INTERVAL_MS);
    const handleFocus = () => void refreshUnreadCount();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (isOpen) void loadNotifications();
  }, [isOpen]);

  async function markRead(notification: InAppNotification) {
    if (notification.status !== 'unread') return;
    const updated = await markInAppNotificationRead(notification.id);
    if (!updated) return;

    setNotifications((items) =>
      items.map((item) => (item.id === notification.id ? { ...item, status: 'read' } : item))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  return {
    isOpen,
    unreadCount,
    notifications,
    toggle: () => setIsOpen((open) => !open),
    markRead,
  };
}