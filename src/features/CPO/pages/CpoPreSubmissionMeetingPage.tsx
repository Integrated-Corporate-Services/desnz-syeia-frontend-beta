import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { CPO_BASE_URL } from '../../../constants/cpo';
import { applicationApiService } from '../../../services/applicationApiService';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

const CpoPreSubmissionMeetingPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const [requested, setRequested] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const [selectionError, setSelectionError] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const heading = 'Do you want a pre-submission meeting?';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError('');
    setRequested(null);
    applicationApiService.getApplicationById(applicationId)
      .then((application) => {
        if (!active) return;
        if (application.type !== 'CPO') throw new Error('This page is only available for compulsory purchase order applications.');
        if (application.pre_submission_meeting_requested_at) {
          navigate(`${CPO_BASE_URL}/${applicationId}/pre-submission-meeting/confirmation`, { replace: true });
          return;
        }
        if (application.permissions?.canEdit === false) throw new Error('You cannot update this application.');
        setRequested(application.pre_submission_meeting_requested ?? null);
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

  const selectAnswer = (answer: boolean) => {
    setRequested(answer);
    if (selectionError) {
      setSelectionError(false);
      setError('');
    }
  };

  const save = async (complete: boolean) => {
    if (loading || saving || loadFailed) return;
    if (complete && requested === null) {
      setSelectionError(true);
      setError('Select yes or no to tell us if you want a pre-submission meeting');
      return;
    }
    setSelectionError(false);
    setError('');
    setSaving(true);
    try {
      await applicationApiService.saveCpoPreSubmissionMeeting(applicationId, requested, complete);
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
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary" tabIndex={-1} ref={errorSummary} role="alert" aria-labelledby="meeting-error-title">
                <h2 className="govuk-error-summary__title" id="meeting-error-title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li><a href={selectionError ? '#meeting-yes' : '#meeting-heading'}>{error}</a></li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={(event) => { event.preventDefault(); void save(true); }}>
              <div className={`govuk-form-group${selectionError ? ' govuk-form-group--error' : ''}`}>
                <fieldset className="govuk-fieldset" disabled={loading || saving || loadFailed} aria-describedby={`meeting-hint${selectionError ? ' meeting-error' : ''}`}>
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading" id="meeting-heading">{heading}</h1>
                  </legend>
                  <div className="govuk-hint" id="meeting-hint">
                    A meeting with the Energy Infrastructure Planning Delivery (EIPD) team helps make sure your application includes everything it needs.
                  </div>
                  {selectionError && <p className="govuk-error-message" id="meeting-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="meeting-yes" name="meeting-requested" type="radio" value="yes" checked={requested === true} onChange={() => selectAnswer(true)} />
                      <label className="govuk-label govuk-radios__label" htmlFor="meeting-yes">Yes</label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="meeting-no" name="meeting-requested" type="radio" value="no" checked={requested === false} onChange={() => selectAnswer(false)} />
                      <label className="govuk-label govuk-radios__label" htmlFor="meeting-no">No</label>
                    </div>
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