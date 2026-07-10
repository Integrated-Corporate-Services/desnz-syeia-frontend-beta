import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { S37_BASE_URL } from "../../../constants/s37";
import { useApplication } from "../../../hooks/useApplication";
import { useContactConfirmation } from "../hooks/useContactConfirmation";
import { useContactDetailsSubmit } from "../hooks/useContactDetailsSubmit";
import { formatContactDetails } from "../utils/contactDetailsFormatter";
import { ContactDetailsSummary } from "../components/ContactDetailsSummary";
import { ContactConfirmationRadios } from "../components/ContactConfirmationRadios";
import { BREADCRUMBS, LABELS } from "../constants/contactDetailsConstants";
import SkipLink from "../../../components/SkipLink";

const NetworkOperatorContactDetails: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [version, setVersion] = useState<number>(1);
  const [versionError, setVersionError] = useState<string>("");

  const { application, fetchApplication } = useApplication();
  const appId = useGetApplicationId();
  const party = application?.application_party;

  // Fetch application data on mount
  useEffect(() => {
    if (appId) {
      setError("");
      setVersionError("");
      fetchApplication(appId);
    }
  }, [appId, fetchApplication]);

  // Load version from application_party
  useEffect(() => {
    if (application?.application_party?.version) {
      setVersion(application.application_party.version);
    }
  }, [application]);

  // Contact confirmation state
  const { contactIsConfirmed, setContactIsConfirmed } =
    useContactConfirmation(application);

  // Form submission handler
  const { handleSubmit } = useContactDetailsSubmit({
    application,
    appId,
    contactIsConfirmed,
    setError,
    version,
    setVersion,
    setVersionError,
  });

  // Format contact details for display
  const contactDetails = formatContactDetails(party);

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link
                className="govuk-breadcrumbs__link"
                to={`${S37_BASE_URL}/${appId}/task-list`}
              >
                {BREADCRUMBS.TASK_LIST}
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="true">
              {BREADCRUMBS.CHECK_CONTACT_DETAILS}
            </li>
          </ol>
        </nav>
        <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content">
        <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l">{LABELS.PAGE_TITLE}</h1>

        {error && (
          <div
            className="govuk-error-summary govuk-!-width-two-thirds"
            data-module="govuk-error-summary"
            tabIndex={-1}
            role="alert"
          >
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{error}</li>
              </ul>
            </div>
          </div>
        )}
        {/* Version conflict error */}
            {versionError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                role="alert"
                tabIndex={-1}
              >
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <div dangerouslySetInnerHTML={{ __html: versionError }} />
                </div>
              </div>
            )}

        <form onSubmit={handleSubmit} noValidate>
          <ContactDetailsSummary contactDetails={contactDetails} />

          <ContactConfirmationRadios
            contactIsConfirmed={contactIsConfirmed}
            setContactIsConfirmed={setContactIsConfirmed}
            setError={setError}
          />

          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
          >
            {LABELS.CONTINUE}
          </button>
        </form>
      </div>
      </div>
      </main>
      </div>
    </>
  );
};

export default NetworkOperatorContactDetails;
