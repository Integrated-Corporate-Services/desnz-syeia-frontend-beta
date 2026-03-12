import React, { useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApplicationStore } from "../../../store/useApplicationStore";
import { useAuthUserContext } from "../../../context/AuthUserContext";
import type { AuthUser } from "../../../types/auth";
import type { ApplicationParty } from "../../../types/application";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useRoleBasedNetworkOperators } from "../hooks/useRoleBasedNetworkOperators";
import { useAdditionalContacts } from "../hooks/useAdditionalContacts";
import { useNetworkOperatorForm } from "../hooks/useNetworkOperatorForm";
import { useApplicationSync } from "../hooks/useApplicationSync";
import { useCoordinatorOptions } from "../hooks/useCoordinatorOptions";
import { useRoleBasedLogic } from "../hooks/useRoleBasedLogic";
import { ROLES } from "../../../constants/roles";
import { S37_BASE_URL } from "../../../constants/s37";
import {
  MAX_REFERENCE_LENGTH,
  BREADCRUMBS,
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
    setErrors,
    showErrorSummary,
    setShowErrorSummary,
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

  // Fetch role-based network operators using the updated endpoint
  const { coordinators } = useRoleBasedNetworkOperators();

  // Map coordinators to dropdown options
  const options = useCoordinatorOptions({
    coordinators,
    organisationId,
    organisationName,
  });

  // Role-based logic for filtering options and auto-selection
  const { filteredOptions } = useRoleBasedLogic({
    coordinators,
    options,
    setSelectedOrgName,
    setSelectedOrganisation,
    additionalContacts,
    setAdditionalContacts,
  });

  // Fetch application data on mount
  useEffect(() => {
    if (appId) {
      console.log('[NetworkOperatorDetails] Fetching application data for:', appId);
      fetchAndSetApplication(appId).then(() => {
        console.log('[NetworkOperatorDetails] Application fetched:', application);
        // If organization passed via state, update application_party
        if (stateOrgId && stateOrgName && application?.application_id) {
          console.log('[NetworkOperatorDetails] Updating with state org data:', {
            stateOrgId,
            stateOrgName
          });
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
    options: filteredOptions,
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
      handleOperatorChangeBase(e, filteredOptions);
    },
    [handleOperatorChangeBase, filteredOptions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
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
        
        // Navigate after successful creation
        if (app?.application_id) {
          navigate(
            `${S37_BASE_URL}/${app.application_id}/network-operator-contact-details`
          );
        }
      } else {
        // Prepare data for save operation
        const saveData = {
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
        };

        console.log('[NetworkOperatorDetails] Saving network operator data:', {
          saveData,
          selectedOrganisation,
          applicationParty,
        });

        // Wait for the save operation to complete before navigating
        const result = await useApplicationStore.getState().saveNetworkOperator(saveData);

        console.log('[NetworkOperatorDetails] Save result:', result);

        // Only navigate if the save was successful and we have an application ID
        if (result?.application?.application_id) {
          navigate(
            `${S37_BASE_URL}/${result.application.application_id}/network-operator-contact-details`
          );
        } else {
          // Handle case where save didn't return expected data
          console.error("Save operation did not return expected results", result);
          navigate(
            `${S37_BASE_URL}/${app.application_id}/network-operator-contact-details`
          );
        }
      }
    } catch (error) {
      console.error("Error saving network operator details:", error);
      // You may want to show an error message to the user here
      // For now, we'll stay on the current page to allow the user to try again
    }
  };

  return (
    <div className="govuk-width-container">
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
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Applicant details</h1>
            {/* Error summary */}
            {(showErrorSummary || emailInputError) && (
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
                        <a href={`#${err.includes('contact name') ? 'location' : 'networkOperatorRef'}`}>{err}</a>
                      </li>
                    ))}
                    {emailInputError && (
                      <li>
                        <a href="#emailAddress">{emailInputError}</a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              {/* Applicant contact name */}
              <div className={`govuk-form-group${
                errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                  ? " govuk-form-group--error"
                  : ""
              }`}>
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="location"
                >
                  Applicant contact name
                </label>
                <div id="location-hint" className="govuk-hint">
                  This person will be the designated contact for this application and all official correspondence will be addressed to them.
                </div>
                {errors.includes(FORM_ERRORS.MISSING_OPERATOR) && (
                  <p id="location-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    {FORM_ERRORS.MISSING_OPERATOR}
                  </p>
                )}
                <select
                  className={`govuk-select${
                    errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                      ? " govuk-select--error"
                      : ""
                  }`}
                  id="location"
                  name="location"
                  value={selectedOrgName}
                  onChange={handleOperatorChange}
                  aria-describedby={`location-hint${
                    errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                      ? " location-error"
                      : ""
                  }`}
                  aria-required="true"
                  aria-invalid={errors.includes(FORM_ERRORS.MISSING_OPERATOR)}
                >
                  <option value="">Select option...</option>
                  {filteredOptions.map((op: ApplicationParty, index: number) => (
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
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteContact(email);
                        }}
                        role="button"
                        aria-label={`Delete contact ${email}`}
                      >
                        Delete contact
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Additional contacts */}
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
                Additional contacts
              </h2>
              <div id="additional-contacts-hint" className="govuk-hint">
                You can add email addresses for anyone who should receive updates for this application.
              </div>
              <div className={`govuk-form-group${
                emailInputError ? " govuk-form-group--error" : ""
              }`}>
                <label
                  className="govuk-label govuk-label--s govuk-!-margin-bottom-2"
                  htmlFor="emailAddress"
                >
                  Email address (optional)
                </label>
                {emailInputError && (
                  <p id="emailAddress-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    {emailInputError}
                  </p>
                )}
                <input
                  className={`govuk-input${
                    emailInputError ? " govuk-input--error" : ""
                  }`}
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    if (emailInputError) clearEmailInputError();
                  }}
                  autoComplete="email"
                  aria-describedby={`additional-contacts-hint${
                    emailInputError ? " emailAddress-error" : ""
                  }`}
                  aria-invalid={!!emailInputError}
                />
              </div>
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={handleAddContact}
                style={{ marginBottom: "1rem" }}
              >
                Add another
              </button>

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
                  className="govuk-label govuk-label--s govuk-!-margin-bottom-2"
                  htmlFor="networkOperatorRef"
                >
                  Applicant's reference (optional)
                </label>
                {(errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                  errors.includes(FORM_ERRORS.INVALID_REFERENCE)) && (
                  <p id="networkOperatorRef-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
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
                  onChange={(e) => {
                    setNetworkOperatorRef(e.target.value);
                    // Clear errors when user starts typing
                    if (errors.length > 0) {
                      const filteredErrors = errors.filter(
                        (error) => 
                          error !== FORM_ERRORS.MISSING_REFERENCE &&
                          error !== FORM_ERRORS.INVALID_REFERENCE
                      );
                      if (filteredErrors.length !== errors.length) {
                        setErrors(filteredErrors);
                        if (filteredErrors.length === 0) {
                          setShowErrorSummary(false);
                        }
                      }
                    }
                  }}
                  aria-describedby={`${
                    errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                    errors.includes(FORM_ERRORS.INVALID_REFERENCE)
                      ? "networkOperatorRef-error"
                      : ""
                  }`}
                  aria-invalid={errors.includes(FORM_ERRORS.MISSING_REFERENCE) || errors.includes(FORM_ERRORS.INVALID_REFERENCE)}
                />
              </div>

              <details className="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    What to do when an applicant is not listed
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
                      href="mailto:xxx@desnz.com"
                    >
                      xxx@desnz.com
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
