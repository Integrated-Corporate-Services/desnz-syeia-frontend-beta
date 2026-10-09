import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { DECISION_MESSAGES, NOTIFICATIONS_PATH } from '../constants/inAppNotifications';
import { getNotificationDecision } from '../services/inAppNotificationsService';
import type { NotificationDecisionResult, NotificationDecisionSummary } from '../types/inAppNotifications';
import { formatNotificationDate } from '../utils/formatNotificationDate';

// SYEIA-2400: what a decision notification opens. A read-only summary of how another Team Coordinator
// decided a registration request (who, how and when), for the coordinators of that organisation who were
// told. Unlike the review page it is never refused once the request is decided.
const NotificationDecisionPage: React.FC = () => {
  const { notificationId = '' } = useParams<{ notificationId: string }>();
  const [result, setResult] = useState<NotificationDecisionResult | null>(null);

  useEffect(() => {
    let current = true;
    setResult(null);
    getNotificationDecision(notificationId).then((loaded) => {
      if (current) setResult(loaded);
    });
    return () => {
      current = false;
    };
  }, [notificationId]);

  // The back link goes in the layout's breadcrumb area, before <main>, as on the Notifications page.
  const backLink = useMemo(
    () => (
      <Link className="govuk-back-link" to={NOTIFICATIONS_PATH}>
        {DECISION_MESSAGES.BACK}
      </Link>
    ),
    []
  );
  useBreadcrumb(backLink);

  const renderSummary = ({ message, organisationName, decision }: NotificationDecisionSummary) => {
    const rows: Array<[string, string | null]> = decision
      ? [
          [DECISION_MESSAGES.APPLICANT, decision.applicantName],
          [DECISION_MESSAGES.ORGANISATION, organisationName],
          [DECISION_MESSAGES.DECISION, DECISION_MESSAGES.OUTCOME[decision.outcome]],
          [DECISION_MESSAGES.DECIDED_BY, decision.decidedBy],
          [DECISION_MESSAGES.DECIDED_ON, decision.decidedAt ? formatNotificationDate(decision.decidedAt) : null],
          [DECISION_MESSAGES.REASON, decision.outcome === 'REJECTED' ? decision.rejectionReason : null],
        ]
      : [];
    return (
      <>
        <p className="govuk-body-l">{message}</p>
        {decision ? (
          <dl className="govuk-summary-list">
            {rows
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div className="govuk-summary-list__row" key={key}>
                  <dt className="govuk-summary-list__key">{key}</dt>
                  <dd className="govuk-summary-list__value">{value}</dd>
                </div>
              ))}
          </dl>
        ) : (
          <div className="govuk-inset-text">{DECISION_MESSAGES.NO_LONGER_SHOWN}</div>
        )}
      </>
    );
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <PageTitle title={DECISION_MESSAGES.PAGE_TITLE} />
        <h1 className="govuk-heading-l">{DECISION_MESSAGES.PAGE_TITLE}</h1>

        {/* Announced while it loads (WCAG 4.1.3), as on the Notifications page. */}
        <p className={result ? undefined : 'govuk-body'} role="status">
          {result ? '' : DECISION_MESSAGES.LOADING}
        </p>

        {result?.status === 'failed' && (
          <p className="govuk-body" role="alert">
            {DECISION_MESSAGES.LOAD_FAILED}
          </p>
        )}
        {result?.status === 'not-found' && <p className="govuk-body">{DECISION_MESSAGES.NOT_FOUND}</p>}
        {result?.status === 'found' && renderSummary(result.summary)}
      </div>
    </div>
  );
};

export default NotificationDecisionPage;
