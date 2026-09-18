import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FirErrorSummary, FirRequestDetails } from '../components';
import { FIR_MESSAGES } from '../constants/fir.constants';
import { useFirRequest, useFirRoute } from '../hooks';

export const FirUploadDecisionPage: React.FC = () => {
  const { applicationId, requestId, requestPath } = useFirRoute();
  const { request, error, setError } = useFirRequest(applicationId, requestId);
  const navigate = useNavigate();
  const [choice, setChoice] = useState<'yes' | 'no' | ''>('');

  if (!applicationId || !requestId) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!choice) {
      setError(FIR_MESSAGES.UPLOAD_CHOICE_REQUIRED);
      return;
    }
    navigate(choice === 'yes'
      ? `${requestPath}/${requestId}/document-types`
      : `${requestPath}/${requestId}/provide-information`);
  };

  return (
    <div className="govuk-width-container">
      <Link className="govuk-back-link" to={requestPath}>Back</Link>
      <FirErrorSummary error={error} />
      <form onSubmit={submit} noValidate>
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
            <h1 className="govuk-fieldset__heading">Are you uploading documents as part of this request?</h1>
          </legend>
          <p className="govuk-hint">If you do not upload any documents, you will be able to provide the requested information as text on the next page.</p>
          <div className="govuk-radios">
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="documents-yes" type="radio" name="documents" checked={choice === 'yes'} onChange={() => setChoice('yes')} />
              <label className="govuk-label govuk-radios__label" htmlFor="documents-yes">Yes</label>
            </div>
            <div className="govuk-radios__item">
              <input className="govuk-radios__input" id="documents-no" type="radio" name="documents" checked={choice === 'no'} onChange={() => setChoice('no')} />
              <label className="govuk-label govuk-radios__label" htmlFor="documents-no">No</label>
            </div>
          </div>
        </fieldset>
        <button className="govuk-button govuk-!-margin-top-5" type="submit">Save and continue</button>
      </form>
      {request && <FirRequestDetails request={request} />}
    </div>
  );
};
