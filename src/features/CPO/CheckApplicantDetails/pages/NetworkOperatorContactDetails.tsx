import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useApplication } from "../../../../hooks/useApplication";
import { useContactConfirmation } from "../hooks/useContactConfirmation";
import { useContactDetailsSubmit } from "../hooks/useContactDetailsSubmit";
import { formatContactDetails } from "../utils/contactDetailsFormatter";
import { ContactDetailsSummary } from "../components/ContactDetailsSummary";
import { ContactConfirmationRadios } from "../components/ContactConfirmationRadios";
import { LABELS } from "../constants/contactDetailsConstants";
import PageTitle from "../../../../components/PageTitle";

const CPO_BASE_URL = "/cpo";

const NetworkOperatorContactDetails: React.FC = () => {
  const [error, setErrorState] = useState<string>("");
  const [errorTick, setErrorTick] = useState(0);
  const setError = useCallback((message: string) => {
    setErrorState(message);
    if (message) setErrorTick((t) => t + 1);
  }, []);
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { application, fetchApplication } = useApplication();
  const appId = useGetApplicationId();
  const party = application?.application_party;
  const [ready, setReady] = useState(false);
  const changeUrl = `${CPO_BASE_URL}/${appId}/applicant-details${location.search}`;

  // Fetch application data on mount and when navigating to this page
  useEffect(() => {
    let active = true;
    setReady(false);
    fetchApplication(appId).then(saved => {
      if (!active) return;
      if (saved.type !== 'CPO' || saved.status?.toLowerCase() !== 'draft' || saved.permissions?.canEdit === false) throw new Error('Application cannot be updated');
      setReady(true);
    }).catch(() => { if (active) setError('Unable to load this application. Refresh the page to try again.'); });
    return () => { active = false; };
  }, [appId, fetchApplication, location.key, setError]);

  const { contactIsConfirmed, setContactIsConfirmed } =
    useContactConfirmation(application);

  const { handleSubmit, saving } = useContactDetailsSubmit({
    application,
    party,
    appId,
    contactIsConfirmed,
    setError,
  });

  // Format contact details for display
  const contactDetails = formatContactDetails(party);

  useEffect(() => {
    if (error) {
      errorSummaryRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorTick]);

return (
    <>
      <PageTitle title="Check applicant contact details" />
      <div className="govuk-width-container">
      <Link className="govuk-back-link govuk-!-margin-bottom-6" to={changeUrl}>Back</Link>
      <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

        {error && (
          <div
            ref={errorSummaryRef}
            className="govuk-error-summary"
            data-module="govuk-error-summary"
            tabIndex={-1}
            role="alert"
            aria-labelledby="contact-details-error-summary-title"
          >
            <h2 className="govuk-error-summary__title" id="contact-details-error-summary-title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li><a href="#contactIsConfirmed-yes">{error}</a></li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={event => { event.preventDefault(); if (ready) void handleSubmit(event); }} noValidate>
          <ContactDetailsSummary contactDetails={contactDetails} additionalContacts={party?.additional_contact || ''} reference={application?.operator_ref} changeUrl={ready ? changeUrl : undefined} />

          <fieldset className="govuk-fieldset" disabled={!ready || saving}>
          <ContactConfirmationRadios
            contactIsConfirmed={contactIsConfirmed}
            setContactIsConfirmed={setContactIsConfirmed}
            setError={setError}
          />
          </fieldset>

          <div className="govuk-!-static-margin-top-6">
            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
              disabled={!ready || saving}
            >
              {LABELS.CONTINUE}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </>
  );
};

export default NetworkOperatorContactDetails;
