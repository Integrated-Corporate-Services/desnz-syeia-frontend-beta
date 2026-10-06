import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { Pagination } from '../../ApplicationDashboard/components/Pagination';
import { useApplicationNavigation } from '../../../hooks/useApplicationNavigation';
import { NOTIFICATIONS_CHANGED_EVENT, NOTIFICATIONS_MESSAGES, NOTIFICATIONS_PAGE_SIZE } from '../constants/inAppNotifications';
import { useNotifications } from '../hooks/useInAppNotifications';
import { markInAppNotificationRead } from '../services/inAppNotificationsService';
import type { InAppNotification } from '../types/inAppNotifications';
import { formatNotificationDate } from '../utils/formatNotificationDate';
import '../styles/NotificationsPage.css';

const APPLICATION_SUMMARY_ROUTE = 'application-summary';
const APPLICATIONS_PATH = '/application-dashboard';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Math.floor(Number(searchParams.get('page'))) || 1, 1);
  const { notifications, total, unread, loading, failed, markRead } = useNotifications(page);
  const { getNavigationPath, navigateToApplication } = useApplicationNavigation();
  const recordedAsRead = useRef(new Set<string>());

  // A role change has nothing to open, so showing it counts as read. It stays in Unread until the next visit.
  useEffect(() => {
    const shown = notifications.filter(
      (notification) =>
        !notification.read &&
        notification.type === 'USER_ROLE_CHANGED' &&
        !recordedAsRead.current.has(notification.id)
    );
    if (shown.length === 0) return;
    shown.forEach((notification) => recordedAsRead.current.add(notification.id));
    void Promise.all(shown.map((notification) => markInAppNotificationRead(notification.id).catch(() => false))).then(
      (results) => {
        if (results.some(Boolean)) window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
      }
    );
  }, [notifications]);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Opened directly (no earlier page in this tab): go to the applications instead.
    if (location.key === 'default') navigate(APPLICATIONS_PATH);
    else navigate(-1);
  };

  const handleOpen = async (event: React.MouseEvent<HTMLAnchorElement>, notification: InAppNotification) => {
    event.preventDefault();
    try {
      await markRead(notification);
    } catch {
      // Opening the application matters more than recording that the notification was read.
    }
    navigateToApplication(notification.applicationType ?? '', notification.applicationId ?? '', APPLICATION_SUMMARY_ROUTE);
  };

  // Only the application reference is a link, as in the design.
  const renderMessage = (notification: InAppNotification) => {
    const { desnzRef, applicationId, message } = notification;
    const at = desnzRef && applicationId ? message.indexOf(desnzRef) : -1;
    if (!desnzRef || !applicationId || at < 0) return message;
    return (
      <>
        {message.slice(0, at)}
        <a
          className="govuk-link"
          href={getNavigationPath(notification.applicationType ?? '', applicationId, APPLICATION_SUMMARY_ROUTE)}
          onClick={(event) => void handleOpen(event, notification)}
        >
          {desnzRef}
        </a>
        {message.slice(at + desnzRef.length)}
      </>
    );
  };

  const renderCard = (title: string, items: InAppNotification[]) =>
    items.length > 0 && (
      <div className="govuk-summary-card">
        <div className="govuk-summary-card__title-wrapper">
          <h2 className="govuk-summary-card__title">{title}</h2>
        </div>
        <div className="govuk-summary-card__content">
          <dl className="govuk-summary-list">
            {items.map((notification) => (
              <div className="govuk-summary-list__row" key={notification.id}>
                <dt className="govuk-summary-list__key">{formatNotificationDate(notification.createdAt)}</dt>
                <dd className="govuk-summary-list__value">{renderMessage(notification)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );

  const changePage = (nextPage: number) => {
    setSearchParams({ page: String(nextPage) });
    window.scrollTo(0, 0);
  };

  return (
    <div className="govuk-grid-row notifications-page">
      <div className="govuk-grid-column-two-thirds">
        <PageTitle title={NOTIFICATIONS_MESSAGES.PAGE_TITLE} />
        <a href="#" className="govuk-back-link" onClick={handleBack}>
          {NOTIFICATIONS_MESSAGES.BACK}
        </a>
        <h1 className="govuk-heading-l">{NOTIFICATIONS_MESSAGES.PAGE_TITLE}</h1>

        {loading && (
          <p className="govuk-body" role="status">
            {NOTIFICATIONS_MESSAGES.LOADING}
          </p>
        )}

        {!loading && failed && <p className="govuk-body">{NOTIFICATIONS_MESSAGES.LOAD_FAILED}</p>}

        {!loading && !failed && total === 0 && <p className="govuk-body">{NOTIFICATIONS_MESSAGES.NONE}</p>}

        {!loading && !failed && total > 0 && (
          <>
            <p className="govuk-body">{NOTIFICATIONS_MESSAGES.summary(total, unread)}</p>
            {renderCard(NOTIFICATIONS_MESSAGES.UNREAD, notifications.filter((notification) => !notification.read))}
            {renderCard(NOTIFICATIONS_MESSAGES.READ, notifications.filter((notification) => notification.read))}
            <Pagination currentPage={page} totalPages={Math.ceil(total / NOTIFICATIONS_PAGE_SIZE)} onPageChange={changePage} />
          </>
        )}

        <p className="govuk-body">
          <Link className="govuk-link" to={APPLICATIONS_PATH}>
            {NOTIFICATIONS_MESSAGES.GO_TO_APPLICATIONS}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotificationsPage;
