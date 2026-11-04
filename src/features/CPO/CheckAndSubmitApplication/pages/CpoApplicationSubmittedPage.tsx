import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { applicationApiService } from '../../../../services/applicationApiService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoApplicationSubmittedPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState<boolean>();

  // Only confirm a CPO application that is no longer a draft; anything else goes back to check your answers.
  useEffect(() => {
    let active = true;
    applicationApiService.getApplicationById(applicationId)
      .then((application) => {
        if (!active) return;
        setReference(application?.desnz_ref ?? '');
        setSubmitted(application?.type === 'CPO' && !!application.status && application.status.toLowerCase() !== 'draft');
      })
      .catch(() => { if (active) setSubmitted(false); });
    return () => { active = false; };
  }, [applicationId]);

  if (submitted === false) return <Navigate to={`${CPO_BASE_URL}/${applicationId}/check-and-submit`} replace />;
  if (!submitted) return null;

  return <>
    <PageTitle title="Application submitted" />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-panel govuk-panel--confirmation">
        <h1 className="govuk-panel__title">Application submitted</h1>
        {reference && <div className="govuk-panel__body">Your reference number<br /><strong>{reference}</strong></div>}
      </div>
      <p className="govuk-body"><Link className="govuk-link" to="/application-dashboard">Go to your applications</Link></p>
    </div></div></div>
  </>;
};

export default CpoApplicationSubmittedPage;
