import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { networkOperatorApiService } from "../../../../services/networkOperatorApiService";
import type { ApplicationParty } from '../../../../types/application';
import { useAuthUserContext } from "../../../../context/AuthUserContext";
import type { AuthUser } from '../../../../types/auth';
import { applicationApiService } from "../../../../services/applicationApiService";

const ApplicantDetails: React.FC = () => {
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore((state) => state.fetchAndSetApplication);
  const navigate = useNavigate();
  const locationObj = useLocation();
  const params = new URLSearchParams(locationObj.search);
  const appId = params.get('id');
  const [options, setOptions] = useState<ApplicationParty[]>([]);
  const [networkOperatorRef, setNetworkOperatorRef] = useState("");
  const [selectedOrgName, setSelectedOrgName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [additionalContacts, setAdditionalContacts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<ApplicationParty | null>(null);
  const { user } = useAuthUserContext();

  // Fetch dropdown options and bind application data
  useEffect(() => {
    let isMounted = true;
    type NetworkOperator = {
      organisation_id: string;
      organisation_name: string;
      person_id: string;
      party_contact_id: string;
      full_name?: string;
      line1?: string;
      line2?: string;
      town_city?: string;
      country?: string;
      postcode?: string;
      email?: string;
      phone?: string;
    };
    const fetchOptionsAndBind = async () => {
      let orgOptions: ApplicationParty[] = [];
      try {
        const emailId = (user as AuthUser)?.email;
        let data: NetworkOperator[] = [];
        if (typeof emailId === 'string' && emailId) {
          data = await networkOperatorApiService.getNetworkOperatorByEmail(emailId);
        } else {
          data = [];
        }
        orgOptions = Array.isArray(data)
          ? data.map(opt => ({
              organisation_id: opt.organisation_id,
              organisation_name: opt.organisation_name,
              person_id: opt.person_id,
              contact_id: opt.party_contact_id,
              person_name: opt.full_name || opt.organisation_name,
              line1: opt.line1,
              line2: opt.line2,
              city: opt.town_city,
              country: opt.country,
              postcode: opt.postcode,
              email: opt.email,
              phone: opt.phone,
              party_type: '',
              is_primary: true,
              contact_isconfirmed: true,
            }))
          : [];
      } catch {
        orgOptions = [];
      }
      if (!isMounted) return;
      setOptions(orgOptions);

      // Bind application data to form fields
      if (application) {
        const partyPersonName = application.application_party?.person_name;
        if (partyPersonName && orgOptions.length > 0) {
          const org = orgOptions.find(
            opt =>
              opt.person_name &&
              opt.person_name.trim().toLowerCase() === partyPersonName.trim().toLowerCase()
          );
          setSelectedOrganisation(org || null);
        }
      }
    };
    fetchOptionsAndBind();
    return () => { isMounted = false; };
  }, [application, user]);

  // Keep selectedOrgName in sync with application
  useEffect(() => {
    if (application?.application_party?.person_name) {
      setSelectedOrgName(application.application_party.person_name);
    }
  }, [application]);

  // Do NOT auto-select the first option; require user selection
  useEffect(() => {
    if (options.length > 0 && !selectedOrgName) {
      setSelectedOrgName(""); // Keep dropdown empty
      setSelectedOrganisation(null);
    }
  }, [options, selectedOrgName]);

  // Always set dropdown selection to the first name in the options list
  useEffect(() => {
    if (options.length > 0) {
      setSelectedOrgName(options[0].person_name);
      setSelectedOrganisation(options[0]);
    }
  }, [options]);

  // When user selects from dropdown, update selectedOrganisation
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedOrgName(selectedName);
    const org = options.find(opt => opt.person_name === selectedName);
    setSelectedOrganisation(org || null);
  };

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  // Bind application data to local state when loaded
  useEffect(() => {
    if (application && application.operator_ref !== undefined && application.operator_ref !== null) {
      setNetworkOperatorRef(application.operator_ref);
    }
  }, [application?.operator_ref]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailAddress.trim()) {
      setAdditionalContacts([...additionalContacts, emailAddress.trim()]);
      setEmailAddress("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    if (!networkOperatorRef.trim()) {
      newErrors.push("Enter an Applicant’s reference");
    }
    if (!selectedOrgName.trim()) {
      newErrors.push("Select the network operator");
    }
    setErrors(newErrors);
    setShowErrorSummary(newErrors.length > 0);
    if (newErrors.length === 0) {
      let app = application;
      if (!app?.application_id) {
        // Create new application if missing
        const newAppData = {
          type: 'NWL',
          operator_ref: networkOperatorRef,
          status: 'Draft',
          // You may want to set created_by from user context if available
        };
        app = await useApplicationStore.getState().startApplication(newAppData);
      }
      // Always update main application object with operator_ref
      useApplicationStore.getState().setApplication({
        application_id: app.application_id,
        type: app?.type || '',
        operator_ref: networkOperatorRef, // Ensure reference is set
        status: app?.status || '',
        created_by: app?.created_by || '',
        created_at: app?.created_at || '',
        submitted_at: app?.submitted_at || '',
        application_party: {
          party_type: app?.application_party?.party_type ?? '',
          organisation_id: selectedOrganisation?.organisation_id || '',
          person_id: selectedOrganisation?.person_id || '',
          contact_id: selectedOrganisation?.contact_id || '',
          is_primary: true,
          contact_isconfirmed: true,
          organisation_name: selectedOrganisation?.organisation_name || '',
          line1: selectedOrganisation?.line1 || '',
          line2: selectedOrganisation?.line2 || '',
          city: selectedOrganisation?.city || '',
          country: selectedOrganisation?.country || '',
          postcode: selectedOrganisation?.postcode || '',
          email: selectedOrganisation?.email || '',
          phone: selectedOrganisation?.phone || '',
          person_name: selectedOrganisation?.person_name || '',
        },
      });
      // Optionally, still call saveNetworkOperator if needed for backend
      try {
        const payload = {
          application_id: app.application_id,
          operator_ref: networkOperatorRef, // Ensure reference is sent in payload
          is_primary: true,
          contact_isconfirmed: true,
          role: 'Applicant',
        };
        await applicationApiService.saveNetworkOperator(payload);
      } catch {
        // Handle error if needed
      }
      navigate(`/nwl/network-operator-contact-details?id=${app.application_id}`);
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Applicant details</h1>
            {/* Error summary */}
            {showErrorSummary && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {errors.map((err, idx) => (
                      <li key={idx}>
                        <a href="#">{err}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              {/* Applicant reference details */}
              <div
                className={`govuk-form-group${
                  errors.includes("Enter an Applicant’s reference")
                    ? " govuk-form-group--error"
                    : ""
                }`}
              >
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="networkOperatorRef"
                >
                  Applicant’s reference
                </label>
                {errors.includes("Enter an Applicant’s reference") && (
                  <p className="govuk-error-message">
                    Enter an Applicant’s reference
                  </p>
                )}
                <input
                  className={`govuk-input${
                    errors.includes("Enter an Applicant’s reference")
                      ? " govuk-input--error"
                      : ""
                  }`}
                  id="networkOperatorRef"
                  name="networkOperatorRef"
                  type="text"
                  value={networkOperatorRef}
                  onChange={(e) => setNetworkOperatorRef(e.target.value)}
                />
              </div>

              <div
                className={`govuk-form-group${
                  errors.includes("Select the network operator")
                    ? " govuk-form-group--error"
                    : ""
                }`}
              >
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="location"
                >
                  Applicant contact name
                </label>
                <div id="landRef-hint" className="govuk-hint">
                  The consent will be issued in the name of the person selected
                  here
                </div>
                {errors.includes("Select the network operator") && (
                  <p className="govuk-error-message">
                    Select the network operator
                  </p>
                )}
                <select
                  className="govuk-select"
                  id="location"
                  name="location"
                  value={selectedOrgName}
                  onChange={handleOperatorChange}
                  aria-describedby="location-hint"
                >
                  <option value="">Select person...</option>
                  {options.map((op: ApplicationParty) => (
                    <option key={op.organisation_id || op.person_name} value={op.person_name}>
                      {op.person_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional contacts */}
              <h2 className="govuk-heading-m">
                Additional contacts{" "}
                <span className="govuk-hint">(optional)</span>
              </h2>
              <div id="landRef-hint" className="govuk-hint">
                You can add more contact email addresses to this application
              </div>
              <div className="govuk-form-group">
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="emailAddress"
                >
                  Email address
                </label>
                <input
                  className="govuk-input"
                  id="emailAddress"
                  name="emailAddress"
                  type="text"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleAddContact}
                style={{ marginBottom: "1rem" }}
              >
                Add contact
              </button>
              {additionalContacts.length > 0 && (
                <ul className="govuk-list">
                  {additionalContacts.map((email, idx) => (
                    <li key={idx}>{email}</li>
                  ))}
                </ul>
              )}

              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    The applicant contact is not listed
                  </span>
                </summary>
                <div className="govuk-details__text">
                  <p>
                    You must contact the team coordinator in your organisation
                    that you want to create an application for to provide you
                    with access to their organisation.
                  </p>
                  <p>
                    If you do not know who the team coordinator is then contact
                    the service desk for advice at{" "}
                    <a href="mailto:ukop@nstauthority.co.uk">
                      ukop@nstauthority.co.uk
                    </a>
                  </p>
                </div>
              </details>

              {/* Call to action buttons */}
              <div className="govuk-!-static-margin-top-6">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
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

export default ApplicantDetails;
