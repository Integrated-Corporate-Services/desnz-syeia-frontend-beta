import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';
import { CPO_BASE_URL, CPO_CASE_TYPE_LABEL } from '../../../../constants/cpo';
import { getApplicationStatusDisplay } from '../../../../constants/status';
import { useWithdrawalRequest } from '../../../ApplicationSummary/hooks';
import { WithdrawalNotificationBanner } from '../../../ApplicationSummary/components/WithdrawalNotificationBanner';
import { noticeDateText } from '../../RecordNotices/utils/noticeRecord';
import { useCpoApplicationId } from '../../CheckAndSubmitApplication/hooks/useCpoApplicationId';
import CpoApplicationAnswers from '../../shared/components/CpoApplicationAnswers';
import { useCpoApplicationAnswers } from '../../shared/hooks/useCpoApplicationAnswers';

const HEADING = 'Application summary';

/** Read-only view of a CPO application for the applicant and DESNZ staff once it has been submitted. */
const CpoApplicationSummaryPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const { data, loading, error, setError, retry } = useCpoApplicationAnswers(applicationId);
  const { withdrawalRequest, loading: withdrawalLoading } = useWithdrawalRequest(applicationId);
  const summaryRef = useRef<HTMLDivElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}`;

  useBreadcrumb(<div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to="/application-dashboard">Applications</Link></li>
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${base}/application-summary`}>{HEADING}</Link></li>
  </ol></div>);

  useEffect(() => { if (error) summaryRef.current?.focus(); }, [error]);

  const status = data ? getApplicationStatusDisplay(data.application.status) : null;
  const reference = data?.application.desnz_ref || data?.notices.reference || '';
  const canWithdraw = data?.application.permissions?.canWithdraw === true && !withdrawalLoading && !withdrawalRequest;

  return <>
    <PageTitle title={`${error ? 'Error: ' : ''}${HEADING}`} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {error && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="summary-error-title">
        <h2 className="govuk-error-summary__title" id="summary-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list"><li><a href="#summary-heading">{error}</a></li></ul></div>
      </div>}
      {withdrawalRequest && <WithdrawalNotificationBanner />}
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
              <dd className="govuk-summary-list__value" style={{ overflowWrap: 'anywhere' }}>{data.order.details.orderName}</dd>
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
        {/* View objections is added once an objections page exists for CPO. */}
        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
        <CpoApplicationAnswers answers={data} applicationId={applicationId} editable={false}
          onDownloadError={() => setError('Unable to download the document. Try again.')} />
      </>}
    </div></div></div>
  </>;
};

export default CpoApplicationSummaryPage;
