import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { networkOperatorApiService } from '../../../services/networkOperatorApiService';

type NetworkOperator = { organisation_name: string; full_name: string; line1?: string };

const WhoIsApplying: React.FC = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<NetworkOperator[]>([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState<NetworkOperator | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { user } = useAuthUserContext();
  const application = useApplicationStore(state => state.application);
  const setApplication = useApplicationStore(state => state.setApplication);

  useEffect(() => {
    let isMounted = true;
    const fetchOptions = async () => {
      let orgOptions: NetworkOperator[] = [];
      try {
        const email = (user as AuthUser)?.email;
        if (typeof email === 'string' && email) {
          const data = await networkOperatorApiService.getNetworkOperatorByEmail(email);
          orgOptions = Array.isArray(data) ? data : [];
        } else {
          orgOptions = [];
        }
      } catch {
        orgOptions = [];
      }
      if (!isMounted) return;
      setOptions(orgOptions);
      // Select first org by default
      if (orgOptions.length > 0) {
        setSelectedOrgName(orgOptions[0].full_name);
        setSelectedOrganisation(orgOptions[0]);
      } else {
        setSelectedOrgName("");
        setSelectedOrganisation(null);
      }
    };
    fetchOptions();
    return () => { isMounted = false; };
  }, [user]);

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedOrgName(selectedName);
    const org = options.find(opt => opt.full_name === selectedName);
    setSelectedOrganisation(org || null);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!selectedOrgName) {
      setError("Select the network operator");
      return;
    }
    setError("");

    let app = application;
    if (!app || !app.application_id) {
      const newAppData = {
        type: 'NWL',
        operator_ref: '',
        status: 'Draft',
        created_by: (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || '',
      };
      app = await useApplicationStore.getState().startApplication(newAppData);
    }
    setApplication({
      application_id: app.application_id,
      type: app.type || '',
      operator_ref: app.operator_ref || '',
      status: app.status || '',
      created_by: app.created_by || '',
      created_at: app.created_at || '',
      submitted_at: app.submitted_at || '',
      application_party: {
        party_type: app?.application_party?.party_type ?? '',
        organisation_name: selectedOrganisation?.organisation_name || '',
        line1: selectedOrganisation?.line1 || '',
        is_primary: true,
      },
    });
  navigate(`/s-37/${app.application_id}/network-operator-details`, { state: { networkOperatorOptions: options } });
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Who is applying?</h1>
            {/* Error summary */}
            {submitted && error && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert" style={{ marginBottom: '2rem' }}>
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li><a href="#location">{error}</a></li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleContinue} noValidate>
              <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 500 }}>
                <label className="govuk-label" htmlFor="location">Network operator</label>
                {error && (
                  <p id="location-error" className="govuk-error-message">{error}</p>
                )}
                <select
                  className="govuk-select"
                  id="location"
                  name="location"
                  aria-describedby="location-hint"
                  value={selectedOrgName}
                  onChange={handleOrgChange}
                  style={{ width: "100%", fontSize: "1.1rem" }}
                  disabled={options.length === 0}
                  required
                >
                  <option value="" disabled>{options.length === 0 ? "No network operators found" : "Select option..."}</option>
                  {options.map(opt => (
                    <option key={opt.organisation_name} value={opt.organisation_name}>{opt.organisation_name}</option>
                  ))}
                </select>
              </div>
              <details className="govuk-details" open style={{ maxWidth: 600, marginTop: '2rem' }}>
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">The network operator is not listed</span>
                </summary>
                <div className="govuk-details__text">
                  <p>You must contact the team coordinator in your organisation that you want to create an application for to provide you with access to their organisation.</p>
                  <p>
                    If you do not know who the team coordinator is then contact the service desk for advice at{' '}
                    <a
                      href="mailto:ukop@nstauthority.co.uk"
                      style={{ color: '#1d70b8', textDecoration: 'underline' }}
                    >
                      ukop@nstauthority.co.uk
                    </a>
                  </p>
                </div>
              </details>
              <div className="govuk-!-static-margin-top-6">
                <button type="submit" className="govuk-button" data-module="govuk-button" disabled={options.length === 0}>
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhoIsApplying;
