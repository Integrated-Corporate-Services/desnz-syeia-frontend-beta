import { useAdditionalPaymentRequests } from '../hooks/useAdditionalPaymentRequests';
import { AdditionalPaymentRequestCard } from './AdditionalPaymentRequestCard';

export function AdditionalPaymentSummary({ applicationId, baseUrl }: { applicationId: string; baseUrl: string }) {
  const { requests, error, retry } = useAdditionalPaymentRequests(applicationId);
  if (error) return <div className="govuk-inset-text" role="alert">
    <p className="govuk-body">{error}</p>
    <button className="govuk-button govuk-button--secondary" onClick={retry}>Try again</button>
  </div>;
  return <>{requests.map(request => <AdditionalPaymentRequestCard key={request.request_id}
    request={request} applicationId={applicationId} baseUrl={baseUrl} />)}</>;
}