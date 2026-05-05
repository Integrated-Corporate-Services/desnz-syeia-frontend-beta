interface PageFeedbackProps {
  onUseful?: () => void;
  onNotUseful?: () => void;
}

export function PageFeedback({ onUseful, onNotUseful }: PageFeedbackProps) {
  const handleUseful = () => {
    if (onUseful) {
      onUseful();
    } else {
      alert('Thank you for your feedback');
    }
  };

  const handleNotUseful = () => {
    if (onNotUseful) {
      onNotUseful();
    } else {
      alert('Thank you for your feedback. We will use it to improve the service.');
    }
  };

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
