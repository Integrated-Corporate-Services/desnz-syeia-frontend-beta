import React, { useState, useEffect } from "react";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { useContactConfirmation } from "../hooks/useContactConfirmation";

const TLP_BASE_URL = "/tlp";
import { useContactDetailsSubmit } from "../hooks/useContactDetailsSubmit";
import { formatContactDetails } from "../utils/contactDetailsFormatter";
import { ContactDetailsSummary } from "../components/ContactDetailsSummary";
import { ContactConfirmationRadios } from "../components/ContactConfirmationRadios";
import { BREADCRUMBS, LABELS } from "../constants/contactDetailsConstants";

const NetworkOperatorContactDetails: React.FC = () => {
  const [error, setError] = useState<string>("");

  const application = useApplicationStore((state) => state.application);
  const fetchAndSetApplication = useApplicationStore(
    (state) => state.fetchAndSetApplication
  );
  const appId = useGetApplicationId();
  const party = application?.application_party;

  // Fetch application data on mount
  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  // Contact confirmation state
  const { contactIsConfirmed, setContactIsConfirmed } =
    useContactConfirmation(application);

  // Form submission handler
  const { handleSubmit } = useContactDetailsSubmit({
    application,
    party,
    appId,
    contactIsConfirmed,
    setError,
  });

  // Format contact details for display
  const contactDetails = formatContactDetails(party);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item" aria-current="false">
              <Link
                className="govuk-breadcrumbs__link"
                to={`${TLP_BASE_URL}/${appId}/task-list`}
              >
                {BREADCRUMBS.TASK_LIST}
              </Link>
            </li>
            <li className="govuk-breadcrumbs__list-item" aria-current="true">
              {BREADCRUMBS.CHECK_CONTACT_DETAILS}
            </li>
          </ol>
        </nav>

        <h1 className="govuk-heading-xl">{LABELS.PAGE_TITLE}</h1>

        {error && (
          <div
            className="govuk-error-summary"
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

        <form onSubmit={handleSubmit} noValidate>
          <ContactDetailsSummary contactDetails={contactDetails} />

          <ContactConfirmationRadios
            contactIsConfirmed={contactIsConfirmed}
            setContactIsConfirmed={setContactIsConfirmed}
            setError={setError}
          />

          <div className="govuk-!-static-margin-top-6">
            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
            >
              {LABELS.CONTINUE}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkOperatorContactDetails;
