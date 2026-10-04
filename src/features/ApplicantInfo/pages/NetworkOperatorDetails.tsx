import React, { useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApplication } from "../../../hooks/useApplication";
import { applicationApiService } from "../../../services/applicationApiService";
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
import { S37_BASE_URL } from "../../../constants/s37";
import "../../../styles/ApplicantDetails.css";
import {
  MAX_REFERENCE_LENGTH,
  BREADCRUMBS,
  FORM_ERRORS,
} from "../constants/networkOperatorDetails";
import PageTitle from "../../../components/PageTitle";
import Details from "../../../components/Details";
import RevealAnnouncement from "../../../components/commonFormFields/RevealAnnouncement";
import AccessibleSelect from "../../../components/commonFormFields/AccessibleSelect";
import { useBreadcrumb } from "../../../context/BreadcrumbContext";

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
  const { application, setApplication, fetchApplication, createNewApplication } = useApplication();
  const applicationParty = application?.application_party;

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
    contactStatus,
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
      fetchApplication(appId).then(() => {
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
          status: "DRAFT",
          created_by: created_by,
        };
        app = await createNewApplication(newAppData);
        
        if (app?.application_id) {
          navigate(
            `${S37_BASE_URL}/${app.application_id}/network-operator-contact-details`,
            { replace: true }
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

        // Wait for the save operation to complete before navigating
        const result = await applicationApiService.saveNetworkOperator(saveData);


        if (result?.application?.application_id) {
          navigate(
            `${S37_BASE_URL}/${result.application.application_id}/network-operator-contact-details`,
            { replace: true }
          );
        } else {
          // Handle case where save didn't return expected data
          navigate(
            `${S37_BASE_URL}/${app.application_id}/network-operator-contact-details`,
            { replace: true }
          );
        }
      }
    } catch (error) {
      // You may want to show an error message to the user here
      // For now, we'll stay on the current page to allow the user to try again
    }
  };

  useBreadcrumb(
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
  );

  return (
    <>
      <PageTitle title="Applicant details" />
            <div className="govuk-width-container">
      <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Applicant details</h1>
            {/* Error summary removed as per request. Field-level errors remain. */}
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
                  <p id="location-error" className="govuk-error-message" role="alert">
                    <span className="govuk-visually-hidden">Error:</span>
                    {FORM_ERRORS.MISSING_CONTACT_NAME}
                  </p>
                )}
                <AccessibleSelect
                  error={errors.includes(FORM_ERRORS.MISSING_OPERATOR)}
                  id="location"
                  value={selectedOrgName}
                  onChange={(value) =>
                    handleOperatorChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  aria-describedby={`location-hint${
                    errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                      ? " location-error"
                      : ""
                  }`}
                  required
                  options={[
                    { value: "", text: "Select option..." },
                    ...filteredOptions.map((op: ApplicationParty) => ({
                      value: op.person_name || "",
                      text: op.person_name || "",
                    })),
                  ]}
                />
                <RevealAnnouncement
                  announceOnLoad
                  shown={filteredOptions.length > 0}
                  message={`${filteredOptions.length} applicant contact${filteredOptions.length === 1 ? "" : "s"} available in Applicant contact name.`}
                />
                <RevealAnnouncement
                  shown={Boolean(selectedOrgName)}
                  message={`Selected applicant contact ${selectedOrgName}. You can add additional contacts below.`}
                />
              </div>
              <div
                className="govuk-visually-hidden"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {contactStatus}
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
                      <button
                        type="button"
                        className="govuk-link govuk-link--no-visited-state additional-contact__delete-link"
                        onClick={() => handleDeleteContact(email)}
                        aria-label={`Delete contact ${email}`}
                      >
                        Delete contact
                      </button>
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
                  <p id="emailAddress-error" className="govuk-error-message" role="alert">
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
                  errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG)
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
                {errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG) && (
                  <p id="networkOperatorRef-error" className="govuk-error-message" role="alert">
                    <span className="govuk-visually-hidden">Error:</span>
                    {FORM_ERRORS.REFERENCE_TOO_LONG}
                  </p>
                )}
                <input
                  className={`govuk-input${
                    errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG)
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
                    // Clear reference length error when user is editing
                    if (errors.length > 0 && errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG)) {
                      const filteredErrors = errors.filter(
                        (error) => error !== FORM_ERRORS.REFERENCE_TOO_LONG
                      );
                      setErrors(filteredErrors);
                      if (filteredErrors.length === 0) {
                        setShowErrorSummary(false);
                      }
                    }
                  }}
                  aria-describedby={`${
                    errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG)
                      ? "networkOperatorRef-error"
                      : ""
                  }`}
                  aria-invalid={errors.includes(FORM_ERRORS.REFERENCE_TOO_LONG)}
                />
              </div>

              <Details id="applicant-not-listed" summary="What to do when an applicant is not listed">
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
              </Details>

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
      </div>
    </>
  );
};

export default NetworkOperatorDetails;
