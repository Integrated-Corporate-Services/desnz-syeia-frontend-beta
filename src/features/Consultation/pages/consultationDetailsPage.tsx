import React, { useEffect, useState } from "react";
import { ConsultationDetails } from "../../../types/ConsultationDetails";
import { Link } from "react-router-dom";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import ConsultationSummaryCard from "../components/SummaryCard";
import { fetchConsultationDetails } from "../../../services/consultationService";
import { useAuthUser } from "../../../hooks/useAuthUser";


const ConsultationDetailsPage: React.FC = () => {
  // Get applicationId from store, params, or query string
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();

  const [consultations, setConsultations] = useState<ConsultationDetails[]>([]);

  useEffect(() => {
    console.log('Fetching consultation details for applicationId:', applicationId, 'and user:', user);
    if (applicationId && user?.user_id) {
      fetchConsultationDetails(applicationId, user.user_id)
        .then((data) => {
          setConsultations(Array.isArray(data) ? data : []);
          console.log('Consultation details response:', data);
        })
        .catch((err) => {
          console.error('Failed to fetch consultation details:', err);
        });
    }
  }, [applicationId, user]);

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link to={`/task-list?id=${applicationId}`} className="govuk-breadcrumbs__link">Task list</Link>
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
              <li>upload a response if a consultation has already taken place;</li>
              <li>or indicate a consultation is not required</li>
            </ul>
          </div>

          {consultations.map((consultation) => (
            <ConsultationSummaryCard
              key={consultation.id}
              orgName={consultation.consulteeOrganisationName}
              consultationName={consultation.otherConsultee || consultation.consulteeOrganisationName}
              status={consultation.status}
              consultationId={consultation.id}
              applicationId={applicationId}
              dateRequestCreated={consultation.lastUpdatedAt ?? undefined}
            />
          ))}

          <Link to={`/task-list?id=${applicationId}`} className="govuk-button govuk-button--secondary">Go back to task list</Link>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailsPage;

