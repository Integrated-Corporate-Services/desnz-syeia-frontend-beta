import { CONTENT, DETAILED_SURVEY_URL } from '../constants/feedback.constants';

/**
 * Success confirmation shown after feedback submission.
 */
export default function FeedbackConfirmation() {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-panel govuk-panel--confirmation" tabIndex={-1}>
          <h1 className="govuk-panel__title">{CONTENT.confirmationTitle}</h1>
        </div>

        <h2 className="govuk-heading-m govuk-!-margin-top-6">{CONTENT.confirmationWhatHappensNext}</h2>
        <p className="govuk-body">{CONTENT.confirmationThankYou}</p>
        <p className="govuk-body">
          <a
            href={DETAILED_SURVEY_URL}
            className="govuk-link"
            {...(DETAILED_SURVEY_URL !== '#'
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {CONTENT.confirmationSurveyLink}
          </a>
          {CONTENT.confirmationSurveySuffix}
        </p>
      </div>
    </div>
  );
}
