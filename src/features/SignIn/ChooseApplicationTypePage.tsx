
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { S37_BASE_URL } from '../../constants/s37';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useAuthUserContext } from '../../context/AuthUserContext';
import type { AuthUser } from '../../types/auth';


const ChooseApplicationTypePage: React.FC = () => {
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthUserContext();
  const startApplication = useApplicationStore(state => state.startApplication);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedType) {
      setError('Select an application type');
      return;
    }
    if (selectedType === 'section37') {
      navigate('/s-37/who-is-applying');
    } else if (selectedType === 'wayleaves') {
      navigate('/nwl/who-is-applying');
    } else if (selectedType === 'treefelling') {
      navigate('/tlp/who-is-applying');
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <h1 className="govuk-heading-l">Choose application type</h1>
        {error && (
          <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} style={{ marginBottom: '24px' }}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{error}</li>
              </ul>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
            <fieldset className="govuk-fieldset" aria-describedby={error ? 'applicationType-error' : undefined}>
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <span className="govuk-fieldset__heading">
                  Choose application type
                </span>
              </legend>
              {error && (
                <span className="govuk-error-message" id="applicationType-error">
                  <span className="govuk-visually-hidden">Error:</span> {error}
                </span>
              )}
              <div className="govuk-radios govuk-radios--large">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="type-section37"
                    name="applicationType"
                    type="radio"
                    value="section37"
                    checked={selectedType === 'section37'}
                    onChange={handleChange}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="type-section37">
                    Overhead electric lines (Section 37)
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="type-wayleaves"
                    name="applicationType"
                    type="radio"
                    value="wayleaves"
                    checked={selectedType === 'wayleaves'}
                    onChange={handleChange}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="type-wayleaves">
                    Necessary wayleaves
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="type-treefelling"
                    name="applicationType"
                    type="radio"
                    value="treefelling"
                    checked={selectedType === 'treefelling'}
                    onChange={handleChange}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="type-treefelling">
                    Tree felling or lopping
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <button
            type="submit"
            className="govuk-button govuk-button--start"
            data-module="govuk-button"
            style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : 'Continue'}
            {!loading && (
              <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"></path>
              </svg>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChooseApplicationTypePage;
