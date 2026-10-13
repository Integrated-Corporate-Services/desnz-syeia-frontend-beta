import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { cpoPreSubmissionMeetingService } from '../services/cpoPreSubmissionMeetingService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import '../../styles/cpo.css';

const CpoPreSubmissionMeetingConfirmationPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const heading = confirmed ? 'Application started' : 'Application confirmation';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setReference('');
    setError('');
    setConfirmed(false);
    cpoPreSubmissionMeetingService.get(applicationId)
      .then((application) => {
        if (!active) return;
        const hasMeetingRequest = application.pre_submission_meeting_requested === true && application.pre_submission_meeting_requested_at;
        const hasCompletedNoAnswer = application.pre_submission_meeting_requested === false && application.pre_submission_meeting_completed_at;
        if (application.type !== 'CPO' || (!hasMeetingRequest && !hasCompletedNoAnswer)) {
          navigate(`${CPO_BASE_URL}/${applicationId}/pre-submission-meeting`, { replace: true });
          return;
        }
        setConfirmed(true);
        setReference(application.desnz_ref);
      })
      .catch(() => { if (active) setError('Unable to load your application confirmation. Refresh the page to try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, navigate]);

  return (
    <>
      <PageTitle title={heading} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {loading ? <p className="govuk-body" role="status">Loading your confirmation...</p> : error ? (
              <p className="govuk-body" role="alert">{error}</p>
            ) : reference ? (
              <>
                <div className="govuk-panel govuk-panel--confirmation cpo-meeting-confirmation">
                  <h1 className="govuk-panel__title">{heading}</h1>
                  <div className="govuk-panel__body">DESNZ reference: {reference}</div>
                </div>
                <h2 className="govuk-heading-s govuk-!-margin-top-6">What happens next</h2>
                <ul className="govuk-list govuk-list--bullet">
                  <li>quote the DESNZ reference whenever you contact us</li>
                  <li>
                    you can arrange a pre-application meeting by emailing{' '}
                    <a className="govuk-link" href="mailto:compulsorypurchaseorders@energysecurity.gov.uk">compulsorypurchaseorders@energysecurity.gov.uk</a>
                  </li>
                  <li>you must complete the executive summary before you have the pre-application meeting</li>
                  <li>you can continue working on your application now</li>
                </ul>
                <h2 className="govuk-heading-s">Public notices</h2>
                <p className="govuk-body">You should use the DESNZ reference number in all your public notices.</p>
                <Link className="govuk-button" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Continue</Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default CpoPreSubmissionMeetingConfirmationPage;