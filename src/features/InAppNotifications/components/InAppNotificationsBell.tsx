import { useInAppNotifications } from '../hooks/useInAppNotifications';
import '../styles/InAppNotificationsBell.css';

const InAppNotificationsBell = () => {
  const { isOpen, unreadCount, notifications, toggle, markRead } = useInAppNotifications();

  return (
    <div className="in-app-notifications">
      <button
        type="button"
        className="in-app-notifications__button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
        aria-controls="in-app-notifications-panel"
        onClick={toggle}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unreadCount > 0 && <span className="in-app-notifications__count">{unreadCount}</span>}
      </button>
      {isOpen && (
        <section
          id="in-app-notifications-panel"
          className="in-app-notifications__panel"
          aria-label="Notifications"
        >
          <h2 className="govuk-heading-s">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="govuk-body-s govuk-!-margin-bottom-0">There are no current notifications.</p>
          ) : (
            <ul className="in-app-notifications__list">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={`in-app-notifications__item ${notification.status === 'unread' ? 'in-app-notifications__item--unread' : ''}`}
                    onClick={() => void markRead(notification)}
                  >
                    <span>{notification.title}</span>
                    <span>{notification.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default InAppNotificationsBell;