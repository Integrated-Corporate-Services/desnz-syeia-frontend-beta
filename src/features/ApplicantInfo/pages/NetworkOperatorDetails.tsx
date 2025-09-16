import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import React, { useState, useEffect } from 'react';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CONTENT } from '../../../constants/content';
import { networkOperatorApiService } from '../../../services/networkOperatorApiService';


const NetworkOperatorDetails = () => {
  const [options, setOptions] = useState<any[]>([]);
  const [networkOperatorReference, setNetworkOperatorReference] = useState('');
  const [selectedOrganisation, setSelectedOrganisation] = useState<any | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [errors, setErrors] = useState<{ reference?: string; organisation?: string }>({});

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
      let orgOptions: any[] = [];
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
        if (application.operator_ref !== undefined && application.operator_ref !== null) {
          setNetworkOperatorReference(application.operator_ref);
        }
        const partyOrgName = application.application_party?.organisation_name;
        if (partyOrgName && orgOptions.length > 0) {
          const org = orgOptions.find(
            opt =>
              opt.organisation_name &&
              opt.organisation_name.trim().toLowerCase() === partyOrgName.trim().toLowerCase()
          );
          setSelectedOrganisation(org || null);
          setOrganisation(org || null);
        }
      }
    };
    fetchOptionsAndBind();
    return () => { isMounted = false; };
  }, [emailId, application, setOrganisation]);

  // Keep selectedOrgName in sync with application
  useEffect(() => {
    if (application?.application_party?.organisation_name) {
      setSelectedOrgName(application.application_party.organisation_name);
    }
  }, [application]);

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkOperatorReference(e.target.value);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedOrgName(selectedName);
    const org = options.find(opt => opt.organisation_name === selectedName);
    setSelectedOrganisation(org || null);
    setOrganisation(org || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { reference?: string; organisation?: string } = {};
    if (!networkOperatorReference.trim()) {
      newErrors.reference = 'Network operator reference is required.';
    }
    if (!selectedOrgName.trim()) {
      newErrors.organisation = 'Please select a network operator organisation.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    let app = application;
    if (!app || !app.application_id) {
      const newAppData = {
        type: 'S37',
        operator_ref: networkOperatorReference,
        status: 'Draft',
  created_by: (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || '',
      };
      app = await useApplicationStore.getState().startApplication(newAppData);
    }
    useApplicationStore.getState().setApplication({
      application_id: app.application_id,
      type: app.type || '',
      operator_ref: networkOperatorReference,
      status: app.status || '',
      created_by: app.created_by || '',
      created_at: app.created_at || '',
      submitted_at: app.submitted_at || '',
      application_party: {
        party_type: app?.application_party?.party_type ?? '',
        organisation_name: selectedOrganisation?.organisation_name || '',
        line1: selectedOrganisation?.line1 || '',
        line2: selectedOrganisation?.line2 || '',
        city: selectedOrganisation?.city || '',
        postcode: selectedOrganisation?.postcode || '',
        country: selectedOrganisation?.country || '',
        email: selectedOrganisation?.email || '',
        phone: selectedOrganisation?.phone || '',
        organisation_id: selectedOrganisation?.organisation_id,
        person_id: selectedOrganisation?.person_id,
        contact_id: selectedOrganisation?.party_contact_id,
        is_primary: true,
      },
    });
    navigate(`/network-operator-contact-details?id=${app.application_id}`);
  };

  // Button label logic
  // Button label logic: show 'Save and continue' if application object with values is available on initial load
  const [initialShowSave, setInitialShowSave] = useState(false);
  useEffect(() => {
    // Only run on initial mount
    if (application && application.application_id) {
      setInitialShowSave(true);
    } else {
      setInitialShowSave(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={`/task-list?id=${application?.application_id || ''}`}>
              {CONTENT.networkOperatorContact.breadcrumb.taskList}
            </Link>
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
                  aria-invalid={!!errors.reference}
                  aria-describedby={errors.reference ? 'networkOperatorReference-error' : undefined}
                />
                {errors.reference && (
                  <span className="govuk-error-message" id="networkOperatorReference-error">{errors.reference}</span>
                )}
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
                  value={selectedOrgName}
                  onChange={handleOperatorChange}
                  aria-invalid={!!errors.organisation}
                  aria-describedby={errors.organisation ? 'networkOperator-error' : undefined}
                  required
                >
                  <option value="" disabled>Select one...</option>
                  {options.map(opt => (
                    <option key={opt.organisation_id || opt.organisation_name} value={opt.organisation_name}>{opt.organisation_name}</option>
                  ))}
                </select>
                {errors.organisation && (
                  <span className="govuk-error-message" id="networkOperator-error">{errors.organisation}</span>
                )}
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
                value={initialShowSave ? 'Save and continue' : 'Continue'}
                name={initialShowSave ? 'Save and continue' : 'Continue'}
                data-prevent-double-click="true"
                data-fds-disable-on-submit="false"
                data-govuk-button-init=""
                style={{ backgroundColor: '#00703c', color: '#fff', width: 'auto', minWidth: '180px', fontWeight: 700 }}
              >
                {initialShowSave ? 'Save and continue' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NetworkOperatorDetails;