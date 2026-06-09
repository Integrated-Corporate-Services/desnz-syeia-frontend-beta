import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { useGetApplicationId } from "../../../hooks/useGetApplicationId";
import { withdrawConsultationRequest } from "../../../services/consultationService";
import { useAuthUser } from "../../../hooks/useAuthUser";

const ConsultationWithdrawnPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = useGetApplicationId();
  const { user } = useAuthUser();
  const consultationId = params.consultationId || "";

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWithdraw = async () => {
    try {
      await withdrawConsultationRequest({
        applicationId,
        consultationId,
        updatedBy: user?.user_id || "",
      });
      // Redirect or show success message as needed
      navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
    } catch (err: any) {
      // Optionally show error
      alert(err.message || "Failed to withdraw consultation");
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">
              Are you sure you want to withdraw this request?
            </h1>
            <p className="govuk-body govuk-!-margin-bottom-8">
              This will mark the consultation as withdrawn. The consultation pack will be deleted, but evidence of the request and any responses will be preserved for historical records.
            </p>
            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button govuk-button--secondary"
                onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`)}
              >
                Go back to consultation request
              </button>
              <button
                type="button"
                className="govuk-button govuk-button--warning"
                onClick={handleWithdraw}
              >
                Withdraw request
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultationWithdrawnPage;
