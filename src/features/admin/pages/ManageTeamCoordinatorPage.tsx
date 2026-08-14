import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTeamCoordinator } from "../../../hooks";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";

const ManageTeamCoordinatorPage: React.FC = () => {
  const { organisationId, coordinatorId } = useParams<{
    organisationId: string;
    coordinatorId: string;
  }>();
  const navigate = useNavigate();

  const { coordinator, loading, error } = useTeamCoordinator(
    organisationId,
    coordinatorId
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError("");
      // In a real implementation, you would collect form changes and call updateCoordinator
      // For now, just navigate back
      navigate(`/admin/organisations/${organisationId}/team-coordinators`);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <LoadingSkeleton type="summary" />
          </main>
        </div>
      </>
    );
  }

  if (error || !coordinator) {
    return (
      <>
                <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <Link
                to={`/admin/organisations/${organisationId}/team-coordinators`}
                className="govuk-back-link"
              >
                Back
              </Link>
              <div
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
              >
                <h2
                  className="govuk-error-summary__title"
                  id="error-summary-title"
                >
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">
                    {error || "Team coordinator not found"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      </>
    );
  }

  return (
    <>
            <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <Link
              to={`/admin/organisations/${organisationId}/team-coordinators`}
              className="govuk-back-link"
            >
              Back
            </Link>

            <h1 className="govuk-heading-l govuk-!-margin-top-6">
              Manage team coordinator
            </h1>

            {saveError && (
              <div
                className="govuk-error-summary"
                aria-labelledby="error-summary-title"
                role="alert"
                tabIndex={-1}
              >
                <h2
                  className="govuk-error-summary__title"
                  id="error-summary-title"
                >
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{saveError}</p>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-top-6">
              Team coordinator details
            </h2>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Name</dt>
                <dd className="govuk-summary-list__value">
                  {coordinator.first_name} {coordinator.last_name}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Email address</dt>
                <dd className="govuk-summary-list__value">
                  {coordinator.email}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="#">
                    Change
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Phone number</dt>
                <dd className="govuk-summary-list__value">
                  {coordinator.phone_number || "Not provided"}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="#">
                    Change
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Location</dt>
                <dd className="govuk-summary-list__value">
                  {coordinator.town_city || "Not provided"}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="#">
                    Change
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Team coordinator address
                </dt>
                <dd className="govuk-summary-list__value">
                  {coordinator.address_line1 ? (
                    <>
                      {coordinator.address_line1}
                      <br />
                      {coordinator.address_line2 && (
                        <>
                          {coordinator.address_line2}
                          <br />
                        </>
                      )}
                      {coordinator.town_city && (
                        <>
                          {coordinator.town_city}
                          <br />
                        </>
                      )}
                      {coordinator.postcode}
                    </>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className="govuk-button govuk-!-margin-top-6"
              style={{ backgroundColor: "#00703c" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ManageTeamCoordinatorPage;
