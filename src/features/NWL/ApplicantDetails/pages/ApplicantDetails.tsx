import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { networkOperatorApiService } from "../../../../services/networkOperatorApiService";
import type { ApplicationParty } from '../../../../types/application';
import { useAuthUserContext } from "../../../../context/AuthUserContext";
import type { AuthUser } from '../../../../types/auth';
import { applicationApiService } from "../../../../services/applicationApiService";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { add } from "proj4/dist/lib/projections";

const ApplicantDetails: React.FC = () => {
  // Breadcrumbs content
  const BREADCRUMB_TASK_LIST = 'Task list';
  const BREADCRUMB_NETWORK_OPERATOR = 'Network operator';
  // Validate email format
  function isValidEmail(email: string): boolean {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Check for duplicate email (case-insensitive)
  function isDuplicateEmail(email: string): boolean {
    return additionalContacts.map(e => e.toLowerCase()).includes(email.toLowerCase());
  }
  const application = useApplicationStore((state) => state.application);
  const applicationParty = useApplicationStore((state) => state.applicationParty);
  const fetchAndSetApplication = useApplicationStore((state) => state.fetchAndSetApplication);
  const navigate = useNavigate();
  const appId = useGetApplicationId();
  const [options, setOptions] = useState<ApplicationParty[]>([]);
  const [networkOperatorRef, setNetworkOperatorRef] = useState("");
  const [selectedOrgName, setSelectedOrgName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [additionalContacts, setAdditionalContacts] = useState<string[]>([]);
  // Track initial contacts loaded from application
  const [initialContactsLoaded, setInitialContactsLoaded] = useState(false);
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
              line1: opt.line1 ?? "",
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
  setSelectedOrgName(options[0].person_name ?? "");
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
    // Load additional contacts from application only once
    if (
      application?.application_party?.additional_contact &&
      !initialContactsLoaded
    ) {
      const contacts = application.application_party.additional_contact
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      setAdditionalContacts(contacts);
      setInitialContactsLoaded(true);
    }
  }, [application, initialContactsLoaded]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailAddress.trim();
    if (
      email &&
      !additionalContacts.map(e => e.toLowerCase()).includes(email.toLowerCase())
    ) {
      setAdditionalContacts(prev => [...prev, email]);
      setEmailAddress("");
    }
  };

  // Delete contact handler
  function handleDeleteContact(email: string) {
    setAdditionalContacts(prev => prev.filter(e => e !== email));
  }

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
      const type = 'NWL';
      const createdBy = (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || '';
      // Trim and join contacts for backend, send null if none
      const additionalContactString = additionalContacts
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .join(',') || null;
     if (!app) {
        const newAppData = {
          type,
          operator_ref: networkOperatorRef,
          status: 'Draft',
          created_by: createdBy,
        };
        app = await useApplicationStore.getState().startApplication(newAppData);
      }
     else {
         console.log('Saving network operator details for existing application');
                  await useApplicationStore.getState().saveNetworkOperator({
                      application_id: appId,
                      operator_ref: networkOperatorRef,
                      organisation_id: selectedOrganisation?.organisation_id,
                      person_id: selectedOrganisation?.person_id,
                      contact_id: selectedOrganisation?.contact_id,
                      role: 'Applicant',
                      is_primary: true,
                      contact_isconfirmed: applicationParty?.contact_isconfirmed,
                      type: application?.type,
                      additional_contact: additionalContactString,
                    });
             
        navigate(`/nwl/${app.application_id}/network-operator-contact-details`);
      }
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={`/nwl/${application?.application_id || ''}/task-list`}>
              {BREADCRUMB_TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">{BREADCRUMB_NETWORK_OPERATOR}</li>
        </ol>
      </nav>
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
 {additionalContacts.length > 0 && (
                <ul className="govuk-list">
                  {additionalContacts.map((email, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '4px 0' }}>
                      <span>{email}</span>
                
                      <a
                        className="govuk-link"
                        href="#"
                        onClick={() => handleDeleteContact(email)}
                      >
                        Delete contact
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Additional contacts */}
              <h2 className="govuk-heading-m">
                Additional contacts <span className="govuk-hint">(optional)</span>
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
