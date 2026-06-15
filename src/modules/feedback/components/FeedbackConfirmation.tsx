import { CONTENT, DETAILED_SURVEY_URL } from '../constants/feedback.constants';

/**
 * Success confirmation shown after feedback submission.
 */
export default function FeedbackConfirmation() {
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
            href={DETAILED_SURVEY_URL}
            className="govuk-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONTENT.confirmationSurveyLink}
          </a>
          {CONTENT.confirmationSurveySuffix}
        </p>
      </div>
    </div>
  );
}
