import React, { useState, useEffect } from 'react';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useNavigate, useLocation } from 'react-router-dom';

const NetworkOperatorContactDetails: React.FC = () => {
  // Get application from store
  const application = useApplicationStore((state: any) => state.application);
  const fetchAndSetApplication = useApplicationStore((state: any) => state.fetchAndSetApplication);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('id');

  // Fetch application if not loaded
  useEffect(() => {
    if (!application && appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, application, fetchAndSetApplication]);

  const party = application?.application_party;
  const contactDetails = {
    operatorName: party?.organisation_name || '',
    contactName: party?.full_name || party?.person_name || '',
    address: [party?.line1, party?.line2, party?.city, party?.country, party?.postcode].filter(Boolean).join('<br>'),
    email: party?.email || '',
    phone: party?.phone || '',
  };

  const [contactIsConfirmed, setContactIsConfirmed] = useState<true | false | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (party && typeof party.contact_isconfirmed === 'boolean') {
      setContactIsConfirmed(party.contact_isconfirmed);
    } else {
      setContactIsConfirmed(null);
    }
  }, [party?.contact_isconfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactIsConfirmed === null) {
      setError('Select yes if all contact details are available and correct');
      return;
    }
    setError('');
    let app = application;
    if (!app || !app.application_id) {
      setError('No application found.');
      return;
    }
    await useApplicationStore.getState().saveNetworkOperator({
      application_id: app.application_id,
      operator_ref: app.operator_ref,
      organisation_id: party?.organisation_id,
      person_id: party?.person_id,
      contact_id: party?.contact_id,
      role: 'Applicant',
      is_primary: true,
      contact_isconfirmed: contactIsConfirmed,
    });
    navigate(`/nwl-task-list?id=${app.application_id}`);    
  };

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Check applicant contact details</h1>

        {error && (
          <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{error}</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Name</dt>
              <dd className="govuk-summary-list__value">
                {contactDetails.operatorName} <br />
                {contactDetails.contactName}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Address</dt>
              <dd className="govuk-summary-list__value" dangerouslySetInnerHTML={{ __html: contactDetails.address }} />
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Email address</dt>
              <dd className="govuk-summary-list__value">
                <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Phone number</dt>
              <dd className="govuk-summary-list__value">{contactDetails.phone}</dd>
            </div>
          </dl>

          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                Are all contact details available and correct?
              </legend>
              <div className="govuk-radios" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="contactIsConfirmed-yes"
                    name="contactIsConfirmed"
                    type="radio"
                    checked={contactIsConfirmed === true}
                    onChange={() => setContactIsConfirmed(true)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="contactIsConfirmed-yes">
                    Yes
                  </label>
                </div>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id="contactIsConfirmed-no"
                    name="contactIsConfirmed"
                    type="radio"
                    checked={contactIsConfirmed === false}
                    onChange={() => setContactIsConfirmed(false)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor="contactIsConfirmed-no">
                    No
                  </label>
                </div>
                {contactIsConfirmed === false && (
                  <div className="govuk-radios__conditional">
                    <p>
                      If any of the contact details are not correct or missing then the contact person must update their account details on EIP. You will not be allowed to submit the application until all details are provided and correct.
                    </p>
                    <p>
                      The contact can update their details by logging into their account on EIP and going to the ‘Update My Details’ link shown in the left-hand menu on the workbasket page.
                    </p>
                  </div>
                )}
              </div>
            </fieldset>
          </div>

          <div className="govuk-!-static-margin-top-6">
            <button type="submit" className="govuk-button" data-module="govuk-button">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkOperatorContactDetails;
