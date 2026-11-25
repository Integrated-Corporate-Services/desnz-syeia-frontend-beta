import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Choose your postal address';
const NOT_SHOWN = 'not-shown';

/** SYEIA-2930: pick one of the addresses found for the postcode. */
const ChooseAddressPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [choice, setChoice] = useState('');
  const error = errorFor('address');
  const results = journey?.addressSearch.results ?? [];

  useEffect(() => {
    // Nothing to choose from (for example after a refresh), so go back to the search.
    if (journey && journey.addressSearch.status !== 'found') navigate(OBJECTION_ROUTES.ADDRESS, { replace: true });
  }, [journey, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (choice === NOT_SHOWN) {
      navigate(OBJECTION_ROUTES.MANUAL_ADDRESS);
      return;
    }
    if (await save(() => publicObjectionService.selectAddress(choice))) navigate(OBJECTION_ROUTES.WHO_IS_OBJECTING);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.ADDRESS} errors={errors}>
      {results.length > 0 && (
        <form onSubmit={submit} noValidate>
          <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={error ? 'address-error' : undefined}>
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h1 className="govuk-fieldset__heading">{HEADING}</h1>
              </legend>
              {error && <p className="govuk-error-message" id="address-error"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
              <div className="govuk-radios" data-module="govuk-radios">
                {results.map((result, index) => (
                  <div className="govuk-radios__item" key={result.id}>
                    <input
                      className="govuk-radios__input"
                      id={index === 0 ? 'address' : `address-${index}`}
                      name="address"
                      type="radio"
                      value={result.id}
                      checked={choice === result.id}
                      onChange={() => setChoice(result.id)}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={index === 0 ? 'address' : `address-${index}`}>{result.label}</label>
                  </div>
                ))}
                <div className="govuk-radios__divider">or</div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="address-not-shown" name="address" type="radio" value={NOT_SHOWN} checked={choice === NOT_SHOWN} onChange={() => setChoice(NOT_SHOWN)} />
                  <label className="govuk-label govuk-radios__label" htmlFor="address-not-shown">My address is not shown here</label>
                </div>
              </div>
            </fieldset>
          </div>
          <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
        </form>
      )}
    </ObjectionPage>
  );
};

export default ChooseAddressPage;
