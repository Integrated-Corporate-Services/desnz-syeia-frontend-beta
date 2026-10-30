import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';
import { cpoProjectOverviewService } from '../services/cpoProjectOverviewService';
import {
  EMPTY_PROJECT_OVERVIEW,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_OVERVIEW_COPY as COPY,
  PROJECT_OVERVIEW_ERRORS as ERRORS,
  PROJECT_SUMMARY_MAX_LENGTH,
} from '../constants/projectOverviewConstants';
import type { ProjectOverview } from '../types/projectOverview';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';
import '../../styles/cpo.css';

type FormError = { id: string; message: string };

const summaryCount = (summary: string) => {
  const remaining = PROJECT_SUMMARY_MAX_LENGTH - summary.length;
  if (remaining < 0) return `You have ${Math.abs(remaining).toLocaleString('en-GB')} character${remaining === -1 ? '' : 's'} too many`;
  if (remaining === 0) return 'You have 0 characters remaining';
  if (remaining === 1) return 'You have 1 character remaining';
  return `You can enter up to ${remaining.toLocaleString('en-GB')} characters`;
};

const CpoProjectOverviewPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [details, setDetails] = useState<ProjectOverview>(EMPTY_PROJECT_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [errors, setErrors] = useState<FormError[]>([]);
  const errorSummary = useRef<HTMLDivElement>(null);
  const taskListUrl = `${CPO_BASE_URL}/${applicationId}/task-list`;

  useBreadcrumb(<Link className="govuk-back-link" to={taskListUrl}>Back</Link>);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setErrors([]);
    cpoProjectOverviewService.get(applicationId).then((result) => {
      if (!active) return;
      setDetails({ ...EMPTY_PROJECT_OVERVIEW, ...result.details });
    }).catch((error) => {
      if (!active) return;
      setLoadFailed(true);
      setErrors([{ id: 'project-overview-heading', message: error instanceof Error ? error.message : 'Unable to load the project overview. Refresh the page.' }]);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId]);

  // Focus the error summary only when errors first appear, so clearing one while typing doesn't move focus (as S37).
  const hadErrors = useRef(false);
  useEffect(() => {
    if (errors.length && !hadErrors.current) errorSummary.current?.focus();
    hadErrors.current = errors.length > 0;
  }, [errors]);

  // Like S37's clearFieldError: typing in a field removes its inline error and its error summary entry.
  const clearFieldError = (id: string) => setErrors((current) => current.filter((error) => error.id !== id));
  const errorFor = (id: string) => errors.find((error) => error.id === id)?.message;
  const inlineError = (id: string) => errorFor(id) && <p className="govuk-error-message" id={`${id}-error`}><span className="govuk-visually-hidden">Error:</span> {errorFor(id)}</p>;

  const validate = (): FormError[] => {
    const result: FormError[] = [];
    const projectName = details.projectName.trim();
    const projectSummary = details.projectSummary.trim();
    if (!projectName) result.push({ id: 'projectName', message: ERRORS.projectNameRequired });
    else if (projectName.length > PROJECT_NAME_MAX_LENGTH) result.push({ id: 'projectName', message: ERRORS.projectNameMax });
    if (!projectSummary) result.push({ id: 'projectSummary', message: ERRORS.projectSummaryRequired });
    else if (projectSummary.length > PROJECT_SUMMARY_MAX_LENGTH) result.push({ id: 'projectSummary', message: ERRORS.projectSummaryMax });
    return result;
  };

  const save = async () => {
    if (loading || saving || loadFailed) return;
    const validationErrors = validate();
    if (validationErrors.length) { setErrors(validationErrors); return; }
    setSaving(true);
    setErrors([]);
    try {
      await cpoProjectOverviewService.save(applicationId, {
        projectName: details.projectName.trim(),
        projectSummary: details.projectSummary.trim(),
      });
      navigate(taskListUrl);
    } catch (error) {
      setErrors([{ id: 'project-overview-heading', message: error instanceof Error ? error.message : 'Unable to save the project overview. Try again.' }]);
    } finally { setSaving(false); }
  };

  const nameError = errorFor('projectName');
  const summaryError = errorFor('projectSummary');
  const count = summaryCount(details.projectSummary);

  return <>
    <PageTitle title={`${errors.length ? 'Error: ' : ''}${COPY.heading}`} />
    <div className="govuk-width-container cpo-order-details">
    <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {errors.length > 0 && <div className="govuk-error-summary" role="alert" tabIndex={-1} ref={errorSummary} aria-labelledby="project-overview-error-title">
        <h2 className="govuk-error-summary__title" id="project-overview-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">{errors.map((error, index) => <li key={`${error.id}-${index}`}><a href={`#${error.id}`}>{error.message}</a></li>)}</ul></div>
      </div>}
      <h1 className="govuk-heading-l" id="project-overview-heading" tabIndex={-1}>{COPY.heading}</h1>
      {loading && <p className="govuk-body" role="status">Loading project overview...</p>}
      <form noValidate onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <fieldset className="govuk-fieldset" disabled={loading || saving || loadFailed}>
          <legend className="govuk-visually-hidden">{COPY.heading}</legend>
          <div className={`govuk-form-group${nameError ? ' govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-label--s" htmlFor="projectName">{COPY.projectNameLabel}</label>
            {inlineError('projectName')}
            <input className={`govuk-input${nameError ? ' govuk-input--error' : ''}`} id="projectName" name="projectName" type="text" value={details.projectName} maxLength={PROJECT_NAME_MAX_LENGTH} onChange={(event) => { setDetails((current) => ({ ...current, projectName: event.target.value })); clearFieldError('projectName'); }} aria-describedby={nameError ? 'projectName-error' : undefined} />
          </div>
          <div className="govuk-character-count">
            <div className={`govuk-form-group${summaryError ? ' govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--s" htmlFor="projectSummary">{COPY.projectSummaryLabel}</label>
              <div className="govuk-hint" id="projectSummary-hint">{COPY.projectSummaryHint}</div>
              {inlineError('projectSummary')}
              <textarea className={`govuk-textarea${summaryError || details.projectSummary.length > PROJECT_SUMMARY_MAX_LENGTH ? ' govuk-textarea--error' : ''}`} id="projectSummary" name="projectSummary" rows={5} value={details.projectSummary} onChange={(event) => { setDetails((current) => ({ ...current, projectSummary: event.target.value })); clearFieldError('projectSummary'); }} aria-describedby={`projectSummary-hint projectSummary-info${summaryError ? ' projectSummary-error' : ''}`} />
              <div className="govuk-hint govuk-visually-hidden" id="projectSummary-info">You can enter up to {PROJECT_SUMMARY_MAX_LENGTH.toLocaleString('en-GB')} characters</div>
              <div className={`govuk-character-count__message govuk-character-count__status ${details.projectSummary.length > PROJECT_SUMMARY_MAX_LENGTH ? 'govuk-error-message' : 'govuk-hint'}`} aria-hidden="true">{count}</div>
              <div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">{count}</div>
            </div>
          </div>
          <div className="govuk-button-group govuk-!-margin-top-6"><button className="govuk-button" type="submit">Save and continue</button></div>
        </fieldset>
      </form>
      {saving && <p className="govuk-body" role="status">Saving project overview...</p>}
    </div></div></div>
  </>;
};

export default CpoProjectOverviewPage;
