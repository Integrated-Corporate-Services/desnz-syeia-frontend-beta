import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { Pagination } from '../../ApplicationDashboard/components/Pagination';
import { useApplicationNavigation } from '../../../hooks/useApplicationNavigation';
import { NOTIFICATIONS_MESSAGES, NOTIFICATIONS_PAGE_SIZE } from '../constants/inAppNotifications';
import { useNotifications } from '../hooks/useInAppNotifications';
import type { InAppNotification } from '../types/inAppNotifications';
import { formatNotificationDate } from '../utils/formatNotificationDate';
import '../styles/NotificationsPage.css';

const APPLICATION_SUMMARY_ROUTE = 'application-summary';
const APPLICATIONS_PATH = '/application-dashboard';

// The page number in the address: a positive whole number, otherwise the first page.
const pageFrom = (value: string | null) => {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
};

// Ctrl/Cmd/Shift/Alt-click keeps its usual browser behaviour, e.g. opening the link in a new tab.
const isPlainClick = (event: React.MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = pageFrom(searchParams.get('page'));
  // Selecting Notifications again (a new location key) reloads the list.
  const { notifications, total, unread, loading, failed, markRead } = useNotifications(page, location.key);
  const { getNavigationPath, navigateToApplication } = useApplicationNavigation();
  const lastPage = Math.max(Math.ceil(total / NOTIFICATIONS_PAGE_SIZE), 1);

  // A page past the end (e.g. an old link) shows the last page instead.
  useEffect(() => {
    if (!loading && !failed && page > lastPage) setSearchParams({ page: String(lastPage) }, { replace: true });
  }, [loading, failed, page, lastPage, setSearchParams]);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Opened directly (no earlier page in this tab): go to the applications instead.
    if (location.key === 'default') navigate(APPLICATIONS_PATH);
    else navigate(-1);
  };

  // Recording the notification as read happens in the background, so it never holds the user here.
  const markReadInBackground = (notification: InAppNotification) => {
    markRead(notification).catch(() => undefined);
  };

  // A middle-click opens the link in a new tab; a right-click only opens the browser's menu.
  const handleAuxClick = (event: React.MouseEvent<HTMLAnchorElement>, notification: InAppNotification) => {
    if (event.button === 1) markReadInBackground(notification);
  };

  const handleOpen = (event: React.MouseEvent<HTMLAnchorElement>, notification: InAppNotification) => {
    markReadInBackground(notification);
    if (!isPlainClick(event)) return; // the browser follows the link itself
    event.preventDefault();
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
          onClick={(event) => handleOpen(event, notification)}
          onAuxClick={(event) => handleAuxClick(event, notification)}
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
    // The page links disappear while the next page loads: keep keyboard focus in the page content.
    document.getElementById('main-content')?.focus();
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
            <Pagination currentPage={Math.min(page, lastPage)} totalPages={lastPage} onPageChange={changePage} />
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
