import React, { useState } from "react";
import { S37_BASE_URL } from "../../../constants/s37";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { useDerivedLpas } from "../../../hooks/useDerivedLpas";
import { useConsultationDetails } from "../../../hooks/useConsultationDetails";
import ConsultationSummaryCard from "../components/SummaryCard";
import LpaSelector, { Lpa } from "../../../components/LpaSelector";
import log from "../../../logger";

const ConsultationDetailsPage: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();

  const [selectedLpas, setSelectedLpas] = useState<Lpa[]>([]);

  const { derivedLpas } = useDerivedLpas(applicationId);
  const { consultations } = useConsultationDetails(
    applicationId,
    user?.user_id
  );

  const handleLpaSelect = (lpa: Lpa | null) => {
    // Add to array if not already present
    if (lpa && !selectedLpas.some((s) => s.lpa_code === lpa.lpa_code)) {
      setSelectedLpas((prev) => [...prev, lpa]);
      log.debug("LPA added:", lpa.lpa_name, lpa.lpa_code);
      // TODO: Later integrate with consultation creation
      // This could trigger creation of a new consultation with this LPA
    }
  };

  const handleLpaRemove = (lpaCode: string) => {
    setSelectedLpas((prev) => prev.filter((lpa) => lpa.lpa_code !== lpaCode));
    log.debug("LPA removed:", lpaCode);
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
              className="govuk-breadcrumbs__link"
            >
              Task list
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            Consultation details
          </li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Consultation details</h1>
          <p className="govuk-body">
            Review and complete the required consultations for your application.
          </p>
          <div className="govuk-body">
            <p>For each organisation you must:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>start a consultation if one hasn’t been started;</li>
              <li>
                upload a response if a consultation has already taken place;
              </li>
              <li>or indicate a consultation is not required</li>
            </ul>
          </div>

          {/* Show derived LPAs from parishes */}
          {derivedLpas.length > 0 && (
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <h3 className="govuk-heading-s">
                Local Planning Authorities derived from selected parishes
              </h3>
              <ul className="govuk-list govuk-list--bullet">
                {derivedLpas.map((lpa) => (
                  <li key={lpa.lpa_code}>{lpa.lpa_name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* LPA Selector Component - easily movable to other pages */}
          <div className="govuk-!-margin-bottom-6">
            <LpaSelector
              selectedLpaCodes={selectedLpas.map((lpa) => lpa.lpa_code)}
              onLpaSelect={handleLpaSelect}
              onRemove={handleLpaRemove}
              showRemoveButton={true}
              showCheckbox={true}
            />
          </div>

          {consultations.map((consultation) => (
            <ConsultationSummaryCard
              key={consultation.id}
              orgName={consultation.consulteeOrganisationName}
              consultationName={
                consultation.otherConsultee ||
                consultation.consulteeOrganisationName
              }
              status={consultation.status}
              consultationId={consultation.id}
              applicationId={applicationId}
              dateRequestCreated={consultation.lastUpdatedAt ?? undefined}
              dateClosed={consultation.dateClosed ?? undefined}
              objectionRaised={consultation.objectionRaised}
              closeComments={consultation.closeComments}
              responseDocuments={consultation.responseDocuments}
              respondingConsulteeName={consultation.respondingConsulteeName}
              respondingConsulteeEmail={consultation.respondingConsulteeEmail}
              notRequiredMessage={consultation.notRequiredReason}
              notRequiredDocs={consultation.notRequiredDocs}
            />
          ))}

          <Link
            to={`${S37_BASE_URL}/${applicationId}/task-list`}
            className="govuk-button govuk-button--secondary"
          >
            Go back to task list
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailsPage;
