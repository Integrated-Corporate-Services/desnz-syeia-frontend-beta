import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { applicationApiService } from '../../../../services/applicationApiService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoApplicationSubmittedPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const [reference, setReference] = useState('');

  useEffect(() => {
    let active = true;
    applicationApiService.getApplicationById(applicationId)
      .then((application) => { if (active) setReference(application?.desnz_ref ?? ''); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [applicationId]);

  return <>
    <PageTitle title="Application submitted" />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      <div className="govuk-panel govuk-panel--confirmation">
        <h1 className="govuk-panel__title">Application submitted</h1>
        {reference && <div className="govuk-panel__body">Your reference number<br /><strong>{reference}</strong></div>}
      </div>
      <p className="govuk-body"><Link className="govuk-link" to={`${CPO_BASE_URL}/${applicationId}/application-summary`}>View your application</Link></p>
      <p className="govuk-body"><Link className="govuk-link" to="/application-dashboard">Go to your applications</Link></p>
    </div></div></div>
  </>;
};

export default CpoApplicationSubmittedPage;
