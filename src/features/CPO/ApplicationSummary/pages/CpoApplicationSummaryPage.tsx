import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL, CPO_CASE_TYPE_LABEL } from '../../../../constants/cpo';
import { getApplicationStatusDisplay } from '../../../../constants/status';
import { APPLICATION_SUMMARY_CONSTANTS } from '../../../ApplicationSummary/constants';
import { WithdrawalNotificationBanner } from '../../../ApplicationSummary/components/WithdrawalNotificationBanner';
import { ApplicationSummaryBreadcrumbs } from '../../../ApplicationSummary/components/ApplicationSummaryBreadcrumbs';
import { noticeDateText } from '../../RecordNotices/utils/noticeRecord';
import { useCpoApplicationId } from '../../CheckAndSubmitApplication/hooks/useCpoApplicationId';
import CpoApplicationAnswers from '../../CheckAndSubmitApplication/components/CpoApplicationAnswers';
import { useCpoApplicationAnswers } from '../../CheckAndSubmitApplication/hooks/useCpoApplicationAnswers';
import { useCpoWithdrawalRequest } from '../hooks/useCpoWithdrawalRequest';

const HEADING = 'Application summary';

/** Read-only view of a CPO application for the applicant and DESNZ staff once it has been submitted. */
const CpoApplicationSummaryPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const { data, loading, error, setError, retry } = useCpoApplicationAnswers(applicationId);
  const { withdrawalRequest, loading: withdrawalLoading, failed: withdrawalFailed, retry: retryWithdrawal } = useCpoWithdrawalRequest(applicationId);
  const summaryRef = useRef<HTMLDivElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}`;

  useEffect(() => { if (error) summaryRef.current?.focus(); }, [error]);

  const status = data ? getApplicationStatusDisplay(data.application.status) : null;
  const reference = data?.application.desnz_ref || data?.notices.reference || '';
  // As on S37 and NWL, a rejected request lets the applicant ask again; a pending or approved one does not.
  const canWithdraw = data?.application.permissions?.canWithdraw === true && !withdrawalLoading && !withdrawalFailed
    && (!withdrawalRequest || withdrawalRequest.request_status === 'Rejected');

  return <>
    <PageTitle title={`${error ? 'Error: ' : ''}${HEADING}`} />
    <ApplicationSummaryBreadcrumbs applicationType="CPO" applicationId={applicationId} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {error && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="summary-error-title">
        <h2 className="govuk-error-summary__title" id="summary-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list"><li><a href="#summary-heading">{error}</a></li></ul></div>
      </div>}
      {withdrawalRequest?.request_status === 'Requested' && <WithdrawalNotificationBanner />}
      {withdrawalRequest?.request_status === 'Rejected' && <WithdrawalNotificationBanner
        message={APPLICATION_SUMMARY_CONSTANTS.REVIEW_LAYOUT.WITHDRAWAL.REJECTED_NOTIFICATION_BANNER} />}
      <h1 className="govuk-heading-l" id="summary-heading">{HEADING}</h1>
      {loading && <p className="govuk-body" role="status">Loading the application...</p>}
      {!loading && !data && <button className="govuk-button govuk-button--secondary" type="button" onClick={retry}>Try again</button>}
      {data && status && <>
        <div className="govuk-summary-card">
          <div className="govuk-summary-card__title-wrapper"><h2 className="govuk-summary-card__title">Summary</h2></div>
          <div className="govuk-summary-card__content"><dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">DESNZ reference</dt>
              <dd className="govuk-summary-list__value">{reference || 'Not yet assigned'}</dd>
            </div>
            {data.order.details.orderName && <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Order title</dt>
              <dd className="govuk-summary-list__value govuk-!-text-break-word">{data.order.details.orderName}</dd>
            </div>}
            {data.notices.finalObjectionDate && <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Objection period</dt>
              <dd className="govuk-summary-list__value">Until {noticeDateText(data.notices.finalObjectionDate)}</dd>
            </div>}
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Case type</dt>
              <dd className="govuk-summary-list__value">{CPO_CASE_TYPE_LABEL}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Application status</dt>
              <dd className="govuk-summary-list__value"><strong className={`govuk-tag ${status.className}`}>{status.label}</strong></dd>
            </div>
          </dl></div>
        </div>
        {canWithdraw && <Link className="govuk-button govuk-button--secondary" role="button" draggable="false" data-module="govuk-button"
          to={`${base}/withdraw`} state={{ desnzRef: reference, formType: 'CPO' }}>
          Withdraw application
        </Link>}
        {withdrawalFailed && <>
          <p className="govuk-body">We could not check if a withdrawal has been requested.</p>
          <button className="govuk-button govuk-button--secondary" type="button" onClick={retryWithdrawal}>Check again</button>
        </>}
        {/* View objections is added once an objections page exists for CPO. */}
        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
        <CpoApplicationAnswers answers={data} applicationId={applicationId} editable={false}
          onDownloadError={() => setError('Unable to download the document. Try again.')} />
      </>}
    </div></div></div>
  </>;
};

export default CpoApplicationSummaryPage;
