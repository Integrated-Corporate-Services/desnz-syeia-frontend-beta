import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RadioGroup from '../../../../components/commonFormFields/RadioGroup';
import ObjectionPage from '../components/ObjectionPage';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionAction } from '../types/objectionJourney';

const QUESTION = 'Do you want to submit or withdraw an objection for this CPO?';

const ACTION_OPTIONS = [
  { value: 'submit', label: 'Submit a new objection' },
  { value: 'withdraw', label: 'Withdraw an objection I have submitted' },
];

/** SYEIA-2925: confirm the CPO and choose to submit or withdraw an objection. */
const WhatDoYouWantToDoPage: React.FC = () => {
  const { journey, loading, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [action, setAction] = useState('');

  useEffect(() => {
    if (journey?.action) setAction(journey.action);
  }, [journey?.action]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await save(() => publicObjectionService.chooseAction((action || null) as ObjectionAction | null));
    if (saved) navigate(saved.action === 'withdraw' ? OBJECTION_ROUTES.EMAIL : OBJECTION_ROUTES.FULL_NAME);
  };

  return (
    <ObjectionPage title={QUESTION} backTo={OBJECTION_ROUTES.REFERENCE} errors={errors}>
      {journey && (
        <>
          <span className="govuk-caption-l">Order {journey.reference}</span>
          <h1 className="govuk-heading-l">{journey.title || journey.reference}</h1>
          {journey.organisation && <p className="govuk-body">This CPO was made by {journey.organisation}.</p>}
          <p className="govuk-body">
            If this is not correct,{' '}
            <Link className="govuk-link" to={OBJECTION_ROUTES.REFERENCE}>enter a different CPO reference number</Link>.
          </p>
          <form onSubmit={submit} noValidate>
            <RadioGroup
              id="action"
              name="action"
              label={QUESTION}
              value={action}
              error={errorFor('action-submit')}
              options={ACTION_OPTIONS}
              onChange={(event) => setAction(event.target.value)}
            />
            <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
          </form>
        </>
      )}
      {loading && <p className="govuk-body" role="status">Loading...</p>}
    </ObjectionPage>
  );
};

export default WhatDoYouWantToDoPage;
