import React from "react";
import { S37_BASE_URL } from "../../../constants/s37";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import ConsultationSummaryCard from "../components/SummaryCard";
import { useConsultationDetails } from "../../../hooks/useConsultationDetails";
import { useAuthUser } from "../../../hooks/useAuthUser";
const ConsultationDetailsPage: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();

    const { consultations } = useConsultationDetails(
      applicationId,
      user?.user_id
    );
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
          <h1 className="govuk-heading-xl">Manage consultations</h1>
          <p className="govuk-body">
            You must send a consultation request to every organisation shown on this page.
          </p>
          <div className="govuk-body">
            <p>For each organisation you must:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>send a request (or show that you have sent a request)</li>
              <li>
                upload any response received
              </li>
            </ul>
            <p>For Natural England, you can mark the consultation as 'Not required' and you will be asked to explain why it is not required.</p>
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
              dateRequestCreated={consultation.dateRequestCreated ?? undefined}
              dateClosed={consultation.dateClosed ?? undefined}
              objectionRaised={consultation.objectionRaised}
              closeComments={consultation.closeComments}
              responseDocuments={consultation.responseDocuments}
              respondingConsulteeName={consultation.respondingConsulteeName}
              respondingConsulteeEmail={consultation.respondingConsulteeEmail}
              notRequiredMessage={consultation.notRequiredReason}
              notRequiredDocs={consultation.notRequiredDocs}
              consultationRequestDocs={consultation.consultationRequestDocs}
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
