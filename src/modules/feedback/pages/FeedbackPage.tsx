import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import RadioGroup from '../../../components/commonFormFields/RadioGroup';
import { captureSourcePage } from '../utils/capture-source.util';
import { extractFeedbackSourceMetadata } from '../utils/extract-feedback-source.util';
import FeedbackConfirmation from '../components/FeedbackConfirmation';
import {
  CONTENT,
  DETAILED_SURVEY_URL,
  COMPLETED_TASK_OPTIONS,
  SATISFACTION_OPTIONS,
  EASE_OPTIONS,
  ROLE_OPTIONS,
  IMPROVEMENTS_MAX_LENGTH,
  ERROR_ANCHORS,
  type ErrorField,
} from '../constants/feedback.constants';

export default function FeedbackPage() {
  const [sourceMetadata] = useState(() => {
    const sourcePath = captureSourcePage();
    if (!sourcePath) return undefined;

    const metadata = extractFeedbackSourceMetadata(sourcePath);
    return metadata.fullPath ? metadata : undefined;
  });

  const {
    values,
    errors,
    submitted,
    submitting,
    serverError,
    handleChange,
    handleSubmit,
  } = useFeedbackForm(sourceMetadata);

  useEffect(() => {
    if (submitted) {
      document.title = `${CONTENT.confirmationTitle} - GOV.UK`;
      const panel = document.querySelector('.govuk-panel');
      if (panel) {
        (panel as HTMLElement).focus();
      }
    }
  }, [submitted]);

  useEffect(() => {
    if (submitted) return;
    const hasErrors = Object.keys(errors).length > 0;
    const prefix = hasErrors || serverError ? 'Error: ' : '';
    document.title = `${prefix}${CONTENT.pageTitle} - GOV.UK`;
  }, [errors, serverError, submitted]);

  if (submitted) {
    return <FeedbackConfirmation />;
  }

  const errorEntries = Object.entries(errors) as [ErrorField, string][];
  const hasErrors = errorEntries.length > 0;

  return (
    <>
      {/* Feedback is a public page - no breadcrumb needed */}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {hasErrors && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              aria-labelledby="error-summary-title"
              role="alert"
              tabIndex={-1}
            >
              <h2 className="govuk-error-summary__title" id="error-summary-title">
                {CONTENT.errorSummaryTitle}
              </h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {errorEntries.map(([field, msg]) => (
                    <li key={field}>
                      <a href={ERROR_ANCHORS[field]}>{msg}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {serverError && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              aria-labelledby="server-error-title"
              role="alert"
              tabIndex={-1}
            >
              <h2 className="govuk-error-summary__title" id="server-error-title">
                {CONTENT.serverErrorTitle}
              </h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">{serverError}</p>
              </div>
            </div>
          )}

          <h1 className="govuk-heading-l govuk-!-margin-bottom-6">
            {CONTENT.pageTitleLine1}
            <br />
            {CONTENT.pageTitleLine2}
          </h1>

          <p className="govuk-body govuk-!-margin-bottom-4">{CONTENT.pageIntro}</p>
          <p className="govuk-body govuk-!-margin-bottom-6">
            {CONTENT.pageIntroDetailedSurveyPrefix}
            <a
              href={DETAILED_SURVEY_URL}
              className="govuk-link"
              {...(DETAILED_SURVEY_URL !== '#'
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {CONTENT.pageIntroDetailedSurveyLink}
            </a>
            {CONTENT.pageIntroDetailedSurveyLine1Suffix}
            <br />
            {CONTENT.pageIntroDetailedSurveyLine2}
          </p>

          <form
            className="govuk-!-margin-top-6"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Feedback form"
          >
            <RadioGroup
              id="satisfaction"
              name="satisfaction"
              label={CONTENT.questionSatisfaction}
              options={SATISFACTION_OPTIONS}
              value={values.satisfaction}
              error={errors.satisfaction}
              onChange={(e) => handleChange('satisfaction', e.target.value)}
            />

            <RadioGroup
              id="ease"
              name="ease"
              label={CONTENT.questionEase}
              options={EASE_OPTIONS}
              value={values.ease}
              error={errors.ease}
              onChange={(e) => handleChange('ease', e.target.value)}
            />

            <RadioGroup
              id="completedTask"
              name="completedTask"
              label={CONTENT.questionCompletedTask}
              options={COMPLETED_TASK_OPTIONS}
              value={values.completedTask}
              error={errors.completedTask}
              onChange={(e) => handleChange('completedTask', e.target.value)}
            />

            <RadioGroup
              id="userRole"
              name="userRole"
              label={CONTENT.questionRole}
              options={ROLE_OPTIONS}
              value={values.userRole}
              error={errors.userRole}
              onChange={(e) => handleChange('userRole', e.target.value)}
            />

            <div
              className={`govuk-character-count${errors.improvements ? ' govuk-form-group--error' : ''}`}
              data-module="govuk-character-count"
              data-maxlength={IMPROVEMENTS_MAX_LENGTH}
            >
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="improvements">
                  {CONTENT.questionImprovements}
                </label>
                <div id="improvements-hint" className="govuk-hint">
                  {CONTENT.improvementsHint}
                </div>
                {errors.improvements && (
                  <p className="govuk-error-message" id="improvements-error">
                    <span className="govuk-visually-hidden">Error:</span> {errors.improvements}
                  </p>
                )}
                <textarea
                  className={`govuk-textarea govuk-js-character-count${errors.improvements ? ' govuk-textarea--error' : ''}`}
                  id="improvements"
                  name="improvements"
                  rows={5}
                  maxLength={IMPROVEMENTS_MAX_LENGTH}
                  aria-describedby={[
                    'improvements-hint',
                    values.improvements ? 'improvements-info' : null,
                    errors.improvements ? 'improvements-error' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  value={values.improvements}
                  onChange={(e) => handleChange('improvements', e.target.value)}
                />
              </div>
              {values.improvements.length > 0 && (
                <div
                  id="improvements-info"
                  className="govuk-hint govuk-character-count__message govuk-character-count__message--visible"
                  aria-live="polite"
                >
                  {CONTENT.charactersRemaining(IMPROVEMENTS_MAX_LENGTH - values.improvements.length)}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
              disabled={submitting}
            >
              {submitting ? CONTENT.buttonSubmitting : CONTENT.buttonSubmit}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
