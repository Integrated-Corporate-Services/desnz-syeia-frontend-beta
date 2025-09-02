import React, { useState } from 'react';

const operatorOptions = [
  { value: '', label: 'Select one...', disabled: true },
  { value: '83124', label: 'Mr Tree Lopping Consent Npower User' },
  { value: '83112', label: 'Mr Section 37 Consent Npower User' },
];

const NetworkOperatorDetails: React.FC = () => {
  const [reference, setReference] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(operatorOptions[1].value);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <a className="govuk-breadcrumbs__link" href="/task-list">Task list</a>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">Network operator details</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Network operator details</h1>
            <form method="post">
              <input type="hidden" name="_csrf" value="_C6ETHEc3qE-Kv3Gr-egxYZsHuFkHQdb-iP5ebwyNFjd9YhGnRnlKUYp7JYTE8__zMqU8rMNM9kALjd2zkacH90GAWjolLsk" />
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="networkOperatorReference-inputValue">
                  Network operator's reference
                </label>
                <input
                  className="govuk-input"
                  id="networkOperatorReference-inputValue"
                  name="networkOperatorReference.inputValue"
                  type="text"
                  value={reference}
                  maxLength={4000}
                  onChange={e => setReference(e.target.value)}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="networkOperator" id="selector-networkOperator-label">
                  Who is the contact in the network operator organisation for this application?
                </label>
                <div id="networkOperator-hint" className="govuk-hint">
                  The section 37 consent will be issued in the name of the person selected here
                </div>
                <div className="fds-search-selector__input">
                  <select
                    id="networkOperator"
                    name="networkOperator"
                    style={{ width: '100%' }}
                    className="govuk-select"
                    aria-describedby="networkOperator-hint"
                    value={selectedOperator}
                    onChange={e => setSelectedOperator(e.target.value)}
                  >
                    {operatorOptions.map(option => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <details className="govuk-details" open={showDetails}>
                <summary className="govuk-details__summary" onClick={e => { e.preventDefault(); setShowDetails(s => !s); }}>
                  <span className="govuk-details__summary-text">The contact is not listed</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">
                    The contact must have a user account on EIP and be in the "Electricity Company: S37 Application Editor" or
                    "Electricity Company: S37 Application Submitter" roles in the network operator team.
                  </p>
                  <p className="govuk-body">
                    The network operator team can be updated from the company contacts link on the left side menu on the
                    workbasket. Only the team coordinator for the network operator organisation can update the team.
                  </p>
                </div>
              </details>
              <button
                type="submit"
                className="govuk-button"
                value="Save and continue"
                name="Save and continue"
                data-prevent-double-click="true"
              >
                Save and continue
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NetworkOperatorDetails;