import { CONTENT } from '../constants/feedback.constants';
import { useFeedbackSurveyUrl } from '../hooks/useFeedbackSurveyUrl';

export default function FeedbackConfirmation() {
  const { url } = useFeedbackSurveyUrl();

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-6" tabIndex={-1}>
          <h1 className="govuk-panel__title">{CONTENT.confirmationTitle}</h1>
        </div>

        <h2 className="govuk-heading-m govuk-!-margin-bottom-4">{CONTENT.confirmationWhatHappensNext}</h2>
        <p className="govuk-body govuk-!-margin-bottom-4">{CONTENT.confirmationThankYou}</p>
        <p className="govuk-body">
          <a
            href={url}
            className="govuk-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Complete our detailed survey (opens in a new tab)"
          >
            {CONTENT.confirmationSurveyLink}
          </a>
          {CONTENT.confirmationSurveySuffix}
        </p>
      </div>
    </div>
  );
}
