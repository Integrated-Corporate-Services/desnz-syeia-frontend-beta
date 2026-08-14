import React, { useEffect, useState } from 'react';
import { S37_BASE_URL } from '../../../constants/s37';
import { useNavigate } from 'react-router-dom';
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';
import SkipLink from '../../../components/SkipLink';

const CONFIRMATION_HEADING = 'Your consultation request has been sent';

const ConsultationRequestSent: React.FC = () => {
  const navigate = useNavigate();
  // Get applicationId from query params or state
  const applicationId = useGetApplicationId();
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${CONFIRMATION_HEADING} - GOV.UK`;
    const frame = window.requestAnimationFrame(() => {
      setStatusAnnouncement(CONFIRMATION_HEADING);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleBack = () => {
    if (applicationId) {
  navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } else {
      navigate('/consultation-details');
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-three-quarters">
            <div className="govuk-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
              {statusAnnouncement}
            </div>
            <div className="govuk-panel govuk-panel--confirmation" style={{ marginTop: 40 }}>
              <h1 className="govuk-panel__title">{CONFIRMATION_HEADING}</h1>
            </div>
            <div className="govuk-body" style={{ marginTop: 32 }}>
              <h2>What happens next</h2>
              <p>The details and documents you’ve selected have been sent to the organisations required for your application.</p>
              <p>You will be notified when a response to your consultation request has been received. You will then need to upload the response before submitting your application as complete.</p>
              <p>If you have any questions, you can contact <a href="mailto:S37consents@energysecurity.gov.uk">S37consents@energysecurity.gov.uk</a></p>
            </div>
            <button className="govuk-button" style={{ marginTop: 32 }} onClick={handleBack}>
              Back to consultation details
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ConsultationRequestSent;
