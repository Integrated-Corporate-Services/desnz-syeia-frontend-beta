import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { applicationApiService } from '../../../../services/applicationApiService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoPreSubmissionMeetingConfirmationPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [meetingRequested, setMeetingRequested] = useState<boolean | null>(null);
  const heading = meetingRequested === null
    ? 'Application confirmation'
    : meetingRequested ? 'Pre-submission meeting request submitted' : 'Application started';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setReference('');
    setError('');
    setMeetingRequested(null);
    applicationApiService.getApplicationById(applicationId)
      .then((application) => {
        if (!active) return;
        const hasMeetingRequest = application.pre_submission_meeting_requested === true && application.pre_submission_meeting_requested_at;
        const hasCompletedNoAnswer = application.pre_submission_meeting_requested === false && application.pre_submission_meeting_completed_at;
        if (application.type !== 'CPO' || (!hasMeetingRequest && !hasCompletedNoAnswer)) {
          navigate(`${CPO_BASE_URL}/${applicationId}/pre-submission-meeting`, { replace: true });
          return;
        }
        setMeetingRequested(application.pre_submission_meeting_requested ?? null);
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
                <h2 className="govuk-heading-s govuk-!-font-weight-regular govuk-!-margin-top-6">What happens next</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {meetingRequested ? (
                    <>
                      <li>the case officer will be in touch via email to arrange a pre-submission meeting</li>
                      <li>you can continue with the rest of your application or wait until the meeting</li>
                    </>
                  ) : (
                    <>
                      <li>use this reference on your public notices and whenever you contact DESNZ</li>
                      <li>you can ask for a pre-submission meeting at any time before you submit</li>
                    </>
                  )}
                </ul>
                <div className="govuk-button-group govuk-!-margin-top-6">
                  <Link className="govuk-button" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Save and continue</Link>
                  <Link className="govuk-button govuk-button--secondary" to="/application-dashboard">See all applications</Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default CpoPreSubmissionMeetingConfirmationPage;