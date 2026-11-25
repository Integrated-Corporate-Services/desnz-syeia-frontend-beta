import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ObjectionPage from '../components/ObjectionPage';
import CpoOrderSummaryCard from '../components/CpoOrderSummaryCard';
import WithdrawableObjectionSummaryCard from '../components/WithdrawableObjectionSummaryCard';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { characterCountMessage, OBJECTION_DETAILS_MAX_LENGTH, OBJECTION_GUIDANCE_URL } from '../constants/objectionContent';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { useWithdrawableObjections } from '../hooks/useWithdrawableObjections';
import { publicObjectionService } from '../services/publicObjectionService';

const COPY = {
  single: {
    heading: 'Confirm you want to withdraw this objection',
    confirm: 'I confirm I want to withdraw this objection and understand this action cannot be undone.',
  },
  multiple: {
    heading: 'Confirm you want to withdraw these objections',
    confirm: 'I confirm I want to withdraw these objections and understand this action cannot be undone.',
  },
};

/** SYEIA-2946: check the objections being withdrawn, give an optional reason and confirm. */
const WithdrawConfirmPage: React.FC = () => {
  const { journey, saving, errors, errorFor, act, navigate } = useObjectionForm();
  const { withdrawable, loadError } = useWithdrawableObjections();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const reasonError = errorFor('withdrawal-reason');
  const confirmError = errorFor('withdraw-confirmed');

  const available = withdrawable?.objections ?? [];
  const selected = withdrawable?.selected ?? [];
  // With only one objection nothing is selected: that one is withdrawn (SYEIA-2943).
  const objections = selected.length ? available.filter((objection) => selected.includes(objection.objectionId))
    : available.length === 1 ? available : [];

  useEffect(() => {
    // Nothing chosen yet, or the choice is no longer withdrawable: choose again.
    if (withdrawable && !objections.length) navigate(OBJECTION_ROUTES.WITHDRAW, { replace: true });
  }, [withdrawable, objections.length, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await act(() => publicObjectionService.withdraw(reason, confirmed))) navigate(OBJECTION_ROUTES.WITHDRAWN);
  };

  if (loadError) return <p className="govuk-body">{loadError}</p>;
  if (!journey || !objections.length) return null;

  const copy = objections.length > 1 ? COPY.multiple : COPY.single;
  const overLimit = reason.length > OBJECTION_DETAILS_MAX_LENGTH;

  return (
    <ObjectionPage title={copy.heading} backTo={available.length > 1 ? OBJECTION_ROUTES.WITHDRAW : OBJECTION_ROUTES.EMAIL} errors={errors}>
      <span className="govuk-caption-l">Order {journey.reference}</span>
      <h1 className="govuk-heading-l">{copy.heading}</h1>
      <CpoOrderSummaryCard reference={journey.reference} title={journey.title} />
      {objections.map((objection) => <WithdrawableObjectionSummaryCard key={objection.objectionId} objection={objection} />)}
      <form onSubmit={submit} noValidate>
        <div className={`govuk-form-group govuk-character-count${reasonError ? ' govuk-form-group--error' : ''}`}>
          <h2 className="govuk-label-wrapper">
            <label className="govuk-label govuk-label--m" htmlFor="withdrawal-reason">Reason for withdrawing (optional)</label>
          </h2>
          <div className="govuk-hint" id="withdrawal-reason-hint">
            For example, you have reached an agreement with the organisation that made the order.{' '}
            <a className="govuk-link" href={OBJECTION_GUIDANCE_URL} target="_blank" rel="noreferrer noopener">
              Read the guidance on objecting to a CPO (opens in a new tab)
            </a>
          </div>
          {reasonError && (
            <p className="govuk-error-message" id="withdrawal-reason-error">
              <span className="govuk-visually-hidden">Error:</span> {reasonError}
            </p>
          )}
          <textarea
            className={`govuk-textarea${reasonError || overLimit ? ' govuk-textarea--error' : ''}`}
            id="withdrawal-reason"
            name="withdrawal-reason"
            rows={5}
            aria-describedby={`withdrawal-reason-hint withdrawal-reason-count${reasonError ? ' withdrawal-reason-error' : ''}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <div
            id="withdrawal-reason-count"
            className={`govuk-character-count__message${overLimit ? ' govuk-error-message' : ' govuk-hint'}`}
            aria-live="polite"
          >
            {characterCountMessage(reason.length)}
          </div>
        </div>
        <div className={`govuk-form-group${confirmError ? ' govuk-form-group--error' : ''}`}>
          {confirmError && (
            <p className="govuk-error-message" id="withdraw-confirmed-error">
              <span className="govuk-visually-hidden">Error:</span> {confirmError}
            </p>
          )}
          <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="withdraw-confirmed"
                name="withdraw-confirmed"
                type="checkbox"
                aria-describedby={confirmError ? 'withdraw-confirmed-error' : undefined}
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="withdraw-confirmed">{copy.confirm}</label>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button className="govuk-button govuk-button--warning" type="submit" disabled={saving}>
            {objections.length > 1 ? 'Withdraw objections' : 'Withdraw objection'}
          </button>
          <Link className="govuk-link" to={OBJECTION_ROUTES.START}>Cancel</Link>
        </div>
      </form>
    </ObjectionPage>
  );
};

export default WithdrawConfirmPage;
