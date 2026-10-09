import React, { useEffect, useCallback, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useApplication } from "../../../../hooks/useApplication";
import { applicationApiService } from "../../../../services/applicationApiService";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useRoleBasedNetworkOperators } from "../hooks/useRoleBasedNetworkOperators";
import { useAdditionalContacts } from "../hooks/useAdditionalContacts";
import { useNetworkOperatorForm } from "../hooks/useNetworkOperatorForm";
import { useApplicationSync } from "../hooks/useApplicationSync";
import { useCoordinatorOptions } from "../hooks/useCoordinatorOptions";
import { useRoleBasedLogic } from "../hooks/useRoleBasedLogic";
import { createLogger } from "../../../../utils/logger";
import PageTitle from "../../../../components/PageTitle";
import Details from "../../../../components/Details";
import CoordinatorCombobox from "../components/CoordinatorCombobox";
import "../../../../styles/ApplicantDetails.css";

const logger = createLogger('NetworkOperatorDetails');

const CPO_BASE_URL = "/cpo";

import {
  MAX_REFERENCE_LENGTH,
  FORM_ERRORS,
} from "../constants/networkOperatorDetails";

const NetworkOperatorDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appId = useGetApplicationId();
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const [submitFailTick, setSubmitFailTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { application, fetchApplication } = useApplication();

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
    contactStatus,
    getContactsForSubmit,
  } = useAdditionalContacts();

  const organisationId =
    application?.application_party?.organisation_id;
  const organisationName =
    application?.application_party?.organisation_name || "";

  const { coordinators } = useRoleBasedNetworkOperators();

  const options = useCoordinatorOptions({
    coordinators,
    organisationId,
    organisationName,
  });

  const { filteredOptions } = useRoleBasedLogic({
    coordinators,
    options,
    setSelectedOrgName,
    setSelectedOrganisation,
    additionalContacts,
    setAdditionalContacts,
  });

  useEffect(() => {
    if (showErrorSummary || emailInputError || saveError) {
      errorSummaryRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitFailTick, emailInputError, saveError]);

  useEffect(() => {
    let active = true;
    setReady(false);
    setSaveError('');
    fetchApplication(appId).then(saved => {
      if (!active) return;
      if (saved.type !== 'CPO' || saved.status?.toLowerCase() !== 'draft' || saved.permissions?.canEdit === false) throw new Error('This CPO application cannot be updated.');
      setReady(true);
    }).catch(() => { if (active) setSaveError('Unable to load this application. Refresh the page to try again.'); });
    return () => { active = false; };
  }, [appId, fetchApplication]);

  useEffect(() => {
    if (ready && location.hash) document.getElementById(location.hash.slice(1))?.focus();
  }, [ready, location.hash]);


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

  const handleOperatorChange = useCallback(
    (selectedName: string) => {
      handleOperatorChangeBase(selectedName, filteredOptions);
    },
    [handleOperatorChangeBase, filteredOptions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || saving || !application) return;
    const valid = validateForm();
    const contacts = getContactsForSubmit();
    if (!valid || !contacts) {
      setSubmitFailTick((t) => t + 1);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await applicationApiService.saveNetworkOperator({
          application_id: appId,
          operator_ref: networkOperatorRef.trim(),
          organisation_id: selectedOrganisation?.organisation_id,
          person_id: selectedOrganisation?.person_id,
          contact_id: selectedOrganisation?.contact_id,
          role: "APPLICANT", 
          is_primary: true,
          contact_isconfirmed: null,
          type: 'CPO',
          additional_contact: contacts.join(',') || null,
      });
      navigate(`${CPO_BASE_URL}/${appId}/network-operator-contact-details${location.search}`);
    } catch (error) {
      logger.error('Failed to save network operator:', error);
      setSaveError('Unable to save the applicant details. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle title="Applicant details" />
            <div className="govuk-width-container">
              <Link className="govuk-back-link govuk-!-margin-bottom-6" to={`${CPO_BASE_URL}/who-is-applying?applicationId=${appId}`}>Back</Link>
              <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Applicant details</h1>
            {(showErrorSummary || emailInputError || saveError) && (
              <div
                ref={errorSummaryRef}
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
                aria-labelledby="applicant-details-error-summary-title"
              >
                <h2 className="govuk-error-summary__title" id="applicant-details-error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {saveError && <li><a href="#location">{saveError}</a></li>}
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
              <div
                className={`govuk-form-group${
                  errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                    ? " govuk-form-group--error"
                    : ""
                }`}
              >
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="location"
                  id="location-label"
                >
                  Applicant contact name
                </label>
                <div id="location-hint" className="govuk-hint">
                  We will send all official letters about this application to this person.
                </div>
                {errors.includes(FORM_ERRORS.MISSING_OPERATOR) && (
                  <p id="location-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span>
                    {FORM_ERRORS.MISSING_OPERATOR}
                  </p>
                )}
                <CoordinatorCombobox
                  id="location"
                  labelId="location-label"
                  describedBy={`location-hint${
                    errors.includes(FORM_ERRORS.MISSING_OPERATOR)
                      ? " location-error"
                      : ""}`}
                  value={selectedOrgName}
                  options={filteredOptions.flatMap((option, index) =>
                    option.person_name
                      ? [{
                          id: `${option.organisation_id || "no-org"}-${option.person_name}-${index}`,
                          label: option.person_name,
                          value: option.person_name,
                        }]
                      : [],
                  )}
                  onChange={handleOperatorChange}
                  error={errors.includes(FORM_ERRORS.MISSING_OPERATOR)}
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
                Add email addresses for anyone else who should get updates about this application, for example your law firm.
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
                <div className="govuk-hint" id="networkOperatorRef-hint">Your own reference for this order, if you have one. It shows on your applications list.</div>
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
                  aria-describedby={`networkOperatorRef-hint ${
                    errors.includes(FORM_ERRORS.MISSING_REFERENCE) ||
                    errors.includes(FORM_ERRORS.INVALID_REFERENCE)
                      ? "networkOperatorRef-error"
                      : ""
                  }`}
                  aria-invalid={errors.includes(FORM_ERRORS.MISSING_REFERENCE) || errors.includes(FORM_ERRORS.INVALID_REFERENCE)}
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
                    href="mailto:SYEIA.enquiries@energysecurity.gov.uk"
                  >
                    SYEIA.enquiries@energysecurity.gov.uk
                  </a>
                </p>
              </Details>

              {/* Call to action buttons */}
              <div className="govuk-!-static-margin-top-6">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  disabled={!ready || saving}
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