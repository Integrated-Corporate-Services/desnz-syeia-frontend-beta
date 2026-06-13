import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEEDBACK_PATH } from '../../../constants/routes';

interface PageFeedbackProps {
  onUseful?: () => void;
  onNotUseful?: () => void;
}

function PageFeedbackSection({ children }: { children: ReactNode }) {
  return (
    <div className="govuk-!-margin-top-8">
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
      <div className="govuk-!-padding-top-6">{children}</div>
    </div>
  );
}

export function PageFeedback({ onUseful, onNotUseful }: PageFeedbackProps) {
  const navigate = useNavigate();
  const [usefulAcknowledged, setUsefulAcknowledged] = useState(false);

  const handleUseful = () => {
    if (onUseful) {
      onUseful();
    } else {
      setUsefulAcknowledged(true);
    }
  };

  const handleNotUseful = () => {
    if (onNotUseful) {
      onNotUseful();
    } else {
      navigate(FEEDBACK_PATH);
    }
  };

  if (usefulAcknowledged) {
    return (
      <PageFeedbackSection>
        <p className="govuk-body">Thank you for your feedback.</p>
      </PageFeedbackSection>
    );
  }

  return (
    <PageFeedbackSection>
      <h2 className="govuk-heading-m">Is this page useful?</h2>
      <div className="govuk-button-group">
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={handleUseful}
        >
          Yes, this page is useful
        </button>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={handleNotUseful}
        >
          No, this page is not useful
        </button>
      </div>
    </PageFeedbackSection>
  );
}
