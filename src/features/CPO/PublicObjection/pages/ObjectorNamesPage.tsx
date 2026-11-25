import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { MAX_OBJECTORS } from '../constants/objectionContent';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Provide the names of all objectors';

/** SYEIA-2937: names of everyone making the objection; each gets their own objection reference. */
const ObjectorNamesPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [names, setNames] = useState<string[]>(['']);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (journey && !loaded) {
      if (journey.objectorNames.length) setNames(journey.objectorNames);
      setLoaded(true);
    }
  }, [journey, loaded]);

  const update = (index: number, value: string) => setNames((current) => current.map((name, i) => (i === index ? value : name)));
  // At least one name field always stays (AC10).
  const remove = (index: number) => setNames((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await save(() => publicObjectionService.saveObjectorNames(names))) navigate(OBJECTION_ROUTES.CHECK_ANSWERS);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.OBJECTION} errors={errors}>
      {journey && (
        <>
          <span className="govuk-caption-l">Order {journey.reference}</span>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <p className="govuk-body">
            Provide the name of each person or organisation making this objection. Do not enter your own name if you are
            submitting on behalf of someone else.
          </p>
          <form onSubmit={submit} noValidate>
            {names.map((name, index) => {
              const id = `objector-name-${index}`;
              const error = errorFor(id);
              return (
                <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} key={index}>
                  <label className="govuk-label" htmlFor={id}>
                    Enter the objector&apos;s full name
                    {names.length > 1 && <span className="govuk-visually-hidden"> {index + 1}</span>}
                  </label>
                  {error && <p className="govuk-error-message" id={`${id}-error`}><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                  <div className="govuk-button-group govuk-!-margin-bottom-0">
                    <input
                      className={`govuk-input govuk-!-width-one-half${error ? ' govuk-input--error' : ''}`}
                      id={id}
                      name={id}
                      type="text"
                      spellCheck={false}
                      aria-describedby={error ? `${id}-error` : undefined}
                      value={name}
                      onChange={(event) => update(index, event.target.value)}
                    />
                    {names.length > 1 && (
                      <button className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" type="button" onClick={() => remove(index)}>
                        Remove<span className="govuk-visually-hidden"> objector {index + 1}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {names.length < MAX_OBJECTORS && (
              <button className="govuk-button govuk-button--secondary" type="button" onClick={() => setNames((current) => [...current, ''])}>
                Add another name
              </button>
            )}
            <div>
              <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
            </div>
          </form>
        </>
      )}
    </ObjectionPage>
  );
};

export default ObjectorNamesPage;
