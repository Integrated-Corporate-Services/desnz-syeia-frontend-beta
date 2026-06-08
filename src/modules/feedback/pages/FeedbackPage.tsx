import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFeedbackForm } from '../hooks/useFeedbackForm';
import RadioGroup from '../../../components/commonFormFields/RadioGroup';
import { extractPageMetadata } from '../../../lib/page-metadata';
import { captureSourcePage } from '../utils/capture-source.util';
import FeedbackConfirmation from '../components/FeedbackConfirmation';
import {
  CONTENT,
  COMPLETED_TASK_OPTIONS,
  SATISFACTION_OPTIONS,
  EASE_OPTIONS,
  LIKELIHOOD_OPTIONS,
  IMPROVEMENTS_MAX_LENGTH,
  ERROR_ANCHORS,
  type ErrorField,
} from '../constants/feedback.constants';

export default function FeedbackPage() {
  const navigate = useNavigate();

  const [sourceMetadata] = useState(() => {
    const sourcePath = captureSourcePage();
    return sourcePath ? extractPageMetadata(sourcePath) : undefined;
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
      document.title = 'Feedback submitted - GOV.UK';
      const panel = document.querySelector('.govuk-panel');
      if (panel) {
        (panel as HTMLElement).focus();
      }
    }
  }, [submitted]);

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const prefix = hasErrors || serverError ? 'Error: ' : '';
    document.title = `${prefix}${CONTENT.pageTitle} - GOV.UK`;
  }, [errors, serverError]);

  if (submitted) {
    return <FeedbackConfirmation />;
  }

  const errorEntries = Object.entries(errors) as [ErrorField, string][];
  const hasErrors = errorEntries.length > 0;

  return (
    <>
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

      <h1 className="govuk-heading-l">{CONTENT.pageTitle}</h1>
      <p className="govuk-body">{CONTENT.pageIntro}</p>

      <form onSubmit={handleSubmit} noValidate aria-label="Feedback form">
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
          id="likelihood"
          name="likelihood"
          label={CONTENT.questionLikelihood}
          options={LIKELIHOOD_OPTIONS}
          value={values.likelihood}
          error={errors.likelihood}
          onChange={(e) => handleChange('likelihood', e.target.value)}
        />

        <div
          className={`govuk-character-count${errors.improvements ? ' govuk-form-group--error' : ''}`}
          data-module="govuk-character-count"
          data-maxlength={IMPROVEMENTS_MAX_LENGTH}
        >
          <div className="govuk-form-group">
            <h2 className="govuk-label-wrapper">
              <label className="govuk-label govuk-label--m" htmlFor="improvements">
                {CONTENT.questionImprovements}
              </label>
            </h2>
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
              rows={6}
              maxLength={IMPROVEMENTS_MAX_LENGTH}
              aria-describedby={[
                'improvements-hint',
                'improvements-info',
                errors.improvements ? 'improvements-error' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.improvements}
              onChange={(e) => handleChange('improvements', e.target.value)}
            />
          </div>
          <div
            id="improvements-info"
            className="govuk-hint govuk-character-count__message"
            aria-live="polite"
          >
            {CONTENT.charactersRemaining(IMPROVEMENTS_MAX_LENGTH - values.improvements.length)}
          </div>
        </div>

        <div className="govuk-button-group">
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? CONTENT.buttonSubmitting : CONTENT.buttonSubmit}
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            {CONTENT.buttonCancel}
          </button>
        </div>
      </form>
    </>
  );
}
