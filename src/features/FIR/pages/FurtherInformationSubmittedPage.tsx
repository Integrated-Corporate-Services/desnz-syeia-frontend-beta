import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFurtherInformationRequest } from '../services';
import type { FurtherInformationRequest } from '../types';

export const FurtherInformationSubmittedPage: React.FC = () => {
  const { applicationId, requestId } = useParams<{ applicationId: string; requestId: string }>();
  const [request, setRequest] = useState<FurtherInformationRequest | null>(null);
  useEffect(() => {
    if (applicationId && requestId) void getFurtherInformationRequest(applicationId, requestId).then(setRequest).catch(() => {});
  }, [applicationId, requestId]);
  return (
    <div className="govuk-width-container">
      <div className="govuk-panel govuk-panel--confirmation">
        <h1 className="govuk-panel__title">Information submitted</h1>
        {request && <div className="govuk-panel__body">DESNZ reference: {request.desnzRef}</div>}
      </div>
      <p className="govuk-body">This further information request is now complete and cannot be reopened.</p>
      <h2 className="govuk-heading-m">What happens next</h2>
      <p className="govuk-body">A case officer will review the information you have provided.</p>
      <p className="govuk-body">Your application status will be updated when the review is complete.</p>
      <h2 className="govuk-heading-m">If you need help</h2>
      <p className="govuk-body">If you have any questions, please contact us at [Application team contact email address].</p>
    </div>
  );
};
