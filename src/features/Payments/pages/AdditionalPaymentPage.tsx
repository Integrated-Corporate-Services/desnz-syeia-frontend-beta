import { Link } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import '../../../styles/loading-spinner.css';
import { useAdditionalPayment } from '../hooks/useAdditionalPayment';
import { additionalPaymentView } from '../utils/additionalPaymentView';
import { AdditionalPaymentBackLink } from '../components/AdditionalPaymentActions';
import { AdditionalPaymentContent } from '../components/AdditionalPaymentContent';
import { ADDITIONAL_PAYMENT_LABELS as LABELS } from '../constants/additionalPayments';

export default function AdditionalPaymentPage() {
  const flow = useAdditionalPayment();
  const { title } = additionalPaymentView(flow);
  const { generating, summary, error, fileErrors, fieldErrors, errorSummary, failed, completed, groupedActions } = flow;
  const back = <AdditionalPaymentBackLink summary={summary} completed={completed} failed={failed} />;
  useBreadcrumb(generating ? null : <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
    <ol className="govuk-breadcrumbs__list">
      <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to="/application-dashboard">{LABELS.applications}</Link></li>
      <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={summary}>{LABELS.applicationSummary}</Link></li>
    </ol>
  </nav>);
  return <>
    <PageTitle title={title} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {(error || fileErrors.length > 0 || Object.keys(fieldErrors).length > 0) && <div ref={errorSummary} tabIndex={-1} className="govuk-error-summary" role="alert">
        <h2 className="govuk-error-summary__title">{LABELS.problem}</h2>
        <div className="govuk-error-summary__body">
          {error && <p className="govuk-body">{error}</p>}
          <ul className="govuk-list">
            {fieldErrors.transaction && <li><a href="#transaction-number">{fieldErrors.transaction}</a></li>}
            {fieldErrors.confirmation && <li><a href="#confirm-transfer">{fieldErrors.confirmation}</a></li>}
            {fileErrors.map(message => <li key={message}><a href="#file-upload-input">{message}</a></li>)}
          </ul>
          {fileErrors.length > 0 && <button type="button" className="govuk-button govuk-button--secondary"
            disabled={flow.busy} onClick={flow.clearFileErrors}>Clear failed selection and try again</button>}
        </div>
      </div>}
      {!failed && !generating && !completed && <h1 className="govuk-heading-xl">{title}</h1>}
      <AdditionalPaymentContent flow={flow} back={back} />
      {!groupedActions && !generating && <p className="govuk-body govuk-!-margin-top-6">{back}</p>}
    </div></div></div>
  </>;
}