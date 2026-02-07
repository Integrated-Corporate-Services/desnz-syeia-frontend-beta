import React, { useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import type { ApplicationParty } from "../../../types/application";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useTeamCoordinators } from "../../../hooks/useTeamCoordinators";
import { useAdditionalContacts } from "../hooks/useAdditionalContacts";
import { useNetworkOperatorForm } from "../hooks/useNetworkOperatorForm";
import { useApplicationSync } from "../hooks/useApplicationSync";
import { useCoordinatorOptions } from "../hooks/useCoordinatorOptions";
import { S37_BASE_URL } from "../../../constants/s37";
import {
  MAX_REFERENCE_LENGTH,
  BREADCRUMBS,
  FORM_LABELS,
  FORM_ERRORS,
} from "../constants/networkOperatorDetails";

/**
 * Network Operator Details Page
 * Allows user to enter applicant reference and select team coordinator
 */
const NetworkOperatorDetails: React.FC = () => {
  const { user } = useAuthUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const appId = useGetApplicationId();

  // Get organization from route state
  const stateOrgId = location.state?.organisationId;
  const stateOrgName = location.state?.organisationName;

  // Store
  const application = useApplicationStore((state) => state.application);
  const applicationParty = useApplicationStore(
    (state) => state.applicationParty
  );
  const setApplication = useApplicationStore((state) => state.setApplication);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );

  // Custom hooks
  const {
    networkOperatorRef,
    setNetworkOperatorRef,
    selectedOrgName,
    setSelectedOrgName,
    selectedOrganisation,
    setSelectedOrganisation,
    errors,
    showErrorSummary,
    validateForm,
    handleOperatorChange: handleOperatorChangeBase,
  } = useNetworkOperatorForm();

  const {
    additionalContacts,
    emailAddress,
    emailInputError,
    setEmailAddress,
    handleAddContact,
    handleDeleteContact,
    setAdditionalContacts,
    clearEmailInputError,
  } = useAdditionalContacts();

  const organisationId =
    application?.application_party?.organisation_id || stateOrgId;
  const organisationName =
    application?.application_party?.organisation_name || stateOrgName || "";

  // Fetch team coordinators for users who can access them
  // APPLICANT_AGENT, APPLICANT_USER, APPLICANT_TEAM_COORDINATOR all have permission
  const canFetchCoordinators =
    user?.role === "DESNZ_ADMIN" ||
    user?.role === "APPLICANT_TEAM_COORDINATOR" ||
    user?.role === "APPLICANT_AGENT" ||
    user?.role === "APPLICANT_USER";
  const { coordinators } = useTeamCoordinators(
    canFetchCoordinators ? organisationId : undefined
  );

  // Map coordinators to dropdown options
  const options = useCoordinatorOptions({
    coordinators,
    organisationId,
    organisationName,
  });

  // Fetch application data on mount
  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId).then(() => {
        // If organization passed via state, update application_party
        if (stateOrgId && stateOrgName && application?.application_id) {
          setApplication({
            ...application,
            application_id: application.application_id,
            application_party: {
              ...application?.application_party,
              organisation_id: stateOrgId,
              organisation_name: stateOrgName,
              party_type:
                application?.application_party?.party_type ||
                "Network Operator",
              line1: application?.application_party?.line1 || "",
              is_primary: true,
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // Sync application data with form state
  useApplicationSync({
    application,
    options,
    onReferenceSync: setNetworkOperatorRef,
    onCoordinatorSync: (name, org) => {
      setSelectedOrgName(name);
      setSelectedOrganisation(org);
    },
    onContactsSync: setAdditionalContacts,
  });

  // Handle dropdown change
  const handleOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleOperatorChangeBase(e, options);
    },
    [handleOperatorChangeBase, options]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let app = application;
    const created_by = (user as AuthUser)?.user_id || "";
    const additionalContactString =
      additionalContacts
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .join(",") || null;

    if (!app) {
      const newAppData = {
        type: "NWL",
        operator_ref: networkOperatorRef,
        status: "Draft",
        created_by: created_by,
      };
      app = await useApplicationStore.getState().startApplication(newAppData);
    } else {
      await useApplicationStore.getState().saveNetworkOperator({
        application_id: appId,
        operator_ref: networkOperatorRef,
        organisation_id: selectedOrganisation?.organisation_id,
        person_id: selectedOrganisation?.person_id,
        contact_id: selectedOrganisation?.contact_id,
        role: "APPLICANT",
        is_primary: true,
        contact_isconfirmed: applicationParty?.contact_isconfirmed,
        type: application?.type,
        additional_contact: additionalContactString,
      });

      navigate(
        `${S37_BASE_URL}/${app.application_id}/network-operator-contact-details`
      );
    }
  };

  return (
    <div className="govuk-width-container">
      <Link to="/workbasket" className="govuk-back-link">
        Workbasket
      </Link>
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${S37_BASE_URL}/${
                application?.application_id || ""
              }/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            {BREADCRUMBS.NETWORK_OPERATOR}
          </li>
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
                  errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                  errors.includes(FORM_ERRORS.INVALID_REFERENCE)
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
                {(errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                  errors.includes(FORM_ERRORS.INVALID_REFERENCE)) && (
                  <p className="govuk-error-message">
                    {errors.find(
                      (e) =>
                        e === FORM_ERRORS.MISSING_REFERENCE ||
                        e === FORM_ERRORS.INVALID_REFERENCE,
                    )}
                  </p>
                )}
                <input
                  className={`govuk-input${
                    errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                    errors.includes(FORM_ERRORS.INVALID_REFERENCE)
                      ? " govuk-input--error"
                      : ""
                  }`}
                  id="networkOperatorRef"
                  name="networkOperatorRef"
                  type="text"
                  maxLength={MAX_REFERENCE_LENGTH}
                  value={networkOperatorRef}
                  onChange={(e) => setNetworkOperatorRef(e.target.value)}
                />
              </div>

              <div className="govuk-form-group">
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
                <select
                  className="govuk-select"
                  id="location"
                  name="location"
                  value={selectedOrgName}
                  onChange={handleOperatorChange}
                  aria-describedby="location-hint"
                >
                  <option value="">Select person...</option>
                  {options.map((op: ApplicationParty, index: number) => (
                    <option
                      key={`${op.organisation_id || "no-org"}-${
                        op.person_name
                      }-${index}`}
                      value={op.person_name}
                    >
                      {op.person_name}
                    </option>
                  ))}
                </select>
              </div>
              {additionalContacts.length > 0 && (
                <ul className="govuk-list">
                  {additionalContacts.map((email, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eee",
                        padding: "4px 0",
                      }}
                    >
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
                  {FORM_LABELS.EMAIL_ADDRESS}
                </label>
                <input
                  className="govuk-input"
                  id="emailAddress"
                  name="emailAddress"
                  type="text"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    if (emailInputError) clearEmailInputError();
                  }}
                  autoComplete="off"
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
                    <a
                      className="govuk-link"
                      href="mailto:ukop@nstauthority.co.uk"
                    >
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

export default NetworkOperatorDetails;
