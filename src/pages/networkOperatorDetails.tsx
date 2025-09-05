
import React, { useState } from 'react';

const NetworkOperatorDetails = () => {
  const [networkOperatorReference, setNetworkOperatorReference] = useState('ooo');
  const [networkOperator, setNetworkOperator] = useState('83124');

  const handleReferenceChange = (e) => {
    setNetworkOperatorReference(e.target.value);
  };

  const handleOperatorChange = (e) => {
    setNetworkOperator(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle form submission
  };

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
            <form method="post" data-module="fds-html-form" onSubmit={handleSubmit}>
              <input type="hidden" name="_csrf" value="1cS2IlJvS27qI0DJG9gL3gIaaY-sywG0StstzDKXCdG3BVpy5qXQEmVbLlfHQiL9KfU_5mEqRO6b-DmZf-8U-Ar2PrPTNW4T" />

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="networkOperatorReference-inputValue">
                  Network operator's reference
                </label>
                <input
                  className="govuk-input"
                  id="networkOperatorReference-inputValue"
                  name="networkOperatorReference.inputValue"
                  type="text"
                  value={networkOperatorReference}
                  maxLength={4000}
                  onChange={handleReferenceChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="networkOperator" id="selector-networkOperator-label">
                  Who is the contact in the network operator organisation for this application?
                </label>
                <div id="networkOperator-hint" className="govuk-hint">
                  The section 37 consent will be issued in the name of the person selected here
                </div>
                <select
                  id="networkOperator"
                  name="networkOperator"
                  className="govuk-select"
                  style={{ width: '100%' }}
                  aria-describedby="networkOperator-hint"
                  value={networkOperator}
                  onChange={handleOperatorChange}
                >
                  <option value="" disabled>Select one...</option>
                  <option value="83124">Mr Tree Lopping Consent Npower User</option>
                  <option value="83112">Mr Section 37 Consent Npower User</option>
                </select>
              </div>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
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
                data-module="govuk-button"
                className="govuk-button"
                value="Save and continue"
                name="Save and continue"
                data-prevent-double-click="true"
                data-fds-disable-on-submit="false"
                data-govuk-button-init=""
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