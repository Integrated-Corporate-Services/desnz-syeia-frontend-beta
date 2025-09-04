import React, { useState, useEffect } from 'react';
import { apiService } from '../redux/services/api-service';

const NetworkOperatorDetails = () => {
  const [networkOperatorReference, setNetworkOperatorReference] = useState('ooo');
  const [networkOperator, setNetworkOperator] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  // Replace with actual personId as needed
  const personId = '44444444-4444-4444-4444-444444444444';

  useEffect(() => {
    apiService.getNetworkOperatorByPerson(personId)
      .then(data => {
        const orgOptions = Array.isArray(data)
          ? data.map((item: { organisation_name: string }) => ({
              value: item.organisation_name,
              label: item.organisation_name
            }))
          : [];
        setOptions(orgOptions);
        if (orgOptions.length > 0) setNetworkOperator(orgOptions[0].value);
      })
      .catch((err) => {
        setOptions([]);
        setNetworkOperator('');
      });
  }, [personId]);

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkOperatorReference(e.target.value);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNetworkOperator(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle form submission
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-width-container">
        <a href="#" className="govuk-back-link">&lt; Back</a>
        <h1 className="govuk-heading-xl">Network operator details</h1>
        <form method="post" data-module="fds-html-form" onSubmit={handleSubmit}>
          {/* CSRF token placeholder */}
          <input type="hidden" name="_csrf" value="UgomoCIrWPeL364VTL72d77f-RjzzYZMUPWrgo1Af_jFUijLYW5CmBQZaJGm5pkgeJPCE4fu1HnC-uVhY82fse4kSJz0Ykuv" />

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
              aria-describedby="networkOperator-hint"
              value={networkOperator}
              onChange={handleOperatorChange}
              style={{ width: '100%' }}
            >
              <option value="" disabled>Select one...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <details className="govuk-details govuk-!-margin-bottom-4" data-module="govuk-details">
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
            style={{ backgroundColor: '#00703c', color: '#fff', width: 'auto', minWidth: '180px', fontWeight: 700 }}
          >
            Save and continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default NetworkOperatorDetails;