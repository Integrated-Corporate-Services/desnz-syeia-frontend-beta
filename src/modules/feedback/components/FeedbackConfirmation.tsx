import { useNavigate } from 'react-router-dom';
import { CONTENT } from '../constants/feedback.constants';

/**
 * Success confirmation panel shown after feedback submission.
 */
export default function FeedbackConfirmation() {
  const navigate = useNavigate();

  return (
    <>
      <div className="govuk-panel govuk-panel--confirmation" tabIndex={-1}>
        <h1 className="govuk-panel__title">{CONTENT.confirmationTitle}</h1>
        <div className="govuk-panel__body">{CONTENT.confirmationMessage}</div>
      </div>
      <p className="govuk-body govuk-!-margin-top-6">
        <a
          href="/workbasket"
          className="govuk-link"
          onClick={(e) => {
            e.preventDefault();
            navigate('/workbasket');
          }}
        >
          {CONTENT.confirmationReturnLink}
        </a>
      </p>
    </>
  );
}
