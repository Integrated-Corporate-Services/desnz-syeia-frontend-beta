import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTOR_TYPE_LABELS } from '../constants/objectionContent';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';
import type { ObjectorType } from '../types/objectionJourney';

const HEADING = 'Who are you submitting this objection for?';

const OPTIONS: { value: ObjectorType; id: string; label: string; hint: string }[] = [
  { value: 'myself', id: 'objector-type', label: OBJECTOR_TYPE_LABELS.myself, hint: 'You are submitting your own objection' },
  { value: 'organisation', id: 'objector-type-organisation', label: OBJECTOR_TYPE_LABELS.organisation, hint: 'You are submitting an objection for your organisation' },
  {
    value: 'representative',
    id: 'objector-type-representative',
    label: OBJECTOR_TYPE_LABELS.representative,
    hint: 'You are submitting an objection as a 3rd party representative, such as a solicitor, land agent or family member',
  },
];

/** SYEIA-2931: who the objection is for; decides whether objector names are asked for. */
const WhoIsObjectingPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate, changing, withChange } = useObjectionForm();
  const [objectorType, setObjectorType] = useState<ObjectorType | null>(null);
  const error = errorFor('objector-type');

  useEffect(() => {
    if (journey?.objectorType) setObjectorType(journey.objectorType);
  }, [journey?.objectorType]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await save(() => publicObjectionService.chooseObjectorType(objectorType));
    if (!saved) return;
    if (!changing) navigate(OBJECTION_ROUTES.OBJECTION);
    // Changing to an organisation or representative from check your answers still needs the objector names.
    else if (saved.objectorType !== 'myself' && !saved.objectorNames.length) navigate(withChange(OBJECTION_ROUTES.OBJECTOR_NAMES));
    else navigate(OBJECTION_ROUTES.CHECK_ANSWERS);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.ADDRESS} errors={errors}>
      {journey && (
        <form onSubmit={submit} noValidate>
          <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={error ? 'objector-type-error' : undefined}>
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <span className="govuk-caption-l">Order {journey.reference}</span>
                <h1 className="govuk-fieldset__heading">{HEADING}</h1>
              </legend>
              {error && <p className="govuk-error-message" id="objector-type-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
              <div className="govuk-radios" data-module="govuk-radios">
                {OPTIONS.map((option) => (
                  <div className="govuk-radios__item" key={option.value}>
                    <input
                      className="govuk-radios__input"
                      id={option.id}
                      name="objector-type"
                      type="radio"
                      value={option.value}
                      aria-describedby={`${option.id}-hint`}
                      checked={objectorType === option.value}
                      onChange={() => setObjectorType(option.value)}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={option.id}>{option.label}</label>
                    <div className="govuk-hint govuk-radios__hint" id={`${option.id}-hint`}>{option.hint}</div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
        </form>
      )}
    </ObjectionPage>
  );
};

export default WhoIsObjectingPage;
