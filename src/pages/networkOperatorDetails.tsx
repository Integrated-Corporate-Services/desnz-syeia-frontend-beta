
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-service';
import { useApplicationStore } from '../store/useApplicationStore';
import { useNavigate, useLocation } from 'react-router-dom';

const NetworkOperatorDetails = () => {
  const [options, setOptions] = useState<any[]>([]);
  const [networkOperatorReference, setNetworkOperatorReference] = useState('');
  const [selectedOrganisation, setSelectedOrganisation] = useState<any | null>(null);

  const application = useApplicationStore(state => state.application);
  const setOrganisation = useApplicationStore(state => state.setOrganisation);
  const saveNetworkOperator = useApplicationStore(state => state.saveNetworkOperator);
  const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('id');
  const emailId = 'jane.doe@alphanet.co.uk';

  // Fetch application if not loaded
  useEffect(() => {
    if (!application && appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, application, fetchAndSetApplication]);

  // Fetch application, then dropdown options, then verify and set selected organisation
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      let app = application;
      // Fetch application if not loaded
      if (!app && appId) {
        await fetchAndSetApplication(appId);
        // Re-fetch from store after update
        app = useApplicationStore.getState().application;
      }
      if (!app) return;
      if (!isMounted) return;
      setNetworkOperatorReference(app.operator_ref || '');
      // Fetch dropdown options
      let orgOptions: any[] = [];
      try {
        const data = await apiService.getNetworkOperatorByEmail(emailId);
        orgOptions = Array.isArray(data) ? data : [];
      } catch {
        orgOptions = [];
      }
      if (!isMounted) return;
      setOptions(orgOptions);
      // Now verify and set selected organisation
      const partyOrgName = app.application_party && app.application_party.organisation_name;
      if (partyOrgName && orgOptions.length > 0) {
        const org = orgOptions.find(
          opt =>
            opt.organisation_name &&
            partyOrgName &&
            opt.organisation_name.trim().toLowerCase() === partyOrgName.trim().toLowerCase()
        );
        if (org) {
          setSelectedOrganisation(org);
          setOrganisation(org);
        } else {
          setSelectedOrganisation(null);
          setOrganisation(null);
        }
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [emailId, appId, application, fetchAndSetApplication, setOrganisation]);



    // Debug logging to help diagnose dropdown selection issue
  useEffect(() => {
    console.log('application:', application);
    if (application) {
      console.log('application.application_party:', application.application_party);
    }
    console.log('options:', options);
    if (application && application.application_party) {
      console.log('partyOrgName:', application.application_party.organisation_name);
    }
    console.log('selectedOrganisation:', selectedOrganisation);
  }, [application, options, selectedOrganisation]);



  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNetworkOperatorReference(e.target.value);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const org = options.find(opt => opt.organisation_name === selectedName);
    setSelectedOrganisation(org || null);
    if (org) setOrganisation(org);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !selectedOrganisation) return;
    await saveNetworkOperator({
      application_id: application.application_id,
      operator_ref: networkOperatorReference,
      role: 'applicant',
      organisation_id: selectedOrganisation.organisation_id,
      person_id: selectedOrganisation.person_id,
      contact_id: selectedOrganisation.party_contact_id,
      is_primary: true,
    });
    navigate('/task-list?id=' + application.application_id);
  };

  // Button label logic
  const showSave = Boolean(networkOperatorReference && selectedOrganisation);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-width-container">
        <a href="#" className="govuk-back-link">&lt; Back</a>
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">Network operator details</h1>
          {application ? (
            <form method="post" data-module="fds-html-form" onSubmit={handleSubmit} className="govuk-form-group">
              {/* CSRF token placeholder */}
              <input type="hidden" name="_csrf" value="UgomoCIrWPeL364VTL72d77f-RjzzYZMUPWrgo1Af_jFUijLYW5CmBQZaJGm5pkgeJPCE4fu1HnC-uVhY82fse4kSJz0Ykuv" />

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="networkOperatorReference-inputValue">
                  Network operator's reference
                </label>
                <input
                  className="govuk-input govuk-!-width-one-half"
                  id="networkOperatorReference-inputValue"
                  name="networkOperatorReference"
                  type="text"
                  value={networkOperatorReference}
                  onChange={handleReferenceChange}
                  autoComplete="off"
                />
                <span className="govuk-hint">
                  The section 37 consent will be issued in the name of the person selected here
                </span>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="networkOperator">
                  Network operator
                </label>
                <select
                  id="networkOperator"
                  name="networkOperator"
                  className="govuk-select govuk-!-width-one-half"
                  value={selectedOrganisation ? selectedOrganisation.organisation_name : ''}
                  onChange={handleOperatorChange}
                  required
                >
                  <option value="" disabled>Select one...</option>
                  {options.map(opt => (
                    <option key={opt.organisation_name} value={opt.organisation_name}>{opt.organisation_name}</option>
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
                value={showSave ? 'Save and continue' : 'Continue'}
                name={showSave ? 'Save and continue' : 'Continue'}
                data-prevent-double-click="true"
                data-fds-disable-on-submit="false"
                data-govuk-button-init=""
                style={{ backgroundColor: '#00703c', color: '#fff', width: 'auto', minWidth: '180px', fontWeight: 700 }}
              >
                {showSave ? 'Save and continue' : 'Continue'}
              </button>
            </form>
          ) : (
            <p>Loading application...</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default NetworkOperatorDetails;