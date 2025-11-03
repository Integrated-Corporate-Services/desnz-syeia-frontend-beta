import React, { useState, useEffect } from 'react';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import type { AuthUser } from '../../../../types/auth';
import { useApplicationStore } from '../../../../store/useApplicationStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { networkOperatorApiService } from '../../../../services/networkOperatorApiService';

type OrganisationContact = {
  organisation_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
  organisation_id?: string;
  person_id?: string;
  contact_id?: string;
  party_contact_id?: string;
};

const NetworkOperatorContactDetails: React.FC = () => {
  const [options, setOptions] = useState<OrganisationContact[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<OrganisationContact | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [error, setError] = useState<string>('');
  const [contactIsConfirmed, setContactIsConfirmed] = useState<true | false | null>(null);

    const application = useApplicationStore(state => state.application);
    const setOrganisation = useApplicationStore(state => state.setOrganisation);
    const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const appId = params.get('id');
    const { user } = useAuthUserContext();
    const emailId = (user as AuthUser)?.email;

    // Fetch application if not loaded
    useEffect(() => {
      if (!application && appId) {
        fetchAndSetApplication(appId);
      }
    }, [appId, application, fetchAndSetApplication]);

    // Fetch dropdown options and bind application data
    useEffect(() => {
      let isMounted = true;
      const fetchOptionsAndBind = async () => {
      let orgOptions: OrganisationContact[] = [];
        try {
          if (typeof emailId === 'string' && emailId) {
            const data = await networkOperatorApiService.getNetworkOperatorByEmail(emailId);
            orgOptions = Array.isArray(data) ? data : [];
          } else {
            orgOptions = [];
          }
        } catch {
          orgOptions = [];
        }
        if (!isMounted) return;
        setOptions(orgOptions);

        // Bind application data to form fields
        if (application) {
          const partyOrgName = application.application_party?.organisation_name;
          if (partyOrgName && orgOptions.length > 0) {
            const org = orgOptions.find(
              opt =>
                opt.organisation_name &&
                opt.organisation_name.trim().toLowerCase() === partyOrgName.trim().toLowerCase()
            );
            setSelectedOrganisation(org || null);
            setOrganisation(org || null);
            setSelectedOrgName(partyOrgName);
          }
        }
      };
      fetchOptionsAndBind();
      return () => { isMounted = false; };
    }, [emailId, application, setOrganisation]);

    // After options are set, select the first organisation by default if none is selected
    useEffect(() => {
      if (options.length > 0 && !selectedOrgName) {
        setSelectedOrgName(options[0].organisation_name || '');
        setSelectedOrganisation(options[0]);
        setOrganisation(options[0]);
      }
    }, [options, selectedOrgName, setOrganisation]);

    // Keep contactIsConfirmed in sync with store

  const party = application?.application_party;
  useEffect(() => {
    if (party && typeof party.contact_isconfirmed === 'boolean') {
      setContactIsConfirmed(party.contact_isconfirmed);
    } else {
      setContactIsConfirmed(null); // Ensure no selection by default
    }
  }, [party?.contact_isconfirmed]);

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedOrgName(selectedName);
  const org = options.find((opt: OrganisationContact) => opt.organisation_name === selectedName);
    setSelectedOrganisation(org || null);
    setOrganisation(org || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactIsConfirmed === null) {
      setError('Select yes if all contact details are available and correct');
      return;
    }
    setError('');
    // Only navigate, do not send anything to the DB or update the store
    navigate(`/nwl/task-list?id=${appId || ''}`);
  };

  // Prepare contact details for summary
  const contactDetails = {
    operatorName: selectedOrganisation?.organisation_name || '',
    contactName: selectedOrganisation?.organisation_name || '',
    address: [selectedOrganisation?.line1, selectedOrganisation?.line2, selectedOrganisation?.city, selectedOrganisation?.country, selectedOrganisation?.postcode].filter(Boolean).join('<br>'),
    email: selectedOrganisation?.email || '',
    phone: selectedOrganisation?.phone || '',
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

        {/* Organisation/contact dropdown for selection if multiple options */}
        {options.length > 1 && (
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="networkOperatorContact">
              Select applicant contact
            </label>
            <select
              id="networkOperatorContact"
              name="networkOperatorContact"
              className="govuk-select"
              style={{ width: '100%' }}
              value={selectedOrgName || ''}
              onChange={handleOperatorChange}
              required
            >
              <option value="" disabled>Select one...</option>
              {options.map((opt: OrganisationContact) => (
                <option key={opt.organisation_id || opt.organisation_name} value={opt.organisation_name}>{opt.organisation_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Fallback message if no contact available */}
        {options.length === 0 && (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong className="govuk-warning-text__text">
              No applicant contact details found. Please ensure your account is set up correctly.
            </strong>
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
                {contactDetails.email}
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
                            onChange={() => {
                              setContactIsConfirmed(true);
                              setError('');
                            }}
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
                            onChange={() => {
                              setContactIsConfirmed(false);
                              setError('');
                            }}
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="contactIsConfirmed-no">
                            No
                          </label>
                        </div>
                {contactIsConfirmed === false && (
                  <div className="govuk-radios__conditional">
                    <p className="govuk-body">
                      If any of the contact details are not correct or missing then the contact person must update their account details on EIP. You will not be allowed to submit the application until all details are provided and correct.
                    </p>
                    <p className="govuk-body">
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
