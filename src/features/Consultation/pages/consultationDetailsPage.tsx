import React, { useEffect } from "react";
import { S37_BASE_URL } from "../../../constants/s37";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import ConsultationSummaryCard from "../components/SummaryCard";
import { useConsultationDetails } from "../../../hooks/useConsultationDetails";
import { useAuthUser } from "../../../hooks/useAuthUser";
import { withdrawConsultationRequest } from "../../../services/consultationService";
import log from "../../../logger";

const ConsultationDetailsPage: React.FC = () => {
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

    const { consultations, refetch } = useConsultationDetails(
      applicationId,
      user?.user_id
    );

  // Separate consultations into regular and OTHER types
  const regularConsultations = consultations.filter(c => c.consultationType !== 'OTHER');
  const otherConsultations = consultations.filter(c => c.consultationType === 'OTHER');

  const handleRemoveConsultation = async (consultationId: string) => {
    if (!window.confirm('Are you sure you want to remove this consultation?')) {
      return;
    }

    try {
      if (!user?.user_id) {
        log.error('[ConsultationDetailsPage] No user ID available');
        return;
      }
      
      await withdrawConsultationRequest({
        applicationId,
        consultationId,
        updatedBy: user.user_id
      });
      
      log.info('[ConsultationDetailsPage] Consultation removed successfully');
      
      // Refresh consultations
      await refetch();
    } catch (error) {
      log.error('[ConsultationDetailsPage] Error removing consultation:', error);
      alert('Failed to remove consultation. Please try again.');
    }
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

          {/* Regular consultations */}
          {regularConsultations.map((consultation) => (
            <ConsultationSummaryCard
              key={consultation.id}
              orgName={consultation.consulteeOrganisationName}
              consultationName={
                consultation.otherConsultee ||
                consultation.consulteeOrganisationName ||
                consultation.consultationType
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
              evidenceResponseNotReceivedDocs={consultation.evidenceResponseNotReceivedDocs}
            />
          ))}

          {/* Other consultations section */}
          <h2 className="govuk-heading-m govuk-!-margin-top-6">Other consultations</h2>
          <p className="govuk-body">You can add and remove any consultations in this optional section.</p>
          
          {otherConsultations.map((consultation) => (
            <ConsultationSummaryCard
              key={consultation.id}
              orgName={consultation.consulteeOrganisationName}
              consultationName={
                consultation.otherConsultee ||
                consultation.consulteeOrganisationName ||
                consultation.consultationType
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
              evidenceResponseNotReceivedDocs={consultation.evidenceResponseNotReceivedDocs}
              consultationType={consultation.consultationType}
              onRemove={() => handleRemoveConsultation(consultation.id)}
            />
          ))}

          <div className="govuk-!-margin-bottom-6 ">
            <Link
              to={`${S37_BASE_URL}/${applicationId}/consultation/select-other-consultations`}
              className="govuk-button govuk-button--secondary "
            >
              Add more consultations
            </Link>
          </div>
          
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button" data-module="govuk-button">
              Save and continue
            </button>
            <Link
              to={`${S37_BASE_URL}/${applicationId}/task-list`}
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              Save for later
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailsPage;
