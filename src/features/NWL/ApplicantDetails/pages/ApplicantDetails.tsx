import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { applicationApiService } from "../../../../services/applicationApiService";

type NetworkOperator = {
  organisation_name: string;
  full_name: string;
  line1?: string;
};

const ApplicantDetails: React.FC = () => {
  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore((state) => state.fetchAndSetApplication);
  const navigate = useNavigate();
  const locationObj = useLocation();
  const params = new URLSearchParams(locationObj.search);
  const appId = params.get('id');
  const networkOperatorOptions: NetworkOperator[] = React.useMemo(() => {
    return (
      (locationObj.state as { networkOperatorOptions?: NetworkOperator[] })?.networkOperatorOptions || []
    );
  }, [locationObj.state]);
  const [networkOperatorRef, setNetworkOperatorRef] = useState("");
  const [location, setLocation] = useState("choose");
  const [emailAddress, setEmailAddress] = useState("");
  const [additionalContacts, setAdditionalContacts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<NetworkOperator | null>(null);

  // Sync selectedOrganisation with dropdown selection
  React.useEffect(() => {
    if (location && location !== "choose") {
      const org = networkOperatorOptions.find(
        (op: NetworkOperator) => op.full_name === location
      );
      setSelectedOrganisation(org || null);
    } else {
      setSelectedOrganisation(null);
    }
  }, [location, networkOperatorOptions]);

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  // Bind application data to local state when loaded
  useEffect(() => {
    if (application) {
      if (application.operator_ref !== undefined && application.operator_ref !== null) {
        setNetworkOperatorRef(application.operator_ref);
      }
      const partyOrgName = application.application_party?.organisation_name;
      if (partyOrgName && networkOperatorOptions.length > 0) {
        const org = networkOperatorOptions.find(
          (opt: NetworkOperator) => opt.organisation_name && opt.organisation_name.trim().toLowerCase() === partyOrgName.trim().toLowerCase()
        );
        setSelectedOrganisation(org || null);
      }
    }
  }, [application, networkOperatorOptions]);

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
    if (location === "choose" || !location) {
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
        operator_ref: networkOperatorRef,
        status: app?.status || '',
        created_by: app?.created_by || '',
        created_at: app?.created_at || '',
        submitted_at: app?.submitted_at || '',
        application_party: {
          party_type: app?.application_party?.party_type ?? '',
          organisation_name: selectedOrganisation?.organisation_name ?? '',
          line1: selectedOrganisation?.line1 ?? '',
          line2: selectedOrganisation?.line2 ?? '',
          city: selectedOrganisation?.city ?? '',
          postcode: selectedOrganisation?.postcode ?? '',
          country: selectedOrganisation?.country ?? '',
          email: selectedOrganisation?.email ?? '',
          phone: selectedOrganisation?.phone ?? '',
          organisation_id: selectedOrganisation?.organisation_id ?? '',
          person_id: selectedOrganisation?.person_id ?? '',
          contact_id: selectedOrganisation?.party_contact_id ?? '',
          is_primary: true,
          contact_isconfirmed: app?.application_party?.contact_isconfirmed ?? false,
        },
      });
      // Optionally, still call saveNetworkOperator if needed for backend
      try {
        const payload = {
          application_id: app.application_id,
          operator_ref: networkOperatorRef,
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-describedby="location-hint"
                >
                  <option value="choose">Select option...</option>
                  {networkOperatorOptions.map((op: NetworkOperator) => (
                    <option key={op.full_name} value={op.full_name}>
                      {op.full_name}
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
