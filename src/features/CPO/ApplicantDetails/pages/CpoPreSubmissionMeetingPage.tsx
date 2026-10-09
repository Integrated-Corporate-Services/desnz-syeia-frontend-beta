import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { applicationApiService } from '../../../../services/applicationApiService';
import type { CpoMeetingAnswer } from '../../../../services/applicationApiService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoPreSubmissionMeetingPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<CpoMeetingAnswer | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const [selectionError, setSelectionError] = useState(false);
  const [reasonError, setReasonError] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const heading = 'Have you had a pre-application meeting?';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError('');
    setAnswer(null);
    setReason('');
    applicationApiService.getApplicationById(applicationId)
      .then((application) => {
        if (!active) return;
        if (application.type !== 'CPO') throw new Error('This page is only available for compulsory purchase order applications.');
        if (application.pre_submission_meeting_requested_at) {
          navigate(`${CPO_BASE_URL}/${applicationId}/pre-submission-meeting/confirmation`, { replace: true });
          return;
        }
        if (application.permissions?.canEdit === false) throw new Error('You cannot update this application.');
        setAnswer(application.pre_submission_meeting_answer
          ?? (application.pre_submission_meeting_requested === true ? 'request-meeting'
            : application.pre_submission_meeting_requested === false ? 'not-needed' : null));
        setReason(application.pre_submission_meeting_reason || '');
      })
      .catch((failure) => {
        if (!active) return;
        setLoadFailed(true);
        setError(failure instanceof Error ? failure.message : 'Unable to load your answer. Refresh the page to try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, navigate]);

  useEffect(() => {
    if (error) errorSummary.current?.focus();
  }, [error]);

  const selectAnswer = (value: CpoMeetingAnswer) => {
    setAnswer(value);
    if (selectionError || reasonError) {
      setSelectionError(false);
      setReasonError(false);
      setError('');
    }
  };

  const save = async (complete: boolean) => {
    if (loading || saving || loadFailed) return;
    if (complete && answer === null) {
      setSelectionError(true);
      setError('Select whether you have had a pre-application meeting');
      return;
    }
    if (answer === 'not-needed' && ((complete && !reason.trim()) || reason.trim().length > 4000)) {
      setReasonError(true);
      setError(reason.trim().length > 4000 ? 'The reason must be 4,000 characters or fewer' : "Tell us why you don't need this meeting");
      return;
    }
    setSelectionError(false);
    setReasonError(false);
    setError('');
    setSaving(true);
    try {
      await applicationApiService.saveCpoPreSubmissionMeeting(applicationId, answer === null ? null : answer === 'request-meeting', complete, {
        answer, reason: answer === 'not-needed' ? reason.trim() : '',
      });
      navigate(!complete
        ? '/application-dashboard'
        : `${CPO_BASE_URL}/${applicationId}/pre-submission-meeting/confirmation`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to save your answer. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title={error ? `Error: ${heading}` : heading} />
      <div className="govuk-width-container">
        <Link className="govuk-back-link govuk-!-margin-bottom-6" to={`${CPO_BASE_URL}/${applicationId}/task-list`}>Back</Link>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary" tabIndex={-1} ref={errorSummary} role="alert" aria-labelledby="meeting-error-title">
                <h2 className="govuk-error-summary__title" id="meeting-error-title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li><a href={selectionError ? '#meeting-had' : reasonError ? '#meeting-reason' : '#meeting-heading'}>{error}</a></li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={(event) => { event.preventDefault(); void save(true); }}>
              <div className={`govuk-form-group${selectionError ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" disabled={loading || saving || loadFailed} aria-describedby={`meeting-hint${selectionError ? ' meeting-error' : ''}`}>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <span className="govuk-caption-l">Pre-application meeting</span>
                    <h1 className="govuk-fieldset__heading" id="meeting-heading">{heading}</h1>
                  </legend>
                  <div className="govuk-hint" id="meeting-hint">
                    We highly recommend having a pre-application meeting with a DESNZ case officer ahead of submitting your application.
                  </div>
                  {selectionError && <p className="govuk-error-message" id="meeting-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="meeting-had" name="meeting-answer" type="radio" value="had-meeting" checked={answer === 'had-meeting'} onChange={() => selectAnswer('had-meeting')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="meeting-had">Yes, I've had this meeting</label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="meeting-request" name="meeting-answer" type="radio" value="request-meeting" checked={answer === 'request-meeting'} onChange={() => selectAnswer('request-meeting')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="meeting-request">No, I would like a pre-application meeting</label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="meeting-not-needed" name="meeting-answer" type="radio" value="not-needed" checked={answer === 'not-needed'} aria-controls="meeting-reason-panel" aria-expanded={answer === 'not-needed'} onChange={() => selectAnswer('not-needed')} />
                      <label className="govuk-label govuk-radios__label" htmlFor="meeting-not-needed">No, I don't need this meeting</label>
                    </div>
                    {answer === 'not-needed' && (
                      <div className="govuk-radios__conditional" id="meeting-reason-panel">
                        <div className={`govuk-form-group${reasonError ? ' govuk-form-group--error' : ''}`}>
                          <label className="govuk-label" htmlFor="meeting-reason">Tell us why you don't need this meeting</label>
                          {reasonError && <p className="govuk-error-message" id="meeting-reason-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                          <textarea className={`govuk-textarea${reasonError ? ' govuk-textarea--error' : ''}`} id="meeting-reason" name="meeting-reason" rows={5} maxLength={4000} aria-describedby={`meeting-reason-hint${reasonError ? ' meeting-reason-error' : ''}`} value={reason} onChange={event => {
                            setReason(event.target.value);
                            if (reasonError) { setReasonError(false); setError(''); }
                          }} />
                          <div className="govuk-hint" id="meeting-reason-hint">You can enter up to 4,000 characters</div>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>
              {loading && <p className="govuk-body" role="status">Loading your answer...</p>}
              <div className="govuk-button-group">
                <button className="govuk-button" type="submit" disabled={loading || saving || loadFailed}>Save and continue</button>
                <button className="govuk-button govuk-button--secondary" type="button" disabled={loading || saving || loadFailed} onClick={() => void save(false)}>Save for later</button>
              </div>
              {saving && <p className="govuk-body" role="status">Saving your answer...</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CpoPreSubmissionMeetingPage;