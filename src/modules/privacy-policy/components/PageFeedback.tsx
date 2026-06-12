import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEEDBACK_PATH } from '../../../constants/routes';

interface PageFeedbackProps {
  onUseful?: () => void;
  onNotUseful?: () => void;
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
      <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #b1b4b6', paddingTop: '1.5rem' }}>
        <p className="govuk-body">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div className="govuk-!-margin-top-8" style={{ borderTop: '1px solid #b1b4b6', paddingTop: '1.5rem' }}>
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
    </div>
  );
}
