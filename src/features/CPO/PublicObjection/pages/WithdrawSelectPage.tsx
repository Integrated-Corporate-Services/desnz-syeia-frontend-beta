import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ObjectionPage from '../components/ObjectionPage';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { useWithdrawableObjections } from '../hooks/useWithdrawableObjections';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Which objections do you want to withdraw?';
const NONE_HEADING = 'There are no objections to withdraw';

/** SYEIA-2943: choose which objections to withdraw. With only one, go straight to confirming it. */
const WithdrawSelectPage: React.FC = () => {
  const { journey, saving, errors, errorFor, clearError, act, navigate } = useObjectionForm();
  const { withdrawable, loadError } = useWithdrawableObjections();
  // Until the user ticks something, show the choice saved on an earlier visit.
  const [picked, setPicked] = useState<string[] | null>(null);
  const selected = picked ?? withdrawable?.selected ?? [];
  const error = errorFor('withdraw-selection');
  const objections = withdrawable?.objections ?? [];

  useEffect(() => {
    if (withdrawable?.objections.length === 1) navigate(OBJECTION_ROUTES.WITHDRAW_CONFIRM, { replace: true });
  }, [withdrawable, navigate]);

  const toggle = (objectionId: string) =>
    setPicked(selected.includes(objectionId) ? selected.filter((id) => id !== objectionId) : [...selected, objectionId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await act(() => publicObjectionService.selectForWithdrawal(selected))) navigate(OBJECTION_ROUTES.WITHDRAW_CONFIRM);
  };

  if (loadError) return <p className="govuk-body">{loadError}</p>;
  if (!journey || !withdrawable || objections.length === 1) return null;

  if (!objections.length) {
    return (
      <ObjectionPage title={NONE_HEADING} backTo={OBJECTION_ROUTES.EMAIL} errors={[]}>
        <span className="govuk-caption-l">Order {journey.reference}</span>
        <h1 className="govuk-heading-l">{NONE_HEADING}</h1>
        <p className="govuk-body">
          We could not find any objections to this CPO submitted using {journey.email}, or they have already been withdrawn.
        </p>
        <p className="govuk-body">
          <Link className="govuk-link" to={OBJECTION_ROUTES.START}>Submit or withdraw another objection to a CPO</Link>
        </p>
      </ObjectionPage>
    );
  }

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.EMAIL} errors={errors}>
      <form onSubmit={submit} noValidate>
        <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
          <fieldset className="govuk-fieldset" aria-describedby={`withdraw-selection-hint${error ? ' withdraw-selection-error' : ''}`}>
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <span className="govuk-caption-l">Order {journey.reference}</span>
              <h1 className="govuk-fieldset__heading">{HEADING}</h1>
            </legend>
            <div className="govuk-hint" id="withdraw-selection-hint">Select all objections to be withdrawn</div>
            {error && <p className="govuk-error-message" id="withdraw-selection-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
              {objections.map((objection, index) => {
                const id = index === 0 ? 'withdraw-selection' : `withdraw-selection-${index}`;
                return (
                  <div className="govuk-checkboxes__item" key={objection.objectionId}>
                    <input
                      className="govuk-checkboxes__input"
                      id={id}
                      name="withdraw-selection"
                      type="checkbox"
                      value={objection.objectionId}
                      aria-describedby={`${id}-hint`}
                      checked={selected.includes(objection.objectionId)}
                      onChange={() => { toggle(objection.objectionId); clearError('withdraw-selection'); }}
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>{objection.objectorName}</label>
                    <div className="govuk-hint govuk-checkboxes__hint" id={`${id}-hint`}>{objection.objectionReference}</div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </div>
        <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
      </form>
    </ObjectionPage>
  );
};

export default WithdrawSelectPage;
